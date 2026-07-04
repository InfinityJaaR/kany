'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/auth/use-profile'

const PRESET_AMOUNTS = [5, 10, 25]

type DonateButtonProps = {
  campaignId: number
  campaignTitle: string
}

export function DonateButton({ campaignId, campaignTitle }: DonateButtonProps) {
  const router = useRouter()
  const { isLoggedIn, loading } = useProfile()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleOpen() {
    if (loading) return
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/donaciones')}`)
      return
    }
    setOpen(true)
    setMessage(null)
    setError(null)
  }

  async function handleDonate() {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount
    if (!finalAmount || finalAmount <= 0) {
      setError('Ingresa un monto válido.')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('donate_to_campaign', {
      p_campaign_id: campaignId,
      p_amount: finalAmount,
    })

    setSubmitting(false)

    if (rpcError) {
      setError(rpcError.message.includes('Not authenticated')
        ? 'Debes iniciar sesión para donar.'
        : rpcError.message)
      return
    }

    setMessage(`¡Gracias! Donaste $${finalAmount.toFixed(2)} a "${campaignTitle}".`)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        className="flex-1 bg-primary hover:bg-primary/90"
        onClick={handleOpen}
      >
        <Heart className="w-4 h-4 mr-2" /> Donar
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-1">Donar a campaña</h3>
            <p className="text-sm text-foreground/60 mb-4">{campaignTitle}</p>
            <p className="text-xs text-foreground/50 mb-4">Donación simulada para demo del hackathon.</p>

            <div className="flex gap-2 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset && !customAmount ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setAmount(preset)
                    setCustomAmount('')
                  }}
                >
                  ${preset}
                </Button>
              ))}
            </div>

            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Otro monto ($)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background mb-4"
            />

            {error && (
              <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={submitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={submitting}
                onClick={handleDonate}
              >
                {submitting ? 'Donando…' : 'Confirmar donación'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm shadow-lg">
          {message}
          <button
            type="button"
            className="block mt-2 text-xs underline"
            onClick={() => setMessage(null)}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  )
}
