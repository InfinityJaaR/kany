'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, LocateFixed, MapPin, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type HomeLocation = {
  label: string
  latitude: number | null
  longitude: number | null
  department: string | null
  municipality: string | null
  radiusMeters: number
}

type LocationPickerProps = {
  value: HomeLocation
  onChange: (value: HomeLocation) => void
  title?: string
  description?: string
  emptyHint?: string
  footerText?: string
}

type MapPoint = {
  x: number
  y: number
}

const TILE_SIZE = 256
const DEFAULT_LOCATION = {
  latitude: 13.6929,
  longitude: -89.2182,
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

function clampLatitude(latitude: number) {
  return Math.max(-85.05112878, Math.min(85.05112878, latitude))
}

function project(latitude: number, longitude: number, zoom: number): MapPoint {
  const scale = TILE_SIZE * 2 ** zoom
  const latRad = (clampLatitude(latitude) * Math.PI) / 180

  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      scale,
  }
}

function unproject(point: MapPoint, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom
  const longitude = (point.x / scale) * 360 - 180
  const n = Math.PI - (2 * Math.PI * point.y) / scale
  const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))

  return {
    latitude: clampLatitude(latitude),
    longitude: Math.max(-180, Math.min(180, longitude)),
  }
}

function getMunicipality(address: Record<string, string | undefined>) {
  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    null
  )
}

function getLocationLabel(data: {
  display_name?: string
  address?: Record<string, string | undefined>
}) {
  const address = data.address ?? {}
  const road = address.road ?? address.neighbourhood ?? address.suburb
  const municipality = getMunicipality(address)
  const department = address.state ?? address.region

  return [road, municipality, department].filter(Boolean).join(', ') || data.display_name || ''
}

export function LocationPicker({
  value,
  onChange,
  title = 'Ubicacion de casa',
  description = 'Usa tu ubicacion actual o mueve el mapa hasta dejar el pin sobre tu casa.',
  emptyHint = 'Presiona Actual o arrastra el mapa para elegir tu punto de alertas.',
  footerText = 'Este punto se usara para notificarte cuando una mascota perdida se reporte cerca.',
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    center: MapPoint
  } | null>(null)
  const [mapSize, setMapSize] = useState({ width: 416, height: 224 })
  const [zoom, setZoom] = useState(15)
  const [dragOffset, setDragOffset] = useState<MapPoint>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)

  const latitude = value.latitude ?? DEFAULT_LOCATION.latitude
  const longitude = value.longitude ?? DEFAULT_LOCATION.longitude
  const selected = value.latitude !== null && value.longitude !== null
  const center = useMemo(() => project(latitude, longitude, zoom), [latitude, longitude, zoom])

  useEffect(() => {
    if (!mapRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      setMapSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(mapRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!selected) return

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLocationStatus('Detectando zona...')
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}&zoom=12`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('reverse-geocode-failed')
        const data = (await response.json()) as {
          display_name?: string
          address?: Record<string, string | undefined>
        }
        const address = data.address ?? {}
        const department = address.state ?? address.region ?? null
        const municipality = getMunicipality(address)

        onChange({
          ...value,
          department,
          municipality,
          label: getLocationLabel(data),
        })
        setLocationStatus(null)
      } catch {
        if (!controller.signal.aborted) {
          setLocationStatus('No se pudo detectar la zona automaticamente.')
        }
      }
    }, 700)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [latitude, longitude, selected])

  function updateLocation(nextLatitude: number, nextLongitude: number) {
    onChange({
      ...value,
      label: '',
      department: null,
      municipality: null,
      latitude: roundCoordinate(nextLatitude),
      longitude: roundCoordinate(nextLongitude),
    })
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Tu navegador no permite detectar ubicacion.')
      return
    }

    setLocationStatus('Buscando tu ubicacion...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude)
        setLocationStatus(null)
      },
      () => {
        setLocationStatus('No pudimos acceder a tu ubicacion.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
      },
    )
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      center,
    }
    setIsDragging(true)
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return

    setDragOffset({
      x: event.clientX - dragRef.current.startX,
      y: event.clientY - dragRef.current.startY,
    })
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return

    const nextCenter = {
      x: dragRef.current.center.x - (event.clientX - dragRef.current.startX),
      y: dragRef.current.center.y - (event.clientY - dragRef.current.startY),
    }
    const next = unproject(nextCenter, zoom)

    dragRef.current = null
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    updateLocation(next.latitude, next.longitude)
  }

  const topLeft = {
    x: center.x - mapSize.width / 2 - dragOffset.x,
    y: center.y - mapSize.height / 2 - dragOffset.y,
  }
  const tiles = []
  const minTileX = Math.floor(topLeft.x / TILE_SIZE)
  const maxTileX = Math.floor((topLeft.x + mapSize.width) / TILE_SIZE)
  const minTileY = Math.floor(topLeft.y / TILE_SIZE)
  const maxTileY = Math.floor((topLeft.y + mapSize.height) / TILE_SIZE)
  const tileCount = 2 ** zoom

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      if (y < 0 || y >= tileCount) continue
      const wrappedX = ((x % tileCount) + tileCount) % tileCount
      tiles.push({
        key: `${x}-${y}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: x * TILE_SIZE - topLeft.x,
        top: y * TILE_SIZE - topLeft.y,
      })
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground">
            {title}
          </label>
          <p className="mt-1 text-xs text-foreground/60">
            {description}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={useCurrentLocation} className="gap-2">
          <LocateFixed className="h-4 w-4" />
          Actual
        </Button>
      </div>

      <div
        ref={mapRef}
        role="application"
        aria-label="Mapa para seleccionar ubicacion de casa"
        className={`relative h-64 overflow-hidden rounded-xl border border-border bg-muted ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="absolute h-64 w-64 select-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-primary p-2 text-primary-foreground shadow-lg">
          <MapPin className="h-5 w-5" />
        </div>
        <div
          className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(event) => {
              event.stopPropagation()
              setZoom((current) => Math.min(18, current + 1))
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(event) => {
              event.stopPropagation()
              setZoom((current) => Math.max(12, current - 1))
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
        {!selected && (
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-foreground/70 shadow-sm">
            {emptyHint}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs text-foreground/60">Departamento</p>
          <p className="mt-1 min-h-5 text-sm font-medium text-foreground">
            {value.department ?? 'Pendiente'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs text-foreground/60">Municipio</p>
          <p className="mt-1 min-h-5 text-sm font-medium text-foreground">
            {value.municipality ?? 'Pendiente'}
          </p>
        </div>
      </div>

      <label className="block text-xs text-foreground/60">
        Referencia opcional
        <input
          type="text"
          value={value.label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
          placeholder="Colonia, residencial o punto cercano"
          className="mt-1 w-full px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
        />
      </label>

      <label className="block text-xs text-foreground/60">
        Radio de alerta
        <div className="mt-1 flex h-10 items-center rounded-lg border border-border bg-background">
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
          <span className="flex-1 text-center text-sm font-medium text-foreground">
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

      {(locationStatus || selected) && (
        <p className="text-xs text-foreground/60 flex gap-2">
          <Crosshair className="h-4 w-4 shrink-0" />
          {locationStatus ?? footerText}
        </p>
      )}
    </section>
  )
}
