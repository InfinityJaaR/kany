import Link from 'next/link'
import { Calendar, CheckCircle, Mail, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { SharePetButton } from '@/components/pets/lost-pet-actions'
import { fetchRecoveredLostPets } from '@/lib/data/queries'
import { getLostStatusLabel, getPetEmoji } from '@/lib/pets-utils'

export const dynamic = 'force-dynamic'

export default async function FoundPetsPage() {
  const recoveredPets = await fetchRecoveredLostPets()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mascotas Encontradas</h1>
            <p className="text-foreground/60">Casos reportados como recuperados por sus familias</p>
          </div>
          <Link href="/perdidas">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Ver perdidas activas
            </Button>
          </Link>
        </div>

        <PetsModuleNav active="encontradas" />

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, zona, raza..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Todas</option>
            <option>Recuperadas</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {recoveredPets.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60 mb-4">Todavia no hay mascotas marcadas como encontradas.</p>
            <Link href="/perdidas">
              <Button className="bg-primary hover:bg-primary/90">Ver perdidas activas</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recoveredPets.map((pet) => (
              <div
                key={pet.id}
                className="bg-card border border-green-500/50 rounded-2xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-1 bg-green-500" />

                {pet.image_url && (
                  <div className="flex h-56 items-center justify-center bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pet.image_url} alt={pet.name} className="max-h-56 w-full object-contain" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-green-100 dark:bg-green-900/30">
                          {getPetEmoji(pet.name)}
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          {getLostStatusLabel(pet.status)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{pet.name}</h3>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
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

                  {pet.contact && (
                    <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">{pet.contact}</span>
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
