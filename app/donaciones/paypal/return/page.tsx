'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

type CaptureState = 'loading' | 'success' | 'cancelled' | 'error'

interface CaptureResponse {
  status?: string
  error?: string
}

function PayPalReturnContent() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token'), [searchParams])
  const explicitStatus = useMemo(() => searchParams.get('status'), [searchParams])
  const donationType = useMemo(() => searchParams.get('type'), [searchParams])
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
    if (isCancelled || !token) {
      return
    }

    let isMounted = true

    async function captureOrder() {
      try {
        const response = await fetch(`/api/paypal/orders/${token}/capture`, { method: 'POST' })
        const data = (await response.json()) as CaptureResponse

        if (!response.ok) {
          throw new Error(data.error ?? 'No se pudo capturar la orden de PayPal.')
        }

        if (!isMounted) {
          return
        }

        if (data.status === 'COMPLETED') {
          const successText =
            donationType === 'site_support'
              ? 'Gracias por apoyar la plataforma Kany. Tu donación fue confirmada.'
              : 'Gracias por tu donación. El pago se confirmó correctamente.'
          setCaptureState('success')
          setMessage(successText)
          return
        }

        setCaptureState('error')
        setMessage('PayPal devolvió un estado inesperado al confirmar el pago.')
      } catch (error) {
        if (!isMounted) {
          return
        }
        setCaptureState('error')
        setMessage(error instanceof Error ? error.message : 'Ocurrió un error al confirmar el pago.')
      }
    }

    void captureOrder()

    return () => {
      isMounted = false
    }
  }, [donationType, isCancelled, token])

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
