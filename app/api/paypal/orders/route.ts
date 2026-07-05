import { NextResponse } from 'next/server'

import { createOrder, getPayPalMode, type PayPalOrderType } from '@/lib/paypal'

interface CreateOrderBody {
  amount?: number | string
  currency?: string
  type?: PayPalOrderType
  campaignId?: string | number
  campaignTitle?: string
}

const ALLOWED_TYPES: PayPalOrderType[] = ['campaign', 'site_support']

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody
    const amount = Number(body.amount)
    const currency = (body.currency ?? 'USD').toUpperCase()
    const type = body.type ?? 'campaign'
    const mode = getPayPalMode()

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid donation type' }, { status: 400 })
    }

    if (mode === 'sandbox' && (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET)) {
      return NextResponse.json(
        {
          error:
            'PayPal sandbox requiere PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET. Usa PAYPAL_MODE=simulated para la demo.',
        },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnBase = `${appUrl.replace(/\/$/, '')}/donaciones/paypal/return`
    const params = new URLSearchParams({
      type,
      amount: amount.toFixed(2),
      currency,
    })

    if (body.campaignId !== undefined) {
      params.set('campaignId', String(body.campaignId))
    }

    if (body.campaignTitle) {
      params.set('campaignTitle', body.campaignTitle)
    }

    const returnUrl = `${returnBase}?${params.toString()}`
    const cancelUrl = `${returnUrl}&status=cancelled`

    const order = await createOrder({
      amount: amount.toFixed(2),
      currency,
      type,
      campaignId: body.campaignId !== undefined ? String(body.campaignId) : undefined,
      campaignTitle: body.campaignTitle,
      returnUrl,
      cancelUrl,
    })

    if (!order.approvalUrl) {
      return NextResponse.json({ error: 'Unable to get approval URL from PayPal' }, { status: 502 })
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      approvalUrl: order.approvalUrl,
      mode: order.mode,
      token: order.token,
      description: order.description,
    })
  } catch (error) {
    console.error('Failed to create PayPal order', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
