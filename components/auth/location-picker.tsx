'use client'

import { Crosshair, LocateFixed, MapPin, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type HomeLocation = {
  label: string
  latitude: number | null
  longitude: number | null
  radiusMeters: number
}

type LocationPickerProps = {
  value: HomeLocation
  onChange: (value: HomeLocation) => void
}

const DEFAULT_LOCATION = {
  latitude: 13.6929,
  longitude: -89.2182,
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

function nudgeCoordinate(
  latitude: number,
  longitude: number,
  direction: 'north' | 'south' | 'east' | 'west',
) {
  const meters = 100
  const latOffset = meters / 111_320
  const lngOffset = meters / (111_320 * Math.cos((latitude * Math.PI) / 180))

  if (direction === 'north') return { latitude: latitude + latOffset, longitude }
  if (direction === 'south') return { latitude: latitude - latOffset, longitude }
  if (direction === 'east') return { latitude, longitude: longitude + lngOffset }
  return { latitude, longitude: longitude - lngOffset }
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const latitude = value.latitude ?? DEFAULT_LOCATION.latitude
  const longitude = value.longitude ?? DEFAULT_LOCATION.longitude
  const selected = value.latitude !== null && value.longitude !== null
  const bbox = [
    longitude - 0.01,
    latitude - 0.01,
    longitude + 0.01,
    latitude + 0.01,
  ].join(',')
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`

  function updateLocation(nextLatitude: number, nextLongitude: number) {
    onChange({
      ...value,
      latitude: roundCoordinate(nextLatitude),
      longitude: roundCoordinate(nextLongitude),
    })
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition((position) => {
      updateLocation(position.coords.latitude, position.coords.longitude)
    })
  }

  function nudge(direction: 'north' | 'south' | 'east' | 'west') {
    const next = nudgeCoordinate(latitude, longitude, direction)
    updateLocation(next.latitude, next.longitude)
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Ubicacion de casa
        </label>
        <input
          type="text"
          required
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="Colonia, municipio o referencia"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-muted">
        <div className="relative h-56">
          <iframe
            key={`${latitude}-${longitude}`}
            title="Mapa de ubicacion de casa"
            src={mapUrl}
            className="h-full w-full"
            loading="lazy"
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-primary p-2 text-primary-foreground shadow-lg">
            <MapPin className="h-5 w-5" />
          </div>
          {!selected && (
            <div className="absolute inset-x-3 bottom-3 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-foreground/70 shadow-sm">
              Usa tu ubicacion o ajusta el pin para guardar tu punto de alertas.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div />
        <Button type="button" variant="outline" onClick={() => nudge('north')}>
          Norte
        </Button>
        <div />
        <Button type="button" variant="outline" onClick={() => nudge('west')}>
          Oeste
        </Button>
        <Button type="button" variant="outline" onClick={useCurrentLocation} className="gap-2">
          <LocateFixed className="h-4 w-4" />
          Actual
        </Button>
        <Button type="button" variant="outline" onClick={() => nudge('east')}>
          Este
        </Button>
        <div />
        <Button type="button" variant="outline" onClick={() => nudge('south')}>
          Sur
        </Button>
        <div />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-xs text-foreground/60">
          Latitud
          <input
            type="number"
            step="0.000001"
            required
            value={value.latitude ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                latitude: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
          />
        </label>
        <label className="text-xs text-foreground/60">
          Longitud
          <input
            type="number"
            step="0.000001"
            required
            value={value.longitude ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                longitude: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
          />
        </label>
        <label className="text-xs text-foreground/60">
          Radio de alerta
          <div className="mt-1 flex items-center rounded-lg border border-border bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                onChange({
                  ...value,
                  radiusMeters: Math.max(500, value.radiusMeters - 500),
                })
              }
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="flex-1 text-center text-sm text-foreground">
              {value.radiusMeters / 1000} km
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                onChange({
                  ...value,
                  radiusMeters: Math.min(5000, value.radiusMeters + 500),
                })
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </label>
      </div>

      <p className="text-xs text-foreground/60 flex gap-2">
        <Crosshair className="h-4 w-4 shrink-0" />
        Este punto se usara para notificarte cuando una mascota perdida se reporte cerca.
      </p>
    </section>
  )
}
