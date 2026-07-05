import type { PayPalOrderType } from '@/lib/paypal'
import { createClient } from '@/lib/supabase/client'

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
  input: CompleteDonationInput
): Promise<CompleteDonationResult> {
  const amount = parseFloat(input.amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'Monto de donación inválido.' }
  }

  const supabase = createClient()

  if (input.type === 'campaign') {
    if (!input.campaignId) {
      return { success: false, message: 'Falta el identificador de la campaña.' }
    }

    const { error } = await supabase.rpc('donate_to_campaign', {
      p_campaign_id: Number(input.campaignId),
      p_amount: amount,
    })

    if (error) {
      const message = error.message.includes('Not authenticated')
        ? 'Debes iniciar sesión para donar.'
        : error.message
      return { success: false, message }
    }

    const title = input.campaignTitle ? `"${input.campaignTitle}"` : 'la campaña'
    return {
      success: true,
      message: `¡Gracias! Donaste $${amount.toFixed(2)} a ${title}.`,
    }
  }

  const { error } = await supabase.rpc('donate_to_platform', {
    p_amount: amount,
  })

  if (error) {
    const message = error.message.includes('Not authenticated')
      ? 'Debes iniciar sesión para donar.'
      : error.message
    return { success: false, message }
  }

  return {
    success: true,
    message: `¡Gracias! Donaste $${amount.toFixed(2)} para apoyar la plataforma Kany.`,
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
