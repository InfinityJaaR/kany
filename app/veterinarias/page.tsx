import { MapPin, Phone, Clock, ShieldCheck, Search, Plus, Star, Globe, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { fetchVets } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{
    q?: string
    city?: string
    category?: string
    page?: string
  }>
}

export default async function VeterinariasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params?.q ?? ''
  const page = Number(params?.page ?? '1') || 1
  const result = await fetchVets({ q, page, pageSize: 24 })
  const vets = result.data

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Veterinarias Aliadas</h1>
            <p className="text-foreground/60">Directorio de clínicas, hospitales, pet shops y servicios para mascotas</p>
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Registrar veterinaria
          </Button>
        </div>

        <form className="mb-4 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por clínica, servicio, ciudad o dirección..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <p className="text-sm text-foreground/60 mb-8">
          {result.count} resultado{result.count === 1 ? '' : 's'} encontrado{result.count === 1 ? '' : 's'}
        </p>

        {vets.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60">No hay veterinarias registradas o no coinciden con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vets.map((vet) => {
              const name = vet.name || vet.title || 'Veterinaria'
              const servicesText = vet.services || vet.category_name || vet.search_string || ''
              const services = servicesText.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4)
              const location = vet.location || vet.city || vet.address
              const hours = vet.hours || vet.hours_summary
              const mapsUrl = vet.url || (vet.latitude && vet.longitude ? `https://www.google.com/maps?q=${vet.latitude},${vet.longitude}` : null)

              return (
                <article key={vet.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition">
                  {vet.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vet.image_url} alt={name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="h-40 bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-12 h-12 text-primary" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-xl font-bold text-foreground">{name}</h2>
                      {vet.total_score && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <Star className="w-3 h-3" /> {vet.total_score}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {services.map((service) => (
                        <span key={service} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/70">
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-3 text-sm text-foreground/60 mb-4">
                      {location && <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> {location}</p>}
                      {vet.address && vet.address !== location && <p className="text-xs pl-6">{vet.address}</p>}
                      {vet.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {vet.phone}</p>}
                      {hours && <p className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 flex-shrink-0" /> {hours}</p>}
                    </div>

                    {vet.promo && (
                      <p className="text-sm p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 mb-4">
                        {vet.promo}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {vet.website && (
                        <a href={vet.website} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="w-full"><Globe className="w-4 h-4 mr-2" /> Web</Button>
                        </a>
                      )}
                      {mapsUrl && (
                        <a href={mapsUrl} target="_blank" rel="noreferrer">
                          <Button className="w-full bg-primary hover:bg-primary/90"><Navigation className="w-4 h-4 mr-2" /> Mapa</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
