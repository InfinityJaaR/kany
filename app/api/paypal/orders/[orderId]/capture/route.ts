import { NextResponse } from 'next/server'

import { capturePayPalOrder } from '@/lib/paypal'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function POST(_: Request, context: RouteParams) {
  try {
    const { orderId } = await context.params

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
    }

    const capture = await capturePayPalOrder(orderId)
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null

    return NextResponse.json({
      orderId: capture.id,
      status: capture.status,
      captureId,
    })
  } catch (error) {
    console.error('Failed to capture PayPal order', error)
    return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 500 })
  }
}
