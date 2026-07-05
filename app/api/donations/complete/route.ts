import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PayPalOrderType } from '@/lib/paypal'

type CompleteDonationBody = {
  type?: PayPalOrderType
  amount?: string
  campaignId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompleteDonationBody
    const amount = Number(body.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Monto de donacion invalido.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesion para donar.' }, { status: 401 })
    }

    const admin = createAdminClient()

    if (body.type === 'campaign') {
      if (!body.campaignId) {
        return NextResponse.json({ error: 'Falta el identificador de la campana.' }, { status: 400 })
      }

      const { data: campaign, error: campaignError } = await admin
        .from('campaigns')
        .select('id, current, donors, status')
        .eq('id', Number(body.campaignId))
        .maybeSingle<{ id: number; current: number; donors: number; status: string }>()

      if (campaignError || !campaign || campaign.status === 'success') {
        return NextResponse.json(
          { error: campaignError?.message ?? 'Campana no encontrada o ya completada.' },
          { status: 404 },
        )
      }

      const { error: updateError } = await admin
        .from('campaigns')
        .update({
          current: Number(campaign.current) + amount,
          donors: Number(campaign.donors) + 1,
        })
        .eq('id', campaign.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    const { error: insertError } = await admin.from('platform_donations').insert({
      user_id: user.id,
      amount,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo completar la donacion.' },
      { status: 500 },
    )
  }
}
