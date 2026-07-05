import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RequestBody = {
  lostPetId?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody
    if (!body.lostPetId) {
      return NextResponse.json({ error: 'lostPetId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesion.' }, { status: 401 })
    }

    const { data: pet, error: petError } = await supabase
      .from('lost_pets')
      .select('id, name, reported_by')
      .eq('id', body.lostPetId)
      .maybeSingle<{ id: number; name: string; reported_by: string | null }>()

    if (petError || !pet) {
      return NextResponse.json(
        { error: petError?.message ?? 'Publicacion no encontrada.' },
        { status: 404 },
      )
    }

    if (!pet.reported_by) {
      return NextResponse.json(
        { error: 'Esta publicacion no tiene un usuario responsable.' },
        { status: 400 },
      )
    }

    if (pet.reported_by === user.id) {
      return NextResponse.json(
        { error: 'No puedes abrir un chat contigo mismo.' },
        { status: 400 },
      )
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('lost_pet_id', pet.id)
      .eq('owner_id', pet.reported_by)
      .eq('participant_id', user.id)
      .maybeSingle<{ id: string }>()

    if (existing) {
      return NextResponse.json({ id: existing.id })
    }

    const { data: conversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        lost_pet_id: pet.id,
        owner_id: pet.reported_by,
        participant_id: user.id,
      })
      .select('id')
      .single<{ id: string }>()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ id: conversation.id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error inesperado.' },
      { status: 500 },
    )
  }
}
