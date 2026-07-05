'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wand2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRequireAuth } from '@/lib/auth/use-require-auth'
import { createClient } from '@/lib/supabase/client'
import {
  formatRewardAmount,
  normalizeElSalvadorPhone,
  validatePetReportForm,
} from '@/lib/pet-report-validation'
import {
  getLostStatusLabel,
  LOST_PET_STATUS_OPTIONS,
  type LostPetStatus,
} from '@/lib/pets-utils'

const inputClass =
  'px-4 py-2 rounded-lg border border-border bg-background w-full'
const inputErrorClass =
  'px-4 py-2 rounded-lg border border-destructive bg-background w-full aria-invalid:border-destructive'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
}

export default function ReportarPage() {
  const router = useRouter()
  const { ready, userId } = useRequireAuth()
  const [tipo, setTipo] = useState('perdida')
  const [nombre, setNombre] = useState('')
  const [raza, setRaza] = useState('')
  const [zona, setZona] = useState('')
  const [color, setColor] = useState('')
  const [contacto, setContacto] = useState('')
  const [detalles, setDetalles] = useState('')
  const [tieneRecompensa, setTieneRecompensa] = useState(false)
  const [montoRecompensa, setMontoRecompensa] = useState('')
  const [estadoBusqueda, setEstadoBusqueda] = useState<LostPetStatus>('normal')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const texto = useMemo(() => {
    const urgencia =
      tipo === 'perdida' && estadoBusqueda !== 'normal'
        ? ` ${getLostStatusLabel(estadoBusqueda)}.`
        : ''
    const recompensa =
      tipo === 'perdida' && tieneRecompensa && montoRecompensa.trim()
        ? ` RECOMPENSA: $${montoRecompensa.trim()}.`
        : ''

    return `🚨 ${tipo === 'perdida' ? 'SE BUSCA' : 'MASCOTA ENCONTRADA'} ${nombre || 'mascota'}.${urgencia}${recompensa} ${tipo === 'perdida' ? 'Se perdió' : 'Fue encontrada'} en ${zona || 'la zona indicada'}. Color/descripción: ${color || 'por completar'}. Si tienes información, contacta al número del reporte.`
  }, [tipo, nombre, zona, color, estadoBusqueda, tieneRecompensa, montoRecompensa])

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    const errors = validatePetReportForm({
      tipo,
      nombre,
      raza,
      color,
      zona,
      contacto,
      detalles,
      tieneRecompensa,
      montoRecompensa,
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError(null)
      return
    }

    const normalizedContact = normalizeElSalvadorPhone(contacto)
    if (!normalizedContact) {
      setFieldErrors({ contacto: 'Usa un teléfono válido de El Salvador.' })
      return
    }

    setFieldErrors({})
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const reward =
      tipo === 'perdida' && tieneRecompensa
        ? formatRewardAmount(montoRecompensa) ?? ''
        : ''

    try {
      if (tipo === 'perdida') {
        const { error: insertError } = await supabase.from('lost_pets').insert({
          name: nombre.trim(),
          breed: raza.trim() || null,
          color: color.trim() || null,
          location: zona.trim(),
          date_text: 'Hoy',
          description: detalles.trim() || texto,
          reward,
          contact: normalizedContact,
          status: estadoBusqueda,
          image_url: imageUrl,
          reported_by: userId,
        })
        if (insertError) throw insertError
      } else {
        const { error: insertError } = await supabase.from('found_pets').insert({
          type: nombre.trim() || 'Mascota',
          breed: raza.trim() || null,
          color: color.trim() || null,
          location: zona.trim(),
          date_text: 'Hoy',
          description: detalles.trim() || texto,
          condition: 'Por confirmar',
          contact: normalizedContact,
          match: 'Sin coincidencias',
          status: 'normal',
          image_url: imageUrl,
          reported_by: userId,
        })
        if (insertError) throw insertError
      }
      setOk(true)
      setTimeout(() => router.push(tipo === 'perdida' ? '/perdidas' : '/encontradas'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Verificando sesión…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Formulario de reporte</h1>
        <p className="text-foreground/60 mb-4">Reporta mascotas perdidas o encontradas en Kany.</p>
        <PetsModuleNav active="reportar" />

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value)
                  setFieldErrors({})
                }}
                className={inputClass}
              >
                <option value="perdida">Mascota perdida</option>
                <option value="encontrada">Mascota encontrada</option>
              </select>
            </div>

            <div>
              <input
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  clearFieldError('nombre')
                }}
                placeholder="Nombre o tipo de mascota"
                aria-invalid={!!fieldErrors.nombre}
                className={fieldErrors.nombre ? inputErrorClass : inputClass}
              />
              <FieldError message={fieldErrors.nombre} />
            </div>

            <div>
              <input
                value={raza}
                onChange={(e) => {
                  setRaza(e.target.value)
                  clearFieldError('raza')
                }}
                placeholder="Raza o descripción"
                aria-invalid={!!fieldErrors.raza}
                className={fieldErrors.raza ? inputErrorClass : inputClass}
              />
              <FieldError message={fieldErrors.raza} />
            </div>

            <div>
              <input
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                  clearFieldError('color')
                }}
                placeholder="Color"
                aria-invalid={!!fieldErrors.color}
                className={fieldErrors.color ? inputErrorClass : inputClass}
              />
              <FieldError message={fieldErrors.color} />
            </div>

            <div>
              <input
                value={zona}
                onChange={(e) => {
                  setZona(e.target.value)
                  clearFieldError('zona')
                }}
                placeholder="Zona"
                aria-invalid={!!fieldErrors.zona}
                className={fieldErrors.zona ? inputErrorClass : inputClass}
              />
              <FieldError message={fieldErrors.zona} />
            </div>

            <div>
              <input
                value={contacto}
                onChange={(e) => {
                  setContacto(e.target.value)
                  clearFieldError('contacto')
                }}
                placeholder="+503 7123-4567"
                aria-invalid={!!fieldErrors.contacto}
                className={fieldErrors.contacto ? inputErrorClass : inputClass}
              />
              <p className="mt-1 text-xs text-foreground/50">
                Formato El Salvador: +503 seguido de 8 dígitos
              </p>
              <FieldError message={fieldErrors.contacto} />
            </div>
          </div>

          {tipo === 'perdida' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado de búsqueda
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
                      placeholder="Monto en dólares (ej. 50)"
                      aria-invalid={!!fieldErrors.montoRecompensa}
                      className={fieldErrors.montoRecompensa ? inputErrorClass : inputClass}
                    />
                    <FieldError message={fieldErrors.montoRecompensa} />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <textarea
              value={detalles}
              onChange={(e) => {
                setDetalles(e.target.value)
                clearFieldError('detalles')
              }}
              placeholder="Detalles adicionales"
              aria-invalid={!!fieldErrors.detalles}
              className={`min-h-28 ${fieldErrors.detalles ? inputErrorClass : inputClass}`}
            />
            <FieldError message={fieldErrors.detalles} />
          </div>

          <div className="mt-4">
            <ImageUpload
              bucket="pet-images"
              folder={tipo === 'perdida' ? 'lost' : 'found'}
              label="Foto de la mascota (opcional)"
              onUploaded={setImageUrl}
              onClear={() => setImageUrl(null)}
            />
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Wand2 className="w-4 h-4 text-primary" />
              Texto sugerido
            </div>
            <p className="text-sm text-foreground/70">{texto}</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-5 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Publicando…' : 'Publicar reporte'}
          </Button>

          {error && (
            <p className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          {ok && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex gap-2">
              <CheckCircle className="w-4 h-4" />
              Reporte publicado correctamente.
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
