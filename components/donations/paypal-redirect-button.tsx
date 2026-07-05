'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PayPalRedirectButtonProps {
  amount: number
  currency?: string
  type: 'campaign' | 'site_support'
  campaignId?: number
  campaignTitle?: string
  containerClassName?: string
  className?: string
  children: React.ReactNode
}

interface CreateOrderResponse {
  approvalUrl?: string
  error?: string
}

export function PayPalRedirectButton({
  amount,
  currency = 'USD',
  type,
  campaignId,
  campaignTitle,
  containerClassName,
  className,
  children,
}: PayPalRedirectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleDonateClick() {
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/paypal/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          type,
          campaignId,
          campaignTitle,
        }),
      })
      const data = (await response.json()) as CreateOrderResponse

      if (!response.ok || !data.approvalUrl) {
        throw new Error(data.error ?? 'No se pudo iniciar el checkout de PayPal.')
      }

      window.location.href = data.approvalUrl
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo iniciar el checkout de PayPal.')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('w-full', containerClassName)}>
      <Button onClick={handleDonateClick} disabled={isLoading} className={className}>
        {isLoading ? 'Redirigiendo a PayPal...' : children}
      </Button>
      {errorMessage ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
