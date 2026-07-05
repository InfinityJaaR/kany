import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { haversineDistanceKm } from '@/lib/geo'

type RequestBody = {
  lostPetId?: number
  event?: 'lost' | 'found'
  actorEmail?: string
}

type ConversationRow = {
  id: string
}

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  home_latitude: number | null
  home_longitude: number | null
  notification_radius_m: number | null
  notify_nearby_lost_pets: boolean | null
}

type LostPetRow = {
  id: number
  name: string
  breed: string | null
  color: string | null
  location: string | null
  location_department: string | null
  location_municipality: string | null
  latitude: number | null
  longitude: number | null
  date_text: string | null
  description: string | null
  reward: string | null
  contact: string | null
  status: string
  image_url: string | null
  reported_by: string | null
  created_at: string
}

function getAppUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin
}

async function getOrCreateFoundConversation({
  supabase,
  pet,
  actorEmail,
}: {
  supabase: ReturnType<typeof createAdminClient>
  pet: LostPetRow
  actorEmail?: string
}) {
  if (!actorEmail || !pet.reported_by) return null

  const { data: actor } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', actorEmail)
    .maybeSingle<Pick<ProfileRow, 'id' | 'email' | 'full_name'>>()

  if (!actor || actor.id === pet.reported_by) return null

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('lost_pet_id', pet.id)
    .eq('owner_id', pet.reported_by)
    .eq('participant_id', actor.id)
    .maybeSingle<ConversationRow>()

  if (existing) return existing.id

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      lost_pet_id: pet.id,
      owner_id: pet.reported_by,
      participant_id: actor.id,
    })
    .select('id')
    .single<ConversationRow>()

  if (error) {
    console.error('found conversation:', error.message)
    return null
  }

  return conversation.id
}

async function notifyN8n(payload: unknown) {
  const webhook = process.env.N8N_WEBHOOK_LOST_PET?.trim()
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
    if (!body.lostPetId) {
      return NextResponse.json({ error: 'lostPetId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: pet, error: petError } = await supabase
      .from('lost_pets')
      .select('*')
      .eq('id', body.lostPetId)
      .single<LostPetRow>()

    if (petError || !pet) {
      return NextResponse.json(
        { error: petError?.message ?? 'Lost pet report not found' },
        { status: 404 },
      )
    }

    const { data: reporter } = pet.reported_by
      ? await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', pet.reported_by)
          .maybeSingle<Pick<ProfileRow, 'id' | 'email' | 'full_name'>>()
      : { data: null }

    const event: 'lost' | 'found' = body.event === 'found' ? 'found' : 'lost'

    let userEmail: string[] | string | null
    let conversationId: string | null = null

    if (event === 'found') {
      userEmail = body.actorEmail ?? null
      conversationId = await getOrCreateFoundConversation({
        supabase,
        pet,
        actorEmail: body.actorEmail,
      })
    } else {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, home_latitude, home_longitude, notification_radius_m, notify_nearby_lost_pets')
        .not('email', 'is', null)
        .not('home_latitude', 'is', null)
        .not('home_longitude', 'is', null)
        .eq('notify_nearby_lost_pets', true)

      if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 })
      }

      userEmail =
        pet.latitude !== null && pet.longitude !== null
          ? ((profiles ?? []) as ProfileRow[])
              .filter((profile) => profile.id !== pet.reported_by)
              .map((profile) => ({
                email: profile.email!,
                distanceKm: haversineDistanceKm(
                  pet.latitude!,
                  pet.longitude!,
                  profile.home_latitude!,
                  profile.home_longitude!,
                ),
                radiusKm: (profile.notification_radius_m ?? 1000) / 1000,
              }))
              .filter((person) => person.distanceKm <= person.radiusKm)
              .map((person) => person.email)
          : []
    }

    const publicationLink = `${getAppUrl(request)}/mascotas/perdidas/${pet.id}`
    const chatLink = conversationId
      ? `${getAppUrl(request)}/mensajes?conversation=${conversationId}`
      : null
    const payload = {
      event,
      name: pet.name,
      breed: pet.breed,
      color: pet.color,
      location: pet.location,
      description: pet.description,
      reward: pet.reward,
      email: reporter?.email ?? null,
      app_url: chatLink ?? publicationLink,
      publication_url: publicationLink,
      chat_url: chatLink,
      user_email: userEmail,
    }

    const n8n = await notifyN8n(payload)

    return NextResponse.json({
      ok: true,
      n8n,
      payload,
    })
  } catch (error) {
    console.error('lost-pet n8n webhook:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
