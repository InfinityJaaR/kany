import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { createClient } from '@/lib/supabase/server'
import { getLostStatusLabel } from '@/lib/pets-utils'
import type { LostPetRow } from '@/lib/data/queries'

type PageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function LostPetDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: pet, error } = await supabase
    .from('lost_pets')
    .select('*')
    .eq('id', Number(id))
    .maybeSingle<LostPetRow>()

  if (error || !pet) notFound()

  const mapsUrl =
    pet.latitude && pet.longitude
      ? `https://www.google.com/maps?q=${pet.latitude},${pet.longitude}`
      : null

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/perdidas" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver a perdidas
        </Link>

        <article className="overflow-hidden rounded-2xl border border-border bg-card">
          {pet.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pet.image_url} alt={pet.name} className="h-80 w-full object-cover" />
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3">
                  {getLostStatusLabel(pet.status)}
                </span>
                <h1 className="text-4xl font-bold text-foreground">{pet.name}</h1>
              </div>
              {pet.reward && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-700 dark:text-green-300">
                  <p className="text-xs">Recompensa</p>
                  <p className="text-xl font-bold">{pet.reward}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              {pet.location && (
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-foreground/50 mb-1">Ultima ubicacion vista</p>
                  <p className="flex items-start gap-2 text-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    {pet.location}
                  </p>
                </div>
              )}
              {pet.date_text && (
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-foreground/50 mb-1">Fecha</p>
                  <p className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4" />
                    {pet.date_text}
                  </p>
                </div>
              )}
              {pet.contact && (
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-foreground/50 mb-1">Contacto</p>
                  <p className="flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4" />
                    {pet.contact}
                  </p>
                </div>
              )}
              {(pet.breed || pet.color) && (
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-foreground/50 mb-1">Descripcion rapida</p>
                  <p className="text-foreground">
                    {[pet.breed, pet.color].filter(Boolean).join(' - ')}
                  </p>
                </div>
              )}
            </div>

            {pet.description && (
              <p className="rounded-xl bg-background border border-border p-4 text-foreground/80 mb-6">
                {pet.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {pet.contact && (
                <a href={`mailto:${pet.contact}`} className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90">Enviar correo</Button>
                </a>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full">Abrir mapa</Button>
                </a>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
