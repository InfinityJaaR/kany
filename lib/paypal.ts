const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com'

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

function getRequiredEnv(name: 'PAYPAL_CLIENT_ID' | 'PAYPAL_CLIENT_SECRET') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
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
  const description =
    input.type === 'campaign'
      ? `Donación para campaña${input.campaignTitle ? `: ${input.campaignTitle}` : ''}`
      : 'Donación para apoyar la plataforma Kany'

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
