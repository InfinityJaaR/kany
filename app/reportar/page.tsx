'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, Wand2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRequireAuth } from '@/lib/auth/use-require-auth'

export default function ReportarPage() {
  const router = useRouter()
  const { ready } = useRequireAuth()
  const [tipo, setTipo] = useState('perdida')
  const [nombre, setNombre] = useState('')
  const [raza, setRaza] = useState('')
  const [zona, setZona] = useState('')
  const [color, setColor] = useState('')
  const [contacto, setContacto] = useState('')
  const [detalles, setDetalles] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [consentNotify, setConsentNotify] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const texto = useMemo(
    () =>
      `🚨 ${tipo === 'perdida' ? 'SE BUSCA' : 'MASCOTA ENCONTRADA'} ${nombre || 'mascota'}. ${tipo === 'perdida' ? 'Se perdió' : 'Fue encontrada'} en ${zona || 'la zona indicada'}. Color/descripción: ${color || 'por completar'}. Si tienes información, contacta al número del reporte.`,
    [tipo, nombre, zona, color],
  )

  const previewText = detalles.trim() || texto

  async function handleGenerateDescription() {
    if (!nombre.trim()) {
      setError('Escribe el nombre o tipo de mascota antes de generar con IA.')
      return
    }

    setAiLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          nombre,
          raza,
          color,
          zona,
          detalles,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'No se pudo generar la descripción')
      }

      setDetalles(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar con IA')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!consentNotify) {
      setError('Debes aceptar recibir confirmación por correo o WhatsApp.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          nombre,
          raza,
          color,
          zona,
          contacto,
          detalles: previewText,
          image_url: imageUrl,
          notify: consentNotify,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'No se pudo publicar el reporte')
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
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="perdida">Mascota perdida</option>
              <option value="encontrada">Mascota encontrada</option>
            </select>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre o tipo de mascota"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
              placeholder="Raza o descripción"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Color"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              required
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Zona"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              required
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Contacto +503XXXXXXXX"
              pattern="(\+503)?[0-9]{8}"
              title="Formato: +503XXXXXXXX o 8 dígitos"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Detalles del reporte</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={aiLoading}
                onClick={handleGenerateDescription}
                className="gap-1.5"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {aiLoading ? 'Generando…' : 'Generar con IA'}
              </Button>
            </div>
            <textarea
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              placeholder="Detalles adicionales (o usa Generar con IA)"
              className="w-full min-h-28 px-4 py-2 rounded-lg border border-border bg-background"
            />
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
              Vista previa del texto a publicar
            </div>
            <p className="text-sm text-foreground/70">{previewText}</p>
          </div>

          <label className="mt-5 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentNotify}
              onChange={(e) => setConsentNotify(e.target.checked)}
              className="mt-1 rounded border-border"
            />
            <span className="text-sm text-foreground/80">
              Acepto recibir confirmación por correo y/o WhatsApp sobre este reporte.
            </span>
          </label>

          <Button
            type="submit"
            disabled={loading || !consentNotify}
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
              Reporte publicado correctamente. Revisa tu correo o WhatsApp.
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
