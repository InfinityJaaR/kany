'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { createClient } from '@/lib/supabase/client'

type LoginMode = 'password' | 'magic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const callbackError =
    searchParams.get('error') === 'auth_callback_error'
      ? 'No se pudo completar el inicio de sesión. Intenta de nuevo o usa correo y contraseña.'
      : null
  const [error, setError] = useState<string | null>(callbackError)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setMessage('Revisa tu correo. Te enviamos un enlace para iniciar sesión.')
  }

  return (
    <>
      <div className="flex gap-2 mb-6">
        <Button
          type="button"
          variant={mode === 'password' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setMode('password')}
        >
          Correo y contraseña
        </Button>
        <Button
          type="button"
          variant={mode === 'magic' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setMode('magic')}
        >
          Enlace por correo
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            />
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            />
            <p className="text-sm text-foreground/60">
              Te enviaremos un enlace seguro a tu bandeja de entrada. No necesitas contraseña.
            </p>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </Button>
          </form>
        )}

        {error && (
          <p className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
            {message}
          </p>
        )}
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Iniciar sesión</h1>
        <p className="text-foreground/60 mb-8">
          Accede con correo y contraseña o recibe un enlace mágico por correo.
        </p>

        <Suspense fallback={<p className="text-foreground/60">Cargando…</p>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-sm text-center text-foreground/60">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </main>
    </div>
  )
}
