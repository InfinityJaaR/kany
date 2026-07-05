import type { PayPalOrderType } from '@/lib/paypal'

export interface CompleteDonationInput {
  type: PayPalOrderType
  amount: string
  campaignId?: string
  campaignTitle?: string
}

export interface CompleteDonationResult {
  success: boolean
  message: string
}

export async function completeDonationAfterCapture(
  input: CompleteDonationInput,
): Promise<CompleteDonationResult> {
  const amount = parseFloat(input.amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'Monto de donacion invalido.' }
  }

  const response = await fetch('/api/donations/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: input.type,
      amount: input.amount,
      campaignId: input.campaignId,
    }),
  })
  const data = (await response.json()) as { ok?: boolean; error?: string }

  if (!response.ok || !data.ok) {
    return {
      success: false,
      message: data.error ?? 'No se pudo registrar la donacion.',
    }
  }

  if (input.type === 'campaign') {
    const title = input.campaignTitle ? `"${input.campaignTitle}"` : 'la campana'
    return {
      success: true,
      message: `Gracias. Donaste $${amount.toFixed(2)} a ${title}.`,
    }
  }

  return {
    success: true,
    message: `Gracias. Donaste $${amount.toFixed(2)} para apoyar la plataforma Kany.`,
  }
}

export const PAYPAL_DONATION_MESSAGE_TYPE = 'paypal-donation'

export interface PayPalDonationMessage {
  type: typeof PAYPAL_DONATION_MESSAGE_TYPE
  status: 'success' | 'cancelled' | 'error'
  message?: string
  donationType?: PayPalOrderType
  amount?: string
  campaignId?: string
}

export function notifyPayPalOpener(message: PayPalDonationMessage) {
  if (typeof window === 'undefined' || !window.opener) {
    return
  }

  window.opener.postMessage(message, window.location.origin)
}

export function isPayPalDonationMessage(data: unknown): data is PayPalDonationMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as PayPalDonationMessage).type === PAYPAL_DONATION_MESSAGE_TYPE
  )
}
