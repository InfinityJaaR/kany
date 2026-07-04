'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { SiteHeader } from '@/components/layout/site-header'
import { createClient } from '@/lib/supabase/client'
import { needsOnboarding } from '@/lib/auth/onboarding'
import type { Profile } from '@/types/auth'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState('')
  const [homeLocation, setHomeLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 1000,
  })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.replace('/auth/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle<Profile>()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (needsOnboarding(profile)) {
        router.replace('/auth/onboarding')
        return
      }

      setUser(currentUser)
      setFullName(profile?.full_name ?? currentUser.user_metadata?.full_name ?? '')
      setHomeLocation({
        label: profile?.home_location_label ?? '',
        latitude: profile?.home_latitude ?? null,
        longitude: profile?.home_longitude ?? null,
        department: profile?.home_department ?? null,
        municipality: profile?.home_municipality ?? null,
        radiusMeters: profile?.notification_radius_m ?? 1000,
      })
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const canChangePassword =
    user?.identities?.some((identity) => identity.provider === 'email') ?? false

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setError(null)
    setProfileMessage(null)

    if (!user) {
      router.replace('/auth/login')
      return
    }

    if (!homeLocation.latitude || !homeLocation.longitude) {
      setSavingProfile(false)
      setError('Selecciona la ubicacion de tu casa.')
      return
    }

    const supabase = createClient()
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        home_location_label: homeLocation.label,
        home_department: homeLocation.department,
        home_municipality: homeLocation.municipality,
        home_latitude: homeLocation.latitude,
        home_longitude: homeLocation.longitude,
        notification_radius_m: homeLocation.radiusMeters,
      })
      .eq('id', user.id)

    if (profileError) {
      setSavingProfile(false)
      setError(profileError.message)
      return
    }

    const { error: userError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    setSavingProfile(false)
    if (userError) {
      setError(userError.message)
      return
    }

    setProfileMessage('Perfil actualizado.')
    router.refresh()
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    setError(null)
    setPasswordMessage(null)

    if (password.length < 6) {
      setSavingPassword(false)
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setSavingPassword(false)
      setError('Las contrasenas no coinciden.')
      return
    }

    const supabase = createClient()
    const { error: passwordError } = await supabase.auth.updateUser({ password })

    setSavingPassword(false)
    if (passwordError) {
      setError(passwordError.message)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setPasswordMessage('Contrasena actualizada.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-foreground/60">Cargando...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mi perfil</h1>
        <p className="text-foreground/60 mb-8">
          Actualiza tu nombre y el punto desde donde quieres recibir alertas cercanas.
        </p>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserRound className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Datos personales</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Nombre
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nombre completo"
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </label>

              <LocationPicker value={homeLocation} onChange={setHomeLocation} />

              <Button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </form>

            {profileMessage && (
              <p className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                {profileMessage}
              </p>
            )}
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Contrasena</h2>
            </div>

            {canChangePassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nueva contrasena"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirmar nueva contrasena"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
                <Button
                  type="submit"
                  disabled={savingPassword}
                  variant="outline"
                  className="w-full"
                >
                  {savingPassword ? 'Actualizando...' : 'Cambiar contrasena'}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-foreground/60">
                Esta cuenta usa Google para iniciar sesion. La contrasena se administra desde tu cuenta de Google.
              </p>
            )}

            {passwordMessage && (
              <p className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                {passwordMessage}
              </p>
            )}
          </section>
        </div>

        {error && (
          <p className="mt-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </p>
        )}
      </main>
    </div>
  )
}
