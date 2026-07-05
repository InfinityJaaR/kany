'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Calendar, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { FoundPetLeadButton, SharePetButton } from '@/components/pets/lost-pet-actions'
import { formatDistanceKm, haversineDistanceKm } from '@/lib/geo'
import { getLostStatusLabel, getPetEmoji } from '@/lib/pets-utils'
import type { LostPetRow } from '@/lib/data/queries'

type FoundPetMatcherProps = {
  pets: LostPetRow[]
}

type MatchResult = LostPetRow & {
  distanceKm: number | null
}

const colorOptions = [
  { value: '', label: 'Todos los colores' },
  { value: 'negro', label: 'Negro' },
  { value: 'blanco', label: 'Blanco' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'gris', label: 'Gris' },
  { value: 'dorado', label: 'Dorado' },
  { value: 'manchado', label: 'Manchado' },
  { value: 'atigrado', label: 'Atigrado' },
]

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function includesAllWords(source: string, query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  return words.every((word) => source.includes(word))
}

function getSearchText(pet: LostPetRow) {
  return normalize([
    pet.name,
    pet.breed,
    pet.color,
    pet.location,
    pet.location_department,
    pet.location_municipality,
    pet.description,
  ].filter(Boolean).join(' '))
}

export function FoundPetMatcher({ pets }: FoundPetMatcherProps) {
  const [location, setLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 3000,
  })
  const [query, setQuery] = useState('')
  const [breed, setBreed] = useState('')
  const [color, setColor] = useState('')
  const [showLocation, setShowLocation] = useState(false)

  const results = useMemo<MatchResult[]>(() => {
    return pets
      .map((pet) => {
        const distanceKm =
          location.latitude !== null &&
          location.longitude !== null &&
          pet.latitude !== null &&
          pet.longitude !== null
            ? haversineDistanceKm(location.latitude, location.longitude, pet.latitude, pet.longitude)
            : null

        return { ...pet, distanceKm }
      })
      .filter((pet) => {
        const searchText = getSearchText(pet)
        const withinRadius =
          location.latitude === null ||
          location.longitude === null ||
          pet.distanceKm === null ||
          pet.distanceKm <= location.radiusMeters / 1000

        return (
          withinRadius &&
          includesAllWords(searchText, query) &&
          includesAllWords(normalize([pet.breed, pet.description].filter(Boolean).join(' ')), breed) &&
          includesAllWords(normalize([pet.color, pet.description].filter(Boolean).join(' ')), color)
        )
      })
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (a.distanceKm === null) return 1
        if (b.distanceKm === null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [breed, color, location.latitude, location.longitude, location.radiusMeters, pets, query])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Buscar coincidencias</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, zona, descripcion..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <input
            value={breed}
            onChange={(event) => setBreed(event.target.value)}
            placeholder="Raza o tipo"
            className="h-10 rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={() => setShowLocation((current) => !current)}>
            <MapPin className="h-4 w-4" />
            {showLocation ? 'Ocultar ubicacion' : 'Filtrar por ubicacion'}
          </Button>
          <p className="text-sm text-foreground/60">
            {results.length} coincidencia{results.length === 1 ? '' : 's'} de {pets.length} reportes activos.
          </p>
        </div>

        {showLocation && (
          <div className="mt-4">
            <LocationPicker
              value={location}
              onChange={setLocation}
              title="Lugar donde viste la mascota"
              description="Usa tu ubicacion actual o mueve el pin al punto donde encontraste la mascota."
              emptyHint="Presiona Actual o arrastra el mapa para filtrar reportes cercanos."
              footerText="Los reportes se ordenan por distancia cuando el punto tiene coordenadas."
            />
          </div>
        )}
      </section>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <p className="mb-2 text-foreground/70">No encontramos reportes parecidos.</p>
          <p className="text-sm text-foreground/50">Prueba ampliar el radio o quitar filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {results.map((pet) => (
            <article
              key={pet.id}
              className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
            >
              {pet.image_url && (
                <div className="flex h-56 items-center justify-center bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pet.image_url} alt={pet.name} className="max-h-56 w-full object-contain" />
                </div>
              )}

              <div className="p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xl dark:bg-orange-900/30">
                        {getPetEmoji(pet.name)}
                      </div>
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {getLostStatusLabel(pet.status)}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{pet.name}</h3>
                  </div>
                  {pet.distanceKm !== null && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {formatDistanceKm(pet.distanceKm)}
                    </span>
                  )}
                </div>

                <div className="mb-4 space-y-2">
                  {pet.breed && <p className="text-sm text-foreground/60"><strong>Raza:</strong> {pet.breed}</p>}
                  {pet.color && <p className="text-sm text-foreground/60"><strong>Color:</strong> {pet.color}</p>}
                </div>

                <div className="mb-4 flex flex-col gap-3 text-sm text-foreground/60 sm:flex-row">
                  {pet.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {pet.location}
                    </div>
                  )}
                  {pet.date_text && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {pet.date_text}
                    </div>
                  )}
                </div>

                {pet.description && (
                  <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-foreground">{pet.description}</p>
                )}

                <div className="flex flex-col gap-3">
                  <FoundPetLeadButton petId={pet.id} petName={pet.name} />
                  <div className="grid grid-cols-2 gap-3">
                    <SharePetButton petName={pet.name} path={`/mascotas/perdidas/${pet.id}`} />
                    <Link href={`/mascotas/perdidas/${pet.id}`}>
                      <Button variant="outline" className="w-full">Ver detalle</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
