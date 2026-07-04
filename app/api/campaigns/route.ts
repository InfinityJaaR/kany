import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDonationWebhookUrl, triggerN8nWebhook } from '@/lib/n8n'

type CampaignBody = {
  title: string
  goal: number
  organization: string
  description: string
  image_url?: string | null
  notify?: boolean
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!profile || profile.user_type !== 'foundation') {
    return NextResponse.json({ error: 'Solo fundaciones pueden crear campañas' }, { status: 403 })
  }

  let body: CampaignBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { title, goal, organization, description, image_url, notify } = body

  if (!title?.trim() || !organization?.trim() || !description?.trim() || !goal || goal < 1) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      title: title.trim(),
      description: description.trim(),
      goal,
      current: 0,
      donors: 0,
      days_left: 30,
      organization: organization.trim(),
      status: 'normal',
      updates: 0,
      image_url: image_url ?? null,
      creator_id: user.id,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (notify !== false) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    void triggerN8nWebhook(getDonationWebhookUrl(), {
      campaign_id: data.id,
      title: title.trim(),
      goal,
      organization: organization.trim(),
      description: description.trim(),
      image_url: image_url ?? null,
      creator_email: user.email ?? '',
      app_url: appUrl,
    })
  }

  return NextResponse.json({ ok: true, campaign_id: data.id })
}
