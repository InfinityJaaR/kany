import { NextResponse } from 'next/server'

import { captureOrder, getPayPalMode, type PayPalOrderType } from '@/lib/paypal'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

interface CaptureBody {
  token?: string
  type?: PayPalOrderType
  campaignId?: string
  campaignTitle?: string
  amount?: string
  currency?: string
}

export async function POST(request: Request, context: RouteParams) {
  try {
    const { orderId } = await context.params
    const body = (await request.json().catch(() => ({}))) as CaptureBody

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
    }

    const mode = getPayPalMode()
    const capture = await captureOrder(orderId, {
      token: body.token,
      type: body.type,
      campaignId: body.campaignId,
      amount: body.amount,
      currency: body.currency,
    })

    return NextResponse.json({
      orderId: capture.orderId,
      status: capture.status,
      mode: capture.mode,
      type: capture.type,
      amount: capture.amount,
      currency: capture.currency,
      campaignId: capture.campaignId,
      campaignTitle: capture.campaignTitle,
      captureId: capture.captureId,
    })
  } catch (error) {
    console.error('Failed to capture PayPal order', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture PayPal order' },
      { status: 500 }
    )
  }
}
