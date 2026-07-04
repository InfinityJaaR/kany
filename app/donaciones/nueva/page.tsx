'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRequireAuth } from '@/lib/auth/use-require-auth'

export default function NuevaCampanaPage() {
  const { ready } = useRequireAuth({ userType: 'foundation' })
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [organization, setOrganization] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [consentNotify, setConsentNotify] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateDescription() {
    if (!title.trim()) {
      setError('Escribe el nombre del caso antes de generar con IA.')
      return
    }

    setAiLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'campana',
          nombre: title,
          organization,
          detalles: description,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'No se pudo generar la descripción')
      }

      setDescription(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar con IA')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!consentNotify) {
      setError('Debes aceptar recibir confirmación por correo.')
      return
    }

    setLoading(true)
    setError(null)

    const goalNum = parseFloat(goal) || 0

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          goal: goalNum,
          organization,
          description,
          image_url: imageUrl,
          notify: consentNotify,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'No se pudo crear la campaña')
      }

      setOk(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la campaña.')
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
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Crear campaña</h1>
        <p className="text-foreground/60 mb-8">Solo cuentas de fundación pueden publicar campañas.</p>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            placeholder="Nombre del caso"
          />
          <input
            required
            type="number"
            min="1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            placeholder="Meta en dólares"
          />
          <input
            required
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            placeholder="Nombre de la fundación"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Historia del caso</label>
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
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-32 px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Historia del caso (o usa Generar con IA)"
            />
          </div>

          <ImageUpload
            bucket="campaign-images"
            folder="campaigns"
            label="Foto de la campaña (opcional)"
            onUploaded={setImageUrl}
            onClear={() => setImageUrl(null)}
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentNotify}
              onChange={(e) => setConsentNotify(e.target.checked)}
              className="mt-1 rounded border-border"
            />
            <span className="text-sm text-foreground/80">
              Acepto recibir confirmación por correo sobre esta campaña.
            </span>
          </label>

          <Button type="submit" disabled={loading || !consentNotify} className="bg-primary hover:bg-primary/90">
            {loading ? 'Publicando…' : 'Publicar campaña'}
          </Button>

          {error && (
            <p className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          {ok && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex gap-2">
              <CheckCircle className="w-4 h-4" />
              Campaña publicada. Revisa tu correo para la confirmación.
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
