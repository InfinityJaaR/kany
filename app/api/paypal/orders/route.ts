import { NextResponse } from 'next/server'

import { createPayPalOrder, getPayPalApprovalUrl, type PayPalOrderType } from '@/lib/paypal'

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

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid donation type' }, { status: 400 })
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

    const order = await createPayPalOrder({
      amount: amount.toFixed(2),
      currency,
      type,
      campaignId: body.campaignId !== undefined ? String(body.campaignId) : undefined,
      campaignTitle: body.campaignTitle,
      returnUrl,
      cancelUrl,
    })
    const approvalUrl = getPayPalApprovalUrl(order)

    if (!approvalUrl) {
      return NextResponse.json({ error: 'Unable to get approval URL from PayPal' }, { status: 502 })
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      approvalUrl,
    })
  } catch (error) {
    console.error('Failed to create PayPal order', error)
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
  }
}
