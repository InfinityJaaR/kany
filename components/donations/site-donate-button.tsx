'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePayPalDonation } from '@/lib/donations/use-paypal-donation'
import { useProfile } from '@/lib/auth/use-profile'

const PRESET_AMOUNTS = [5, 10, 25]

type SiteDonateButtonProps = {
  paypalMode?: 'simulated' | 'sandbox'
}

export function SiteDonateButton({ paypalMode = 'simulated' }: SiteDonateButtonProps) {
  const router = useRouter()
  const { isLoggedIn, loading } = useProfile()
  const { startDonation, isLoading, feedback, clearFeedback } = usePayPalDonation()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const modeLabel =
    paypalMode === 'sandbox' ? 'PayPal Sandbox' : 'PayPal Sandbox (simulado)'

  function handleOpen() {
    if (loading) return
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/donaciones')}`)
      return
    }
    setOpen(true)
    setError(null)
    clearFeedback()
  }

  async function handleDonate() {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount
    if (!finalAmount || finalAmount <= 0) {
      setError('Ingresa un monto válido.')
      return
    }

    setError(null)
    setOpen(false)

    await startDonation({
      amount: finalAmount,
      type: 'site_support',
    })
  }

  const displayMessage =
    feedback?.message ??
    (feedback?.status === 'cancelled' ? 'Cancelaste el pago en PayPal.' : null)

  return (
    <>
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90"
        onClick={handleOpen}
        disabled={isLoading}
      >
        <HeartHandshake className="w-4 h-4 mr-2" />
        {isLoading ? 'Abriendo PayPal…' : 'Donar a la plataforma'}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-1">Apoyar la plataforma Kany</h3>
            <p className="text-sm text-foreground/60 mb-4">
              Tu donación ayuda a mantener la plataforma comunitaria.
            </p>
            <p className="text-xs text-foreground/50 mb-4">
              Pago con {modeLabel}. Se abrirá una pestaña de checkout.
            </p>

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
                disabled={isLoading}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isLoading}
                onClick={handleDonate}
              >
                Continuar con PayPal
              </Button>
            </div>
          </div>
        </div>
      )}

      {displayMessage && (
        <div
          className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-xl text-sm shadow-lg border ${
            feedback?.status === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : feedback?.status === 'cancelled'
                ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}
        >
          {displayMessage}
          <button
            type="button"
            className="block mt-2 text-xs underline"
            onClick={clearFeedback}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  )
}
