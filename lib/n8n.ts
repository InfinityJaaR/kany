const N8N_SECRET_HEADER = 'x-kany-secret'

export class N8nWebhookError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'N8nWebhookError'
  }
}

export async function triggerN8nWebhook(
  webhookUrl: string | undefined,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!webhookUrl) return

  const apiKey = process.env.N8N_API_KEY
  if (!apiKey) {
    console.warn('[n8n] N8N_API_KEY not set; skipping webhook')
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [N8N_SECRET_HEADER]: apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('[n8n] Webhook failed:', response.status, await response.text())
    }
  } catch (err) {
    console.error('[n8n] Webhook error:', err)
  }
}

export async function callN8nWebhook<T = { text?: string; ok?: boolean }>(
  webhookUrl: string | undefined,
  payload: Record<string, unknown>,
): Promise<T> {
  if (!webhookUrl) {
    throw new N8nWebhookError('Servicio de IA no configurado (N8N_WEBHOOK_GENERATE_DESCRIPTION)')
  }

  const apiKey = process.env.N8N_API_KEY
  if (!apiKey) {
    throw new N8nWebhookError('N8N_API_KEY no configurada')
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [N8N_SECRET_HEADER]: apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new N8nWebhookError(
      `n8n respondió con error (${response.status})`,
      response.status,
    )
  }

  return response.json() as Promise<T>
}

export function getLostPetWebhookUrl(): string | undefined {
  return process.env.N8N_WEBHOOK_LOST_PET
}

export function getGenerateDescriptionWebhookUrl(): string | undefined {
  return process.env.N8N_WEBHOOK_GENERATE_DESCRIPTION
}

export function getDonationWebhookUrl(): string | undefined {
  return process.env.N8N_WEBHOOK_DONATION
}
