'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRequireAuth } from '@/lib/auth/use-require-auth'
import { createClient } from '@/lib/supabase/client'

export default function NuevaCampanaPage() {
  const { ready, userId } = useRequireAuth({ userType: 'foundation' })
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [organization, setOrganization] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function notifyN8n(campaignId: number) {
    try {
      await fetch('/api/n8n/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, event: 'campaign.created' }),
      })
    } catch (notificationError) {
      console.error('n8n notification failed:', notificationError)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const goalNum = parseFloat(goal) || 0

    try {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          title,
          description,
          goal: goalNum,
          current: 0,
          donors: 0,
          days_left: 30,
          organization,
          status: 'normal',
          updates: 0,
          image_url: imageUrl,
          creator_id: userId,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      if (data?.id) {
        await notifyN8n(Number(data.id))
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
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-32 px-4 py-2 rounded-lg border border-border bg-background"
            placeholder="Historia del caso"
          />

          <ImageUpload
            bucket="campaign-images"
            folder="campaigns"
            label="Foto de la campaña (opcional)"
            onUploaded={setImageUrl}
            onClear={() => setImageUrl(null)}
          />

          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
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
              Campaña publicada correctamente.
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
