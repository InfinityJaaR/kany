import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com'

export type PayPalMode = 'simulated' | 'sandbox'
export type PayPalOrderType = 'campaign' | 'site_support'

export interface CreatePayPalOrderInput {
  amount: string
  currency: string
  type: PayPalOrderType
  campaignId?: string
  campaignTitle?: string
  returnUrl: string
  cancelUrl: string
}

export interface SimulatedOrderPayload {
  orderId: string
  amount: string
  currency: string
  type: PayPalOrderType
  campaignId?: string
  campaignTitle?: string
  returnUrl: string
  cancelUrl: string
  exp: number
}

interface PayPalTokenResponse {
  access_token: string
}

interface PayPalCreateOrderResponse {
  id: string
  status: string
  links?: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalCaptureResponse {
  id: string
  status: string
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id: string; status: string }>
    }
  }>
}

export interface UnifiedOrderResult {
  id: string
  status: string
  mode: PayPalMode
  approvalUrl: string | null
  token?: string
  description?: string
}

export interface UnifiedCaptureResult {
  orderId: string
  status: string
  mode: PayPalMode
  type: PayPalOrderType
  amount: string
  currency: string
  campaignId?: string
  campaignTitle?: string
  captureId?: string | null
}

function getSigningSecret() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.PAYPAL_CLIENT_SECRET ??
    'kany-paypal-simulated-dev-secret'
  )
}

export function getPayPalMode(): PayPalMode {
  const mode = process.env.PAYPAL_MODE?.toLowerCase()
  return mode === 'sandbox' ? 'sandbox' : 'simulated'
}

function getRequiredEnv(name: 'PAYPAL_CLIENT_ID' | 'PAYPAL_CLIENT_SECRET') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOrderDescription(input: CreatePayPalOrderInput) {
  return input.type === 'campaign'
    ? `Donación para campaña${input.campaignTitle ? `: ${input.campaignTitle}` : ''}`
    : 'Donación para apoyar la plataforma Kany'
}

function signPayload(payload: SimulatedOrderPayload) {
  const payloadJson = JSON.stringify(payload)
  const payloadB64 = Buffer.from(payloadJson).toString('base64url')
  const signature = createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url')
  return `${payloadB64}.${signature}`
}

export function verifySimulatedOrderToken(token: string): SimulatedOrderPayload {
  const [payloadB64, signature] = token.split('.')

  if (!payloadB64 || !signature) {
    throw new Error('Invalid simulated order token')
  }

  const expectedSignature = createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url')

  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new Error('Invalid simulated order signature')
  }

  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as SimulatedOrderPayload

  if (payload.exp < Date.now()) {
    throw new Error('Simulated order token expired')
  }

  return payload
}

export function decodeSimulatedOrderToken(token: string): SimulatedOrderPayload {
  return verifySimulatedOrderToken(token)
}

async function requestPayPal<T>(path: string, init: RequestInit) {
  const response = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PayPal request failed (${response.status}): ${detail}`)
  }

  return (await response.json()) as T
}

export async function getPayPalAccessToken() {
  const clientId = getRequiredEnv('PAYPAL_CLIENT_ID')
  const clientSecret = getRequiredEnv('PAYPAL_CLIENT_SECRET')
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PayPal auth failed (${response.status}): ${detail}`)
  }

  const data = (await response.json()) as PayPalTokenResponse
  return data.access_token
}

export async function createPayPalOrder(input: CreatePayPalOrderInput) {
  const accessToken = await getPayPalAccessToken()
  const description = getOrderDescription(input)

  return requestPayPal<PayPalCreateOrderResponse>('/v2/checkout/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: input.currency,
            value: input.amount,
          },
          custom_id: input.campaignId ?? 'site_support',
          description,
        },
      ],
      application_context: {
        user_action: 'PAY_NOW',
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
    cache: 'no-store',
  })
}

export function createSimulatedOrder(input: CreatePayPalOrderInput): UnifiedOrderResult {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const orderId = randomUUID()
  const payload: SimulatedOrderPayload = {
    orderId,
    amount: input.amount,
    currency: input.currency,
    type: input.type,
    campaignId: input.campaignId,
    campaignTitle: input.campaignTitle,
    returnUrl: input.returnUrl,
    cancelUrl: input.cancelUrl,
    exp: Date.now() + 30 * 60 * 1000,
  }
  const token = signPayload(payload)
  const approvalUrl = `${appUrl.replace(/\/$/, '')}/donaciones/paypal/checkout?token=${encodeURIComponent(token)}`

  return {
    id: orderId,
    status: 'CREATED',
    mode: 'simulated',
    approvalUrl,
    token,
    description: getOrderDescription(input),
  }
}

export function captureSimulatedOrder(token: string): UnifiedCaptureResult {
  const payload = verifySimulatedOrderToken(token)

  return {
    orderId: payload.orderId,
    status: 'COMPLETED',
    mode: 'simulated',
    type: payload.type,
    amount: payload.amount,
    currency: payload.currency,
    campaignId: payload.campaignId,
    campaignTitle: payload.campaignTitle,
    captureId: `SIM-${payload.orderId.slice(0, 8)}`,
  }
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken()

  return requestPayPal<PayPalCaptureResponse>(`/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
}

export function getPayPalApprovalUrl(order: { links?: Array<{ href: string; rel: string }> }) {
  return order.links?.find((link) => link.rel === 'approve')?.href ?? null
}

export async function createOrder(input: CreatePayPalOrderInput): Promise<UnifiedOrderResult> {
  if (getPayPalMode() === 'simulated') {
    return createSimulatedOrder(input)
  }

  const order = await createPayPalOrder(input)
  const approvalUrl = getPayPalApprovalUrl(order)

  return {
    id: order.id,
    status: order.status,
    mode: 'sandbox',
    approvalUrl,
    description: getOrderDescription(input),
  }
}

export async function captureOrder(
  orderId: string,
  options?: { token?: string; type?: PayPalOrderType; campaignId?: string; amount?: string; currency?: string }
): Promise<UnifiedCaptureResult> {
  if (getPayPalMode() === 'simulated') {
    if (!options?.token) {
      throw new Error('Missing simulated order token')
    }
    return captureSimulatedOrder(options.token)
  }

  const capture = await capturePayPalOrder(orderId)
  const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null

  return {
    orderId: capture.id,
    status: capture.status,
    mode: 'sandbox',
    type: options?.type ?? 'campaign',
    amount: options?.amount ?? '0',
    currency: options?.currency ?? 'USD',
    campaignId: options?.campaignId,
    captureId,
  }
}
