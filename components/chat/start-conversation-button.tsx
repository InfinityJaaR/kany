'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type StartConversationButtonProps = {
  lostPetId: number
  disabled?: boolean
  className?: string
}

export function StartConversationButton({
  lostPetId,
  disabled = false,
  className,
}: StartConversationButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startConversation() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostPetId }),
      })
      const data = (await response.json()) as { id?: string; error?: string }

      if (!response.ok || !data.id) {
        throw new Error(data.error ?? 'No se pudo abrir el chat.')
      }

      router.push(`/mensajes?conversation=${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el chat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={startConversation}
        disabled={disabled || loading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        <MessageCircle className="h-4 w-4" />
        {loading ? 'Abriendo...' : 'Enviar mensaje'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
