'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type SharePetButtonProps = {
  petName: string
  path: string
  className?: string
}

type MarkFoundButtonProps = {
  petId: number
  petName: string
  className?: string
}

type FoundPetLeadButtonProps = {
  petId: number
  petName: string
  className?: string
}

function getAbsoluteUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${window.location.origin}${path}`
}

export function SharePetButton({ petName, path, className }: SharePetButtonProps) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = getAbsoluteUrl(path)
    const text = `Ayuda a compartir la publicacion de ${petName}.`

    if (navigator.share) {
      await navigator.share({
        title: `Mascota perdida: ${petName}`,
        text,
        url,
      })
      return
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Button type="button" variant="outline" onClick={share} className={className}>
      <Share2 className="w-4 h-4" />
      {copied ? 'Link copiado' : 'Compartir'}
    </Button>
  )
}

export function MarkFoundButton({ petId, petName, className }: MarkFoundButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function notifyN8n(actorEmail: string | null | undefined) {
    try {
      await fetch('/api/n8n/lost-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostPetId: petId, event: 'found', actorEmail: actorEmail ?? undefined }),
      })
    } catch (notificationError) {
      console.error('n8n notification failed:', notificationError)
    }
  }

  async function markAsFound() {
    const confirmed = window.confirm(`Marcar a ${petName} como encontrada?`)
    if (!confirmed) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('lost_pets')
      .update({ status: 'found' })
      .eq('id', petId)

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    await notifyN8n(user?.email)

    router.refresh()
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="secondary"
        onClick={markAsFound}
        disabled={loading}
        className="w-full"
      >
        <CheckCircle className="w-4 h-4" />
        {loading ? 'Actualizando...' : 'Marcar como encontrada'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function FoundPetLeadButton({ petId, petName, className }: FoundPetLeadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function notifyOwner() {
    setLoading(true)
    setMessage(null)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/encontradas')
      return
    }

    try {
      const response = await fetch('/api/n8n/lost-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lostPetId: petId,
          event: 'found',
          actorEmail: user.email,
        }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo avisar al dueño.')
      }

      setMessage(`Avisamos al dueño de ${petName}. El enlace del correo abrirá este chat.`)
    } catch (notificationError) {
      setError(notificationError instanceof Error ? notificationError.message : 'No se pudo avisar al dueño.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button type="button" onClick={notifyOwner} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
        <CheckCircle className="w-4 h-4" />
        {loading ? 'Avisando...' : 'Creo que encontre esta mascota'}
      </Button>
      {message && <p className="mt-2 text-sm text-green-700 dark:text-green-400">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
