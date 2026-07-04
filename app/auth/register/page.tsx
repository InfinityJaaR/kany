'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { SiteHeader } from '@/components/layout/site-header'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }

    if (data.session) {
      router.push('/auth/onboarding')
      router.refresh()
      return
    }

    setMessage('Cuenta creada. Revisa tu correo para confirmar el registro y luego completa tu perfil.')
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Crear cuenta</h1>
        <p className="text-foreground/60 mb-8">
          Regístrate con Google o con correo y contraseña. Después completaremos tu perfil de Kany.
        </p>

        <GoogleSignInButton className="mb-6" />

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-foreground/50">o con correo</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            />
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mín. 6 caracteres)"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            />

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? 'Creando cuenta…' : 'Registrarse'}
            </Button>
          </form>

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

        <p className="mt-6 text-sm text-center text-foreground/60">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </main>
    </div>
  )
}
