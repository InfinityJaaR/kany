'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  completeDonationAfterCapture,
  notifyPayPalOpener,
  PAYPAL_DONATION_MESSAGE_TYPE,
} from '@/lib/donations/complete-donation'
import type { PayPalOrderType } from '@/lib/paypal'

type CaptureState = 'loading' | 'success' | 'cancelled' | 'error'

interface CaptureResponse {
  status?: string
  type?: PayPalOrderType
  amount?: string
  currency?: string
  campaignId?: string
  campaignTitle?: string
  error?: string
}

function PayPalReturnContent() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token'), [searchParams])
  const explicitStatus = useMemo(() => searchParams.get('status'), [searchParams])
  const donationType = useMemo(() => searchParams.get('type') as PayPalOrderType | null, [searchParams])
  const amount = useMemo(() => searchParams.get('amount'), [searchParams])
  const campaignId = useMemo(() => searchParams.get('campaignId'), [searchParams])
  const campaignTitle = useMemo(() => searchParams.get('campaignTitle'), [searchParams])
  const isCancelled = explicitStatus === 'cancelled'

  const [captureState, setCaptureState] = useState<CaptureState>(() => {
    if (isCancelled) {
      return 'cancelled'
    }
    return token ? 'loading' : 'error'
  })
  const [message, setMessage] = useState(() => {
    if (isCancelled) {
      return 'Cancelaste el pago en PayPal. Puedes intentarlo de nuevo cuando quieras.'
    }
    if (!token) {
      return 'No se recibió el identificador de la orden de PayPal.'
    }
    return 'Estamos confirmando tu donación con PayPal...'
  })

  useEffect(() => {
    if (isCancelled) {
      notifyPayPalOpener({
        type: PAYPAL_DONATION_MESSAGE_TYPE,
        status: 'cancelled',
        message: 'Cancelaste el pago en PayPal.',
        donationType: donationType ?? undefined,
      })

      const timer = setTimeout(() => {
        if (window.opener) {
          window.close()
        }
      }, 1500)

      return () => clearTimeout(timer)
    }

    if (!token) {
      return
    }

    let isMounted = true

    async function captureOrder() {
      try {
        const response = await fetch(`/api/paypal/orders/${token}/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: donationType ?? 'campaign',
            campaignId: campaignId ?? undefined,
            campaignTitle: campaignTitle ?? undefined,
            amount: amount ?? undefined,
            currency: searchParams.get('currency') ?? 'USD',
          }),
        })
        const data = (await response.json()) as CaptureResponse

        if (!response.ok) {
          throw new Error(data.error ?? 'No se pudo capturar la orden de PayPal.')
        }

        if (!isMounted) {
          return
        }

        if (data.status === 'COMPLETED') {
          const donationResult = await completeDonationAfterCapture({
            type: data.type ?? donationType ?? 'campaign',
            amount: data.amount ?? amount ?? '0',
            campaignId: data.campaignId ?? campaignId ?? undefined,
            campaignTitle: data.campaignTitle ?? campaignTitle ?? undefined,
          })

          if (!donationResult.success) {
            setCaptureState('error')
            setMessage(donationResult.message)
            notifyPayPalOpener({
              type: PAYPAL_DONATION_MESSAGE_TYPE,
              status: 'error',
              message: donationResult.message,
              donationType: data.type ?? donationType ?? undefined,
            })
            return
          }

          setCaptureState('success')
          setMessage(donationResult.message)
          notifyPayPalOpener({
            type: PAYPAL_DONATION_MESSAGE_TYPE,
            status: 'success',
            message: donationResult.message,
            donationType: data.type ?? donationType ?? undefined,
            amount: data.amount ?? amount ?? undefined,
            campaignId: data.campaignId ?? campaignId ?? undefined,
          })

          setTimeout(() => {
            if (window.opener) {
              window.close()
            }
          }, 1500)
          return
        }

        setCaptureState('error')
        setMessage('PayPal devolvió un estado inesperado al confirmar el pago.')
      } catch (error) {
        if (!isMounted) {
          return
        }
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al confirmar el pago.'
        setCaptureState('error')
        setMessage(errorMessage)
        notifyPayPalOpener({
          type: PAYPAL_DONATION_MESSAGE_TYPE,
          status: 'error',
          message: errorMessage,
          donationType: donationType ?? undefined,
        })
      }
    }

    void captureOrder()

    return () => {
      isMounted = false
    }
  }, [amount, campaignId, campaignTitle, donationType, isCancelled, searchParams, token])

  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <h1 className="text-3xl font-bold text-foreground mb-3">Resultado de tu donación</h1>
      <p className="text-foreground/70 mb-6">{message}</p>

      {captureState === 'loading' ? (
        <p className="text-sm text-foreground/60">Un momento, estamos verificando la transacción...</p>
      ) : null}

      <div className="flex flex-wrap gap-3 mt-2">
        <Link href="/donaciones">
          <Button className="bg-primary hover:bg-primary/90">
            {captureState === 'success' ? 'Volver a donaciones' : 'Intentar otra donación'}
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Ir al inicio</Button>
        </Link>
      </div>
    </div>
  )
}

export default function PayPalReturnPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense
          fallback={
            <div className="bg-card border border-border rounded-2xl p-8">
              <p className="text-foreground/60">Cargando resultado del pago…</p>
            </div>
          }
        >
          <PayPalReturnContent />
        </Suspense>
      </div>
    </div>
  )
}
