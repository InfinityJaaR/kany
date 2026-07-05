import Link from 'next/link'
import { MapPin, Calendar, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { PetsListToolbar } from '@/components/pets/pets-list-toolbar'
import { SharePetButton } from '@/components/pets/lost-pet-actions'
import { fetchLostPets } from '@/lib/data/queries'
import { getLostStatusLabel, getPetEmoji } from '@/lib/pets-utils'

export const dynamic = 'force-dynamic'

export default async function LostPetsPage() {
  const lostPets = await fetchLostPets()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Mascotas Perdidas</h1>
          <p className="text-foreground/60">Ayuda a reunir familias con sus mascotas en Kany</p>
        </div>

        <PetsModuleNav active="perdidas" />

        <PetsListToolbar
          action={{ href: '/reportar', label: 'Reportar mascota', icon: 'plus' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {lostPets.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60 mb-4">No hay reportes todavía.</p>
            <p className="text-sm text-foreground/50 mb-6">
              Ejecuta <code className="text-xs bg-muted px-1 rounded">supabase/seed.sql</code> en SQL Editor o publica desde Reportar.
            </p>
            <Link href="/reportar">
              <Button className="bg-primary hover:bg-primary/90">Reportar mascota</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lostPets.map((pet) => (
              <div
                key={pet.id}
                className={`bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition ${
                  pet.status === 'critical' ? 'border-red-500/50' :
                  pet.status === 'urgent' ? 'border-orange-500/50' :
                  'border-border'
                }`}
              >
                <div className={`h-1 ${
                  pet.status === 'critical' ? 'bg-red-500' :
                  pet.status === 'urgent' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />

                {pet.image_url && (
                  <div className="flex h-56 items-center justify-center bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pet.image_url}
                      alt={pet.name}
                      className="max-h-56 w-full object-contain"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          pet.status === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                          pet.status === 'urgent' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {getPetEmoji(pet.name)}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          pet.status === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          pet.status === 'urgent' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {getLostStatusLabel(pet.status)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{pet.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {pet.breed && <p className="text-sm text-foreground/60"><strong>Raza:</strong> {pet.breed}</p>}
                    {pet.color && <p className="text-sm text-foreground/60"><strong>Color:</strong> {pet.color}</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm text-foreground/60">
                    {pet.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {pet.location}
                      </div>
                    )}
                    {pet.date_text && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {pet.date_text}
                      </div>
                    )}
                  </div>

                  {pet.description && (
                    <p className="text-sm text-foreground mb-4 p-3 rounded-lg bg-muted">{pet.description}</p>
                  )}

                  {pet.reward && (
                    <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <span className="text-sm text-green-700 dark:text-green-400">Recompensa ofrecida:</span>
                      <span className="font-bold text-green-700 dark:text-green-400">{pet.reward}</span>
                    </div>
                  )}

                  {pet.contact && (
                    <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-sm text-blue-700 dark:text-blue-400 font-medium break-all">{pet.contact}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <SharePetButton
                      petName={pet.name}
                      path={`/mascotas/perdidas/${pet.id}`}
                      className="flex-1"
                    />
                    <Link href={`/mascotas/perdidas/${pet.id}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90">Ver detalle</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
