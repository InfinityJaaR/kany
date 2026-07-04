'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { createClient } from '@/lib/supabase/client'
import { USER_TYPE_LABELS, type UserType } from '@/types/auth'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType>('person')
  const [homeLocation, setHomeLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 1000,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!homeLocation.latitude || !homeLocation.longitude) {
      setLoading(false)
      setError('Selecciona la ubicacion de tu casa para activar alertas cercanas.')
      return
    }

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          home_location_label: homeLocation.label,
          home_latitude: homeLocation.latitude,
          home_longitude: homeLocation.longitude,
          home_department: homeLocation.department,
          home_municipality: homeLocation.municipality,
          notification_radius_m: homeLocation.radiusMeters,
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
      router.push('/')
      router.refresh()
      return
    }

    setMessage('Cuenta creada. Revisa tu correo para confirmar el registro.')
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Crear cuenta</h1>
        <p className="text-foreground/60 mb-8">
          Elige tu tipo de usuario para acceder a las funciones de Kany.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo de usuario</label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(USER_TYPE_LABELS) as UserType[]).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      userType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value={type}
                      checked={userType === type}
                      onChange={() => setUserType(type)}
                      className="accent-primary"
                    />
                    <span className="text-sm font-medium text-foreground">{USER_TYPE_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            </div>

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

            <div className="text-xs text-foreground/60 space-y-1">
              {userType === 'person' && <p>Podrás reportar mascotas perdidas o encontradas.</p>}
              {userType === 'foundation' && <p>Podrás crear y gestionar campañas de donación.</p>}
              {userType === 'vet' && <p>Podrás registrar y editar tu clínica veterinaria.</p>}
            </div>

            <LocationPicker value={homeLocation} onChange={setHomeLocation} />

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
