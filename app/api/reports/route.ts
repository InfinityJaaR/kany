import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLostPetWebhookUrl, triggerN8nWebhook } from '@/lib/n8n'
import { isValidSvPhone, normalizeSvPhone } from '@/lib/validations/contact'

type ReportBody = {
  tipo: 'perdida' | 'encontrada'
  nombre: string
  raza?: string
  color?: string
  zona: string
  contacto: string
  detalles?: string
  image_url?: string | null
  notify?: boolean
}

function buildFallbackDescription(tipo: string, nombre: string, zona: string, color: string): string {
  const label = tipo === 'perdida' ? 'SE BUSCA' : 'MASCOTA ENCONTRADA'
  const action = tipo === 'perdida' ? 'Se perdió' : 'Fue encontrada'
  return `🚨 ${label} ${nombre}. ${action} en ${zona}. Color/descripción: ${color || 'por completar'}. Si tienes información, contacta al número del reporte.`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: ReportBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { tipo, nombre, raza, color, zona, contacto, detalles, image_url, notify } = body

  if (!tipo || !nombre?.trim() || !zona?.trim() || !contacto?.trim()) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  if (!isValidSvPhone(contacto)) {
    return NextResponse.json(
      { error: 'Contacto inválido. Usa formato +503XXXXXXXX (8 dígitos)' },
      { status: 400 },
    )
  }

  const normalizedContact = normalizeSvPhone(contacto)!
  const description =
    detalles?.trim() ||
    buildFallbackDescription(tipo, nombre.trim(), zona.trim(), color?.trim() ?? '')

  let reportId: number
  let nameField: string

  if (tipo === 'perdida') {
    const { data, error } = await supabase
      .from('lost_pets')
      .insert({
        name: nombre.trim(),
        breed: raza?.trim() ?? '',
        color: color?.trim() ?? '',
        location: zona.trim(),
        date_text: 'Hoy',
        description,
        reward: '',
        contact: normalizedContact,
        status: 'normal',
        image_url: image_url ?? null,
        reported_by: user.id,
      })
      .select('id, name')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    reportId = data.id
    nameField = data.name
  } else {
    const { data, error } = await supabase
      .from('found_pets')
      .insert({
        type: nombre.trim() || 'Mascota',
        breed: raza?.trim() ?? '',
        color: color?.trim() ?? '',
        location: zona.trim(),
        date_text: 'Hoy',
        description,
        condition: 'Por confirmar',
        contact: normalizedContact,
        match: 'Sin coincidencias',
        status: 'normal',
        image_url: image_url ?? null,
        reported_by: user.id,
      })
      .select('id, type')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    reportId = data.id
    nameField = data.type
  }

  if (notify !== false) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    void triggerN8nWebhook(getLostPetWebhookUrl(), {
      report_id: reportId,
      tipo,
      name: nameField,
      breed: raza?.trim() ?? '',
      color: color?.trim() ?? '',
      location: zona.trim(),
      contact: normalizedContact,
      description,
      image_url: image_url ?? null,
      reported_by_email: user.email ?? '',
      app_url: appUrl,
    })
  }

  return NextResponse.json({ ok: true, report_id: reportId, tipo })
}
