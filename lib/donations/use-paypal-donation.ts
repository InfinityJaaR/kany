'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  completeDonationAfterCapture,
  isPayPalDonationMessage,
  type PayPalDonationMessage,
} from '@/lib/donations/complete-donation'
import type { PayPalOrderType } from '@/lib/paypal'

const POPUP_FEATURES = 'width=480,height=720,scrollbars=yes,resizable=yes'

interface CreateOrderResponse {
  approvalUrl?: string
  mode?: string
  error?: string
}

interface StartPayPalDonationInput {
  amount: number
  currency?: string
  type: PayPalOrderType
  campaignId?: number
  campaignTitle?: string
}

export function usePayPalDonation() {
  const router = useRouter()
  const popupRef = useRef<Window | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<PayPalDonationMessage | null>(null)

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return
      }

      if (!isPayPalDonationMessage(event.data)) {
        return
      }

      setIsLoading(false)
      setFeedback(event.data)

      if (event.data.status === 'success') {
        router.refresh()
      }

      popupRef.current = null
    },
    [router]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  async function startDonation(input: StartPayPalDonationInput) {
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/paypal/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: input.amount,
          currency: input.currency ?? 'USD',
          type: input.type,
          campaignId: input.campaignId,
          campaignTitle: input.campaignTitle,
        }),
      })

      const data = (await response.json()) as CreateOrderResponse

      if (!response.ok || !data.approvalUrl) {
        throw new Error(data.error ?? 'No se pudo iniciar el checkout de PayPal.')
      }

      const popup = window.open(data.approvalUrl, 'paypal_checkout', POPUP_FEATURES)

      if (!popup) {
        throw new Error('El navegador bloqueó la ventana de PayPal. Permite popups e intenta de nuevo.')
      }

      popupRef.current = popup
    } catch (error) {
      setIsLoading(false)
      setFeedback({
        type: 'paypal-donation',
        status: 'error',
        message: error instanceof Error ? error.message : 'No se pudo iniciar el checkout de PayPal.',
        donationType: input.type,
      })
    }
  }

  function clearFeedback() {
    setFeedback(null)
  }

  return {
    startDonation,
    isLoading,
    feedback,
    clearFeedback,
    completeDonationAfterCapture,
  }
}
