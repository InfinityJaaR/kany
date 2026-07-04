'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { SiteHeader } from '@/components/layout/site-header'
import { createClient } from '@/lib/supabase/client'
import { needsOnboarding } from '@/lib/auth/onboarding'
import { USER_TYPE_LABELS, type UserType } from '@/types/auth'

const enableMagicLink = process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK === 'true'

const DEMO_PASSWORD = 'DemoKany2026!'

const DEMO_ACCOUNTS: { email: string; userType: UserType }[] = [
  { email: 'demo.usuario@kany.sv', userType: 'person' },
  { email: 'demo.fundacion@kany.sv', userType: 'foundation' },
  { email: 'demo.vet@kany.sv', userType: 'vet' },
]

type LoginMode = 'password' | 'magic'

function safeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/'
  return path
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get('redirect'))
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

  async function finishLogin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase
          .from('profiles')
          .select('onboarding_completed, home_latitude, home_longitude')
          .eq('id', user.id)
          .maybeSingle()
      : { data: null }

    if (needsOnboarding(profile)) {
      const onboardingUrl = new URL('/auth/onboarding', window.location.origin)
      if (redirectTo !== '/') onboardingUrl.searchParams.set('redirect', redirectTo)
      router.push(onboardingUrl.pathname + onboardingUrl.search)
    } else {
      router.push(redirectTo)
    }
    router.refresh()
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setLoading(false)
      setError(authError.message)
      return
    }

    setLoading(false)
    await finishLogin()
  }

  async function handleDemoLogin(demoEmail: string) {
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: DEMO_PASSWORD,
    })

    if (authError) {
      setLoading(false)
      setError(
        authError.message.includes('Invalid login')
          ? 'Cuenta demo no encontrada. Ejecuta: pnpm seed:demo'
          : authError.message,
      )
      return
    }

    setLoading(false)
    await finishLogin()
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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
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
      <GoogleSignInButton className="mb-6" />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-foreground/50">o con correo</span>
        </div>
      </div>

      {enableMagicLink && (
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
      )}

      <div className="bg-card border border-border rounded-2xl p-6">
        {mode === 'password' || !enableMagicLink ? (
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

      <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Cuentas demo para jurado</h2>
        <p className="text-sm text-foreground/60 mb-4">
          Contraseña para todas: <code className="text-xs bg-muted px-1 rounded">{DEMO_PASSWORD}</code>
        </p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <div
              key={account.email}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-background border border-border"
            >
              <div className="text-sm">
                <p className="font-medium text-foreground">{USER_TYPE_LABELS[account.userType]}</p>
                <p className="text-foreground/60">{account.email}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => handleDemoLogin(account.email)}
              >
                Entrar
              </Button>
            </div>
          ))}
        </div>
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
          Accede con Google o con correo y contraseña. Elige tu rol al completar el onboarding.
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
