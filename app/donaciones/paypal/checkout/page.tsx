'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  completeDonationAfterCapture,
  notifyPayPalOpener,
  PAYPAL_DONATION_MESSAGE_TYPE,
} from '@/lib/donations/complete-donation'
import type { SimulatedOrderPayload } from '@/lib/paypal'

interface OrderDetailsResponse {
  order?: SimulatedOrderPayload & { description: string }
  error?: string
}

interface CaptureResponse {
  status?: string
  type?: string
  amount?: string
  currency?: string
  campaignId?: string
  campaignTitle?: string
  error?: string
}

function PayPalCheckoutContent() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token'), [searchParams])
  const [order, setOrder] = useState<(SimulatedOrderPayload & { description: string }) | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!token || loaded) {
      return
    }

    async function loadOrder() {
      try {
        const response = await fetch(`/api/paypal/orders/simulated?token=${encodeURIComponent(token!)}`)
        const data = (await response.json()) as OrderDetailsResponse

        if (!response.ok || !data.order) {
          throw new Error(data.error ?? 'No se pudo cargar la orden.')
        }

        setOrder(data.order)
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar la orden.')
      } finally {
        setLoaded(true)
      }
    }

    void loadOrder()
  }, [token, loaded])

  async function handleApprove() {
    if (!token || !order) {
      return
    }

    setProcessing(true)

    try {
      const response = await fetch(`/api/paypal/orders/${order.orderId}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          type: order.type,
          campaignId: order.campaignId,
          campaignTitle: order.campaignTitle,
          amount: order.amount,
          currency: order.currency,
        }),
      })

      const data = (await response.json()) as CaptureResponse

      if (!response.ok || data.status !== 'COMPLETED') {
        throw new Error(data.error ?? 'No se pudo confirmar el pago.')
      }

      const result = await completeDonationAfterCapture({
        type: order.type,
        amount: order.amount,
        campaignId: order.campaignId,
        campaignTitle: order.campaignTitle,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      notifyPayPalOpener({
        type: PAYPAL_DONATION_MESSAGE_TYPE,
        status: 'success',
        message: result.message,
        donationType: order.type,
        amount: order.amount,
        campaignId: order.campaignId,
      })

      window.close()
    } catch (error) {
      setProcessing(false)
      setLoadError(error instanceof Error ? error.message : 'Ocurrió un error al procesar el pago.')
    }
  }

  function handleCancel() {
    if (!order) {
      window.close()
      return
    }

    notifyPayPalOpener({
      type: PAYPAL_DONATION_MESSAGE_TYPE,
      status: 'cancelled',
      message: 'Cancelaste el pago en PayPal.',
      donationType: order.type,
    })

    const cancelUrl = new URL(order.cancelUrl)
    window.location.href = cancelUrl.toString()
  }

  if (!token) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <p className="text-red-600">Token de orden no válido.</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <p className="text-red-600 mb-4">{loadError}</p>
        <Button variant="outline" onClick={() => window.close()}>
          Cerrar
        </Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <p className="text-gray-600">Cargando orden de PayPal…</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full">
      <div className="bg-[#003087] px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-xl tracking-tight">PayPal</span>
          <span className="text-[#ffc439] text-xs font-semibold uppercase tracking-wide">
            Sandbox (Simulado)
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Orden</p>
          <p className="font-mono text-sm text-gray-700 break-all">{order.orderId}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-600">{order.description}</p>
          {order.campaignTitle && order.type === 'campaign' ? (
            <p className="text-sm font-medium text-gray-800">Campaña: {order.campaignTitle}</p>
          ) : null}
          <p className="text-2xl font-bold text-[#003087]">
            {order.currency} ${order.amount}
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Esta es una simulación local para demo. En modo sandbox real serás redirigido a sandbox.paypal.com.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            className="w-full bg-[#ffc439] hover:bg-[#f0b800] text-[#003087] font-bold"
            disabled={processing}
            onClick={handleApprove}
          >
            {processing ? 'Procesando…' : 'Pagar ahora'}
          </Button>
          <Button variant="outline" className="w-full" disabled={processing} onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PayPalCheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <p className="text-gray-600">Cargando checkout…</p>
          </div>
        }
      >
        <PayPalCheckoutContent />
      </Suspense>
    </div>
  )
}
