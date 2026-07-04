'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { createClient } from '@/lib/supabase/client'
import { needsOnboarding } from '@/lib/auth/onboarding'
import { USER_TYPE_LABELS, type Profile, type UserType } from '@/types/auth'

export default function OnboardingPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>('person')
  const [homeLocation, setHomeLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 1000,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle<Profile>()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (!needsOnboarding(profile)) {
        router.replace('/')
        return
      }

      if (profile) {
        setUserType(profile.user_type)
        setHomeLocation({
          label: profile.home_location_label ?? '',
          latitude: profile.home_latitude,
          longitude: profile.home_longitude,
          department: profile.home_department,
          municipality: profile.home_municipality,
          radiusMeters: profile.notification_radius_m ?? 1000,
        })
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!homeLocation.latitude || !homeLocation.longitude) {
      setSubmitting(false)
      setError('Selecciona la ubicacion de tu casa para activar alertas cercanas.')
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/auth/login')
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        user_type: userType,
        home_location_label: homeLocation.label,
        home_department: homeLocation.department,
        home_municipality: homeLocation.municipality,
        home_latitude: homeLocation.latitude,
        home_longitude: homeLocation.longitude,
        notification_radius_m: homeLocation.radiusMeters,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (profileError) {
      setSubmitting(false)
      setError(profileError.message)
      return
    }

    await supabase.auth.updateUser({
      data: {
        user_type: userType,
        onboarding_completed: true,
      },
    })

    setSubmitting(false)
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-md mx-auto px-4 py-12">
          <p className="text-foreground/60">Cargando...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Completa tu perfil</h1>
        <p className="text-foreground/60 mb-8">
          Estos datos nos ayudan a mostrarte funciones segun tu rol y activar alertas cercanas.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de usuario
              </label>
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
                    <span className="text-sm font-medium text-foreground">
                      {USER_TYPE_LABELS[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="text-xs text-foreground/60 space-y-1">
              {userType === 'person' && <p>Podras reportar mascotas perdidas o encontradas.</p>}
              {userType === 'foundation' && <p>Podras crear y gestionar campanas de donacion.</p>}
              {userType === 'vet' && <p>Podras registrar y editar tu clinica veterinaria.</p>}
            </div>

            <LocationPicker value={homeLocation} onChange={setHomeLocation} />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {submitting ? 'Guardando...' : 'Guardar y continuar'}
            </Button>
          </form>

          {error && (
            <p className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
