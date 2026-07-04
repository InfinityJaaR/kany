import Link from 'next/link'
import { MapPin, Phone, Clock, ShieldCheck, Search, Plus, Star, Globe, Navigation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { NearbyVets } from '@/components/vets/nearby-vets'
import { getSessionProfile } from '@/lib/auth/profile'
import { fetchVetFilterOptions, fetchVets } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{
    q?: string
    city?: string
    category?: string
    page?: string
  }>
}

function buildVetsHref(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `/veterinarias?${query}` : '/veterinarias'
}

export default async function VeterinariasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params?.q ?? ''
  const city = params?.city ?? ''
  const category = params?.category ?? ''
  const page = Number(params?.page ?? '1') || 1
  const pageSize = 24

  const [result, filters] = await Promise.all([
    fetchVets({ q, city, category, page, pageSize }),
    fetchVetFilterOptions(),
  ])
  const { userType, profile } = await getSessionProfile()
  const isVet = userType === 'vet'
  const vets = result.data
  const from = result.count === 0 ? 0 : (result.page - 1) * result.pageSize + 1
  const to = Math.min(result.page * result.pageSize, result.count)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Veterinarias Aliadas</h1>
            <p className="text-foreground/60">Directorio de clínicas, hospitales, pet shops y servicios para mascotas</p>
          </div>
          {isVet ? (
            <Link href="/veterinarias/registrar">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Mi clínica
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login?redirect=/veterinarias/registrar">
              <Button size="lg" variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Registrar veterinaria
              </Button>
            </Link>
          )}
        </div>

        <NearbyVets
          fallbackLat={profile?.home_latitude}
          fallbackLng={profile?.home_longitude}
        />

        <div id="directorio">
        <form className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_220px_240px_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por clínica, servicio, ciudad o dirección..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            name="city"
            defaultValue={city}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las ciudades</option>
            {filters.cities.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <select
            name="category"
            defaultValue={category}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las categorías</option>
            {filters.categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <Button type="submit" className="bg-primary hover:bg-primary/90">Buscar</Button>
        </form>

        {(q || city || category) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            {q && <span className="px-3 py-1 rounded-full bg-muted text-foreground/70">Búsqueda: {q}</span>}
            {city && <span className="px-3 py-1 rounded-full bg-muted text-foreground/70">Ciudad: {city}</span>}
            {category && <span className="px-3 py-1 rounded-full bg-muted text-foreground/70">Categoría: {category}</span>}
            <Link href="/veterinarias" className="inline-flex items-center gap-1 text-primary hover:underline">
              <X className="w-4 h-4" /> Limpiar filtros
            </Link>
          </div>
        )}

        <p className="text-sm text-foreground/60 mb-8">
          Mostrando {from}-{to} de {result.count} resultado{result.count === 1 ? '' : 's'}
        </p>

        {vets.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60 mb-4">No hay veterinarias registradas o no coinciden con tu búsqueda.</p>
            <Link href="/veterinarias">
              <Button className="bg-primary hover:bg-primary/90">Ver todas</Button>
            </Link>
          </div>
        ) : (
          <>
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

            {result.totalPages > 1 && (
              <nav className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-foreground/60">
                  Página {result.page} de {result.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  {result.page > 1 ? (
                    <Link href={buildVetsHref({ q, city, category, page: result.page - 1 })}>
                      <Button variant="outline">Anterior</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" disabled>Anterior</Button>
                  )}

                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(result.totalPages, 5) }, (_, index) => {
                      const start = Math.max(1, Math.min(result.page - 2, result.totalPages - 4))
                      const pageNumber = start + index
                      return (
                        <Link key={pageNumber} href={buildVetsHref({ q, city, category, page: pageNumber })}>
                          <Button variant={pageNumber === result.page ? 'default' : 'outline'}>{pageNumber}</Button>
                        </Link>
                      )
                    })}
                  </div>

                  {result.page < result.totalPages ? (
                    <Link href={buildVetsHref({ q, city, category, page: result.page + 1 })}>
                      <Button variant="outline">Siguiente</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" disabled>Siguiente</Button>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
        </div>
      </main>
    </div>
  )
}
