import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RequestBody = {
  campaignId?: number
  event?: 'campaign.created' | 'donation.completed'
  amount?: number
  donorEmail?: string
}

type CampaignRow = {
  id: number
  title: string
  goal: number
  current: number
  creator_id: string | null
}

type ProfileRow = {
  id: string
  email: string | null
}

function getAppUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin
}

async function notifyN8n(payload: unknown) {
  const webhook = process.env.N8N_WEBHOOK_DONATION?.trim()
  if (!webhook || webhook.includes('your-n8n')) {
    return { skipped: true }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const apiKey = process.env.N8N_API_KEY?.trim()
  if (apiKey && !apiKey.includes('your-n8n')) {
    headers['x-api-key'] = apiKey
  }

  const response = await fetch(webhook, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`n8n responded with ${response.status}`)
  }

  return { skipped: false }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody
    if (!body.campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, goal, current, creator_id')
      .eq('id', body.campaignId)
      .single<CampaignRow>()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: campaignError?.message ?? 'Campaign not found' },
        { status: 404 },
      )
    }

    const { data: creator } = campaign.creator_id
      ? await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', campaign.creator_id)
          .maybeSingle<ProfileRow>()
      : { data: null }

    const event: 'campaign.created' | 'donation.completed' =
      body.event === 'donation.completed' ? 'donation.completed' : 'campaign.created'

    const publicationLink = `${getAppUrl(request)}/donaciones/${campaign.id}`
    const payload = {
      event,
      campaign_title: campaign.title,
      amount: event === 'donation.completed' ? body.amount ?? 0 : 0,
      donor_email: event === 'donation.completed' ? body.donorEmail ?? '' : '',
      organization_email: creator?.email ?? null,
      goal: campaign.goal,
      current: campaign.current,
      app_url: publicationLink,
    }

    const n8n = await notifyN8n(payload)

    return NextResponse.json({
      ok: true,
      n8n,
      payload,
    })
  } catch (error) {
    console.error('campaign n8n webhook:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
