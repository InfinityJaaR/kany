'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { LocateFixed, MapPin, Navigation, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VetCardImage } from '@/components/vets/vet-card-image'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceKm } from '@/lib/geo'
import type { VetRow } from '@/lib/data/queries'

type VetWithDistance = VetRow & { distanceKm: number }

function sortByDistance(vets: VetRow[], lat: number, lng: number): VetWithDistance[] {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusKm = 6371

  return vets
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((vet) => {
      const dLat = toRad(vet.latitude! - lat)
      const dLng = toRad(vet.longitude! - lng)
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(vet.latitude!)) * Math.sin(dLng / 2) ** 2
      const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return { ...vet, distanceKm }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6)
}

type NearbyVetsProps = {
  fallbackLat?: number | null
  fallbackLng?: number | null
}

function getVetVisual(vet: VetRow) {
  const text = `${vet.name ?? ''} ${vet.title ?? ''} ${vet.services ?? ''} ${vet.category_name ?? ''} ${vet.search_string ?? ''}`.toLowerCase()

  if (text.includes('groom') || text.includes('peluquer') || text.includes('baño')) {
    return { emoji: '✂️', label: 'Grooming & estética', gradient: 'from-pink-500 via-rose-400 to-orange-300' }
  }

  if (text.includes('pet shop') || text.includes('tienda') || text.includes('accesorio') || text.includes('alimento')) {
    return { emoji: '🛒', label: 'Pet shop', gradient: 'from-emerald-500 via-teal-400 to-cyan-300' }
  }

  if (text.includes('hospital') || text.includes('emergencia') || text.includes('24')) {
    return { emoji: '🏥', label: 'Hospital veterinario', gradient: 'from-blue-600 via-sky-500 to-cyan-300' }
  }

  return { emoji: '🐾', label: 'Clínica veterinaria', gradient: 'from-primary via-accent to-purple-400' }
}

export function NearbyVets({ fallbackLat, fallbackLng }: NearbyVetsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vets, setVets] = useState<VetWithDistance[]>([])
  const [locationLabel, setLocationLabel] = useState<string | null>(null)

  const loadNearby = useCallback(async (lat: number, lng: number, label: string) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('vets')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(500)

    setLoading(false)

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    const nearby = sortByDistance((data ?? []) as VetRow[], lat, lng)
    if (nearby.length === 0) {
      setError('No hay veterinarias con ubicación registrada cerca de ti.')
      return
    }

    setVets(nearby)
    setLocationLabel(label)
  }, [])

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadNearby(
          pos.coords.latitude,
          pos.coords.longitude,
          'Tu ubicación actual',
        )
      },
      () => {
        setLoading(false)
        if (fallbackLat != null && fallbackLng != null) {
          loadNearby(fallbackLat, fallbackLng, 'Ubicación de tu perfil')
        } else {
          setError('No se pudo obtener tu ubicación. Activa el GPS o completa tu perfil.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <section className="mb-10 bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Veterinarias cerca de ti</h2>
          <p className="text-sm text-foreground/60">
            Usa tu ubicación actual para ver las clínicas más cercanas.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleUseMyLocation}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
        >
          <LocateFixed className="w-4 h-4 mr-2" />
          {loading ? 'Buscando…' : 'Usar mi ubicación'}
        </Button>
      </div>

      {error && (
        <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </p>
      )}

      {locationLabel && vets.length > 0 && (
        <p className="text-xs text-foreground/50 mb-4">Mostrando resultados cerca de: {locationLabel}</p>
      )}

      {vets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vets.map((vet) => {
            const visual = getVetVisual(vet)
            const name = vet.name || vet.title || 'Veterinaria'

            return (
              <article
                key={vet.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition h-full flex flex-col"
              >
                <VetCardImage
                  imageUrl={vet.image_url}
                  name={name}
                  emoji={visual.emoji}
                  label={visual.label}
                  gradient={visual.gradient}
                />

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">{name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 whitespace-nowrap">
                      A {formatDistanceKm(vet.distanceKm)}
                    </span>
                  </div>
                  {vet.services && (
                    <p className="text-sm text-foreground/60 mb-2 line-clamp-2">{vet.services}</p>
                  )}
                  <div className="space-y-1 text-sm text-foreground/70 mb-3">
                    {(vet.address || vet.location) && (
                      <p className="flex items-start gap-1 line-clamp-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        {vet.address ?? vet.location}
                      </p>
                    )}
                    {vet.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        {vet.phone}
                      </p>
                    )}
                  </div>
                  {(vet.latitude != null && vet.longitude != null) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${vet.latitude},${vet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-auto text-sm text-primary hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Abrir en Maps
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!loading && vets.length === 0 && !error && (
        <p className="text-sm text-foreground/50">
          Pulsa el botón para buscar clínicas cerca. También puedes{' '}
          <Link href="#directorio" className="text-primary hover:underline">
            explorar el directorio completo
          </Link>
          .
        </p>
      )}
    </section>
  )
}
