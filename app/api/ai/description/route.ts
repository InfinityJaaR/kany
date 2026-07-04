import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callN8nWebhook, getGenerateDescriptionWebhookUrl, N8nWebhookError } from '@/lib/n8n'

type DescriptionBody = {
  tipo?: string
  nombre?: string
  raza?: string
  color?: string
  zona?: string
  detalles?: string
  title?: string
  organization?: string
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: DescriptionBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const tipo = body.tipo ?? 'perdida'
  const nombre = body.nombre?.trim() ?? body.title?.trim() ?? ''
  const zona = body.zona?.trim() ?? ''

  if (!nombre && tipo !== 'campana') {
    return NextResponse.json(
      { error: 'Indica al menos el nombre o título antes de generar con IA' },
      { status: 400 },
    )
  }

  try {
    const result = await callN8nWebhook<{ text?: string; ok?: boolean }>(
      getGenerateDescriptionWebhookUrl(),
      {
        tipo,
        nombre,
        raza: body.raza?.trim() ?? '',
        color: body.color?.trim() ?? '',
        zona,
        detalles: body.detalles?.trim() ?? '',
        organization: body.organization?.trim() ?? '',
      },
    )

    const text = result.text?.trim()
    if (!text) {
      return NextResponse.json(
        { error: 'n8n no devolvió texto. Revisa el workflow en n8n Cloud.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ text, ok: true })
  } catch (err) {
    if (err instanceof N8nWebhookError) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 502 })
    }
    return NextResponse.json({ error: 'Error al generar descripción' }, { status: 500 })
  }
}
