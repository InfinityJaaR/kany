import { NextResponse } from 'next/server'

import { decodeSimulatedOrderToken, getPayPalMode } from '@/lib/paypal'

export async function GET(request: Request) {
  if (getPayPalMode() !== 'simulated') {
    return NextResponse.json({ error: 'Simulated order details only available in simulated mode' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    const payload = decodeSimulatedOrderToken(token)
    const description =
      payload.type === 'campaign'
        ? `Donación para campaña${payload.campaignTitle ? `: ${payload.campaignTitle}` : ''}`
        : 'Donación para apoyar la plataforma Kany'

    return NextResponse.json({
      order: {
        ...payload,
        description,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid token' },
      { status: 400 }
    )
  }
}
