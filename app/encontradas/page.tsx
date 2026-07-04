import Link from 'next/link'
import { CheckCircle, MapPin, Calendar, Phone, Plus, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { fetchFoundPets } from '@/lib/data/queries'
import { getFoundStatusLabel } from '@/lib/pets-utils'

export const dynamic = 'force-dynamic'

export default async function FoundPetsPage() {
  const foundPets = await fetchFoundPets()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mascotas Encontradas</h1>
            <p className="text-foreground/60">Publica animales encontrados y ayuda a que vuelvan a casa</p>
          </div>
          <Link href="/reportar">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Reportar encontrada
            </Button>
          </Link>
        </div>

        <PetsModuleNav active="encontradas" />

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Buscar por zona, tipo, color..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Todas</option>
            <option>Alta coincidencia</option>
            <option>Posible coincidencia</option>
            <option>Sin coincidencia</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {foundPets.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60 mb-4">No hay mascotas encontradas reportadas.</p>
            <Link href="/reportar">
              <Button className="bg-primary hover:bg-primary/90">Reportar encontrada</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundPets.map((pet) => (
              <div
                key={pet.id}
                className={`bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition ${
                  pet.status === 'high' ? 'border-green-500/50' :
                  pet.status === 'medium' ? 'border-blue-500/50' :
                  'border-border'
                }`}
              >
                <div className={`h-1 ${
                  pet.status === 'high' ? 'bg-green-500' :
                  pet.status === 'medium' ? 'bg-blue-500' :
                  'bg-slate-500'
                }`} />

                {pet.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pet.image_url}
                    alt={pet.type}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          pet.status === 'high' ? 'bg-green-100 dark:bg-green-900/30' :
                          pet.status === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-muted'
                        }`}>
                          {pet.type.includes('Gata') ? '🐈' : '🐕'}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          pet.status === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          pet.status === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-muted text-foreground/70'
                        }`}>
                          {getFoundStatusLabel(pet.status)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{pet.type}</h3>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>

                  <div className="space-y-2 mb-4">
                    {pet.breed && <p className="text-sm text-foreground/60"><strong>Raza/Descripción:</strong> {pet.breed}</p>}
                    {pet.color && <p className="text-sm text-foreground/60"><strong>Color:</strong> {pet.color}</p>}
                    {pet.condition && <p className="text-sm text-foreground/60"><strong>Estado:</strong> {pet.condition}</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm text-foreground/60">
                    {pet.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{pet.location}</div>}
                    {pet.date_text && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{pet.date_text}</div>}
                  </div>

                  {pet.description && (
                    <p className="text-sm text-foreground mb-4 p-3 rounded-lg bg-muted">{pet.description}</p>
                  )}

                  {pet.match && (
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-purple-700 dark:text-purple-400 font-medium">{pet.match}</span>
                    </div>
                  )}

                  {pet.contact && (
                    <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">{pet.contact}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">Compartir</Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90">Creo que es mía</Button>
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
