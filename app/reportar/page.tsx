'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Mail, MapPin, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRequireAuth } from '@/lib/auth/use-require-auth'
import { createClient } from '@/lib/supabase/client'
import { formatRewardAmount } from '@/lib/pet-report-validation'
import {
  getLostStatusLabel,
  LOST_PET_STATUS_OPTIONS,
  type LostPetStatus,
} from '@/lib/pets-utils'

const inputClass =
  'px-4 py-2 rounded-lg border border-border bg-background w-full text-foreground'
const inputErrorClass =
  'px-4 py-2 rounded-lg border border-destructive bg-background w-full text-foreground aria-invalid:border-destructive'
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
}

export default function ReportarPage() {
  const router = useRouter()
  const { ready, userId } = useRequireAuth()
  const [nombre, setNombre] = useState('')
  const [raza, setRaza] = useState('')
  const [color, setColor] = useState('')
  const [contacto, setContacto] = useState('')
  const [detalles, setDetalles] = useState('')
  const [tieneRecompensa, setTieneRecompensa] = useState(false)
  const [montoRecompensa, setMontoRecompensa] = useState('')
  const [estadoBusqueda, setEstadoBusqueda] = useState<LostPetStatus>('urgent')
  const [lastSeenLocation, setLastSeenLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 1000,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reward = tieneRecompensa ? formatRewardAmount(montoRecompensa) ?? '' : ''
  const texto = useMemo(() => {
    const urgencia = estadoBusqueda !== 'normal' ? ` ${getLostStatusLabel(estadoBusqueda)}.` : ''
    const recompensa = reward ? ` Recompensa: ${reward}.` : ''
    const location = lastSeenLocation.label || lastSeenLocation.municipality || 'la zona indicada'

    return `SE BUSCA ${nombre || 'mascota'}.${urgencia}${recompensa} Se perdio en ${location}. Color/descripcion: ${color || 'por completar'}. Si tienes informacion, contacta al correo del reporte.`
  }, [nombre, color, estadoBusqueda, reward, lastSeenLocation.label, lastSeenLocation.municipality])

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validateForm() {
    const errors: Record<string, string> = {}
    if (nombre.trim().length < 2) errors.nombre = 'Ingresa el nombre de la mascota.'
    if (raza.trim().length > 200) errors.raza = 'La raza no puede superar 200 caracteres.'
    if (color.trim().length < 2) errors.color = 'Ingresa el color o senas principales.'
    if (!emailRegex.test(contacto.trim())) errors.contacto = 'Ingresa un correo de contacto valido.'
    if (!lastSeenLocation.latitude || !lastSeenLocation.longitude) {
      errors.location = 'Selecciona la ultima ubicacion donde fue vista la mascota.'
    }
    if (tieneRecompensa && !formatRewardAmount(montoRecompensa)) {
      errors.montoRecompensa = 'Ingresa un monto de recompensa valido.'
    }
    if (detalles.trim().length > 500) {
      errors.detalles = 'Los detalles no pueden superar 500 caracteres.'
    }
    return errors
  }

  async function notifyN8n(lostPetId: number) {
    try {
      await fetch('/api/n8n/lost-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostPetId, event: 'lost' }),
      })
    } catch (notificationError) {
      console.error('n8n notification failed:', notificationError)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError(null)
      return
    }

    setFieldErrors({})
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data, error: insertError } = await supabase
        .from('lost_pets')
        .insert({
          name: nombre.trim(),
          breed: raza.trim() || null,
          color: color.trim() || null,
          location: lastSeenLocation.label || lastSeenLocation.municipality,
          location_department: lastSeenLocation.department,
          location_municipality: lastSeenLocation.municipality,
          latitude: lastSeenLocation.latitude,
          longitude: lastSeenLocation.longitude,
          date_text: 'Hoy',
          description: detalles.trim() || texto,
          reward,
          contact: contacto.trim().toLowerCase(),
          status: estadoBusqueda,
          image_url: imageUrl,
          reported_by: userId,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      if (data?.id) {
        await notifyN8n(Number(data.id))
      }

      setOk(true)
      setTimeout(() => router.push('/perdidas'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Verificando sesion...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300 mb-4">
            <AlertTriangle className="h-4 w-4" />
            Reporte de mascota perdida
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Publicar mascota perdida</h1>
          <p className="text-foreground/60">
            Marca el punto donde fue vista por ultima vez para alertar a personas cercanas.
          </p>
        </div>

        <PetsModuleNav active="reportar" />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de la mascota
                </label>
                <input
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    clearFieldError('nombre')
                  }}
                  placeholder="Ej. Rocky"
                  aria-invalid={!!fieldErrors.nombre}
                  className={fieldErrors.nombre ? inputErrorClass : inputClass}
                />
                <FieldError message={fieldErrors.nombre} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correo de contacto
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                  <input
                    type="email"
                    value={contacto}
                    onChange={(e) => {
                      setContacto(e.target.value)
                      clearFieldError('contacto')
                    }}
                    placeholder="correo@ejemplo.com"
                    aria-invalid={!!fieldErrors.contacto}
                    className={`${fieldErrors.contacto ? inputErrorClass : inputClass} pl-9`}
                  />
                </div>
                <FieldError message={fieldErrors.contacto} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Raza o tipo
                </label>
                <input
                  value={raza}
                  onChange={(e) => {
                    setRaza(e.target.value)
                    clearFieldError('raza')
                  }}
                  placeholder="Ej. Labrador, criollo, gato adulto"
                  aria-invalid={!!fieldErrors.raza}
                  className={fieldErrors.raza ? inputErrorClass : inputClass}
                />
                <FieldError message={fieldErrors.raza} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Color o senas
                </label>
                <input
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value)
                    clearFieldError('color')
                  }}
                  placeholder="Ej. Cafe con collar rojo"
                  aria-invalid={!!fieldErrors.color}
                  className={fieldErrors.color ? inputErrorClass : inputClass}
                />
                <FieldError message={fieldErrors.color} />
              </div>
            </div>

            <LocationPicker
              value={lastSeenLocation}
              onChange={(value) => {
                setLastSeenLocation(value)
                clearFieldError('location')
              }}
              title="Ultima ubicacion vista"
              description="Usa tu ubicacion actual o mueve el mapa hasta dejar el pin donde se vio por ultima vez."
              emptyHint="Presiona Actual o arrastra el mapa para elegir la ultima ubicacion vista."
              footerText="Este punto se enviara a n8n para buscar usuarios cercanos al reporte."
            />
            <FieldError message={fieldErrors.location} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado de busqueda
                </label>
                <select
                  value={estadoBusqueda}
                  onChange={(e) => setEstadoBusqueda(e.target.value as LostPetStatus)}
                  className={inputClass}
                >
                  {LOST_PET_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <input
                    type="checkbox"
                    checked={tieneRecompensa}
                    onChange={(e) => {
                      setTieneRecompensa(e.target.checked)
                      if (!e.target.checked) {
                        setMontoRecompensa('')
                        clearFieldError('montoRecompensa')
                      }
                    }}
                    className="rounded border-border"
                  />
                  Ofrecer recompensa
                </label>
                {tieneRecompensa && (
                  <>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={montoRecompensa}
                      onChange={(e) => {
                        setMontoRecompensa(e.target.value)
                        clearFieldError('montoRecompensa')
                      }}
                      placeholder="Monto en dolares"
                      aria-invalid={!!fieldErrors.montoRecompensa}
                      className={fieldErrors.montoRecompensa ? inputErrorClass : inputClass}
                    />
                    <FieldError message={fieldErrors.montoRecompensa} />
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Detalles adicionales
              </label>
              <textarea
                value={detalles}
                onChange={(e) => {
                  setDetalles(e.target.value)
                  clearFieldError('detalles')
                }}
                placeholder="Describe como se perdio, rasgos especiales, comportamiento o cualquier dato util."
                aria-invalid={!!fieldErrors.detalles}
                className={`min-h-32 ${fieldErrors.detalles ? inputErrorClass : inputClass}`}
              />
              <FieldError message={fieldErrors.detalles} />
            </div>

            <ImageUpload
              bucket="pet-images"
              folder="lost"
              label="Foto de la mascota (opcional)"
              onUploaded={setImageUrl}
              onClear={() => setImageUrl(null)}
            />
          </section>

          <aside className="space-y-4">
            <section className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold mb-3">
                <Wand2 className="w-4 h-4 text-primary" />
                Vista previa
              </div>
              <div className="rounded-xl bg-muted p-4 text-sm text-foreground/70 space-y-3">
                <p>{texto}</p>
                <div className="flex items-start gap-2 text-xs text-foreground/60">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {lastSeenLocation.label ||
                      lastSeenLocation.municipality ||
                      'Ubicacion pendiente'}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-5 w-full bg-primary hover:bg-primary/90"
              >
                {loading ? 'Publicando...' : 'Publicar y alertar'}
              </Button>

              {error && (
                <p className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </p>
              )}

              {ok && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Reporte publicado y notificacion preparada.
                </div>
              )}
            </section>
          </aside>
        </form>
      </main>
    </div>
  )
}
