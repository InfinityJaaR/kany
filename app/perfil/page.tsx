'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  FilePenLine,
  HeartHandshake,
  KeyRound,
  MapPin,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { SharePetButton } from '@/components/pets/lost-pet-actions'
import { ImageUpload } from '@/components/ui/image-upload'
import { createClient } from '@/lib/supabase/client'
import { needsOnboarding } from '@/lib/auth/onboarding'
import { formatRewardAmount } from '@/lib/pet-report-validation'
import { getLostStatusLabel, LOST_PET_STATUS_OPTIONS, type LostPetStatus } from '@/lib/pets-utils'
import { USER_TYPE_LABELS, type Profile, type UserType } from '@/types/auth'
import type { User } from '@supabase/supabase-js'
import type { LucideIcon } from 'lucide-react'

type SectionKey = 'general' | 'security' | 'publications' | 'vet' | 'campaigns'

type ProfileSection = {
  key: SectionKey
  label: string
  icon: LucideIcon
}

type LostPetDraft = {
  id: number
  name: string
  breed: string
  color: string
  location: string
  location_department: string | null
  location_municipality: string | null
  latitude: number | null
  longitude: number | null
  description: string
  reward: string
  contact: string
  status: string
  image_url: string | null
  created_at: string
}

type VetSummary = {
  id: number
  name: string
  services: string | null
  location: string | null
  phone: string | null
}

type CampaignSummary = {
  id: number
  title: string
  goal: number
  current: number
  donors: number
  status: string
}

const inputClass = 'w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground'
const panelClass = 'border-b border-border py-6 first:pt-0 last:border-b-0'

function sectionLabel(section: SectionKey) {
  if (section === 'general') return 'General'
  if (section === 'security') return 'Seguridad'
  if (section === 'publications') return 'Mis publicaciones'
  if (section === 'vet') return 'Mi veterinaria'
  return 'Mis campanas'
}

function normalizeSection(value: string | null, userType?: UserType): SectionKey {
  if (value === 'security') return 'security'
  if (value === 'publications' && userType === 'person') return 'publications'
  if (value === 'vet' && userType === 'vet') return 'vet'
  if (value === 'campaigns' && userType === 'foundation') return 'campaigns'
  return 'general'
}

function toLocation(pet: LostPetDraft): HomeLocation {
  return {
    label: pet.location ?? '',
    latitude: pet.latitude,
    longitude: pet.longitude,
    department: pet.location_department,
    municipality: pet.location_municipality,
    radiusMeters: 1000,
  }
}

function normalizeLostPet(pet: Partial<LostPetDraft> & { id: number; name: string; status: string; created_at: string }): LostPetDraft {
  return {
    id: pet.id,
    name: pet.name ?? '',
    breed: pet.breed ?? '',
    color: pet.color ?? '',
    location: pet.location ?? '',
    location_department: pet.location_department ?? null,
    location_municipality: pet.location_municipality ?? null,
    latitude: pet.latitude ?? null,
    longitude: pet.longitude ?? null,
    description: pet.description ?? '',
    reward: pet.reward ?? '',
    contact: pet.contact ?? '',
    status: pet.status,
    image_url: pet.image_url ?? null,
    created_at: pet.created_at,
  }
}

function formatMoney(value: number) {
  return `$${Number(value).toFixed(2)}`
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeSection, setActiveSection] = useState<SectionKey>('general')
  const [fullName, setFullName] = useState('')
  const [homeLocation, setHomeLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 1000,
  })
  const [lostPets, setLostPets] = useState<LostPetDraft[]>([])
  const [editingPetId, setEditingPetId] = useState<number | null>(null)
  const [editingPet, setEditingPet] = useState<LostPetDraft | null>(null)
  const [editingPetLocation, setEditingPetLocation] = useState<HomeLocation | null>(null)
  const [vets, setVets] = useState<VetSummary[]>([])
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPet, setSavingPet] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [petMessage, setPetMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.replace('/auth/login')
        return
      }

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle<Profile>()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (needsOnboarding(currentProfile)) {
        router.replace('/auth/onboarding')
        return
      }

      setUser(currentUser)
      setProfile(currentProfile)
      setActiveSection(normalizeSection(searchParams.get('section'), currentProfile?.user_type))
      setFullName(currentProfile?.full_name ?? currentUser.user_metadata?.full_name ?? '')
      setHomeLocation({
        label: currentProfile?.home_location_label ?? '',
        latitude: currentProfile?.home_latitude ?? null,
        longitude: currentProfile?.home_longitude ?? null,
        department: currentProfile?.home_department ?? null,
        municipality: currentProfile?.home_municipality ?? null,
        radiusMeters: currentProfile?.notification_radius_m ?? 1000,
      })

      if (currentProfile?.user_type === 'person') {
        const { data } = await supabase
          .from('lost_pets')
          .select('*')
          .eq('reported_by', currentUser.id)
          .order('created_at', { ascending: false })
        setLostPets(((data ?? []) as LostPetDraft[]).map(normalizeLostPet))
      }

      if (currentProfile?.user_type === 'vet') {
        const { data } = await supabase
          .from('vets')
          .select('id, name, services, location, phone')
          .eq('owner_id', currentUser.id)
          .order('created_at', { ascending: false })
        setVets((data ?? []) as VetSummary[])
      }

      if (currentProfile?.user_type === 'foundation') {
        const { data } = await supabase
          .from('campaigns')
          .select('id, title, goal, current, donors, status')
          .eq('creator_id', currentUser.id)
          .order('created_at', { ascending: false })
        setCampaigns((data ?? []) as CampaignSummary[])
      }

      setLoading(false)
    }

    loadProfile()
  }, [router, searchParams])

  const sections = useMemo(() => {
    const base: ProfileSection[] = [
      { key: 'general' as const, label: 'General', icon: Settings },
      { key: 'security' as const, label: 'Seguridad', icon: ShieldCheck },
    ]

    if (profile?.user_type === 'person') {
      base.push({ key: 'publications', label: 'Mis publicaciones', icon: FilePenLine })
    }
    if (profile?.user_type === 'vet') {
      base.push({ key: 'vet', label: 'Mi veterinaria', icon: Building2 })
    }
    if (profile?.user_type === 'foundation') {
      base.push({ key: 'campaigns', label: 'Mis campanas', icon: HeartHandshake })
    }

    return base
  }, [profile?.user_type])

  const canChangePassword =
    user?.identities?.some((identity) => identity.provider === 'email') ?? false

  function selectSection(section: SectionKey) {
    setActiveSection(section)
    router.replace(`/perfil?section=${section}`)
  }

  function startEditingPet(pet: LostPetDraft) {
    setEditingPetId(pet.id)
    setEditingPet({ ...pet })
    setEditingPetLocation(toLocation(pet))
    setPetMessage(null)
    setError(null)
  }

  function updateEditingPet<K extends keyof LostPetDraft>(key: K, value: LostPetDraft[K]) {
    setEditingPet((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

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

  async function handlePetSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !editingPet || !editingPetLocation) return

    if (!editingPet.name.trim()) {
      setError('El nombre de la mascota es obligatorio.')
      return
    }

    if (!editingPetLocation.latitude || !editingPetLocation.longitude) {
      setError('Selecciona la ultima ubicacion vista.')
      return
    }

    setSavingPet(true)
    setError(null)
    setPetMessage(null)

    const reward = editingPet.reward ? formatRewardAmount(editingPet.reward) ?? editingPet.reward : ''
    const supabase = createClient()
    const payload = {
      name: editingPet.name.trim(),
      breed: editingPet.breed.trim() || null,
      color: editingPet.color.trim() || null,
      location: editingPetLocation.label || editingPetLocation.municipality,
      location_department: editingPetLocation.department,
      location_municipality: editingPetLocation.municipality,
      latitude: editingPetLocation.latitude,
      longitude: editingPetLocation.longitude,
      description: editingPet.description.trim() || null,
      reward,
      contact: editingPet.contact.trim().toLowerCase() || null,
      status: editingPet.status,
      image_url: editingPet.image_url,
    }

    const { error: updateError } = await supabase
      .from('lost_pets')
      .update(payload)
      .eq('id', editingPet.id)
      .eq('reported_by', user.id)

    setSavingPet(false)
    if (updateError) {
      setError(updateError.message)
      return
    }

    setLostPets((prev) =>
      prev.map((pet) =>
        pet.id === editingPet.id
          ? {
              ...pet,
              ...payload,
              breed: payload.breed,
              color: payload.color,
              description: payload.description,
              contact: payload.contact,
            }
          : pet,
      ) as LostPetDraft[],
    )
    setPetMessage('Publicacion actualizada.')
    setEditingPetId(null)
    setEditingPet(null)
    setEditingPetLocation(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="border-b lg:border-b-0 lg:border-r border-border bg-card/70 px-4 py-5 lg:sticky lg:top-0 lg:h-screen">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon-lg" aria-label="Volver al inicio">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="font-semibold leading-tight">{fullName || user?.email}</p>
              <p className="text-sm text-foreground/50">{profile?.user_type ? USER_TYPE_LABELS[profile.user_type] : 'Cuenta'}</p>
            </div>
          </div>

          <nav className="flex lg:block gap-2 overflow-x-auto lg:space-y-2">
            {sections.map((item) => {
              const Icon = item.icon
              const active = activeSection === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => selectSection(item.key)}
                  className={`flex w-full min-w-max items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="px-5 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 border-b border-border pb-6">
              <h1 className="text-3xl font-bold">{sectionLabel(activeSection)}</h1>
              <p className="mt-2 text-foreground/60">
                Administra solo la informacion que corresponde a tu rol en Kany.
              </p>
            </div>

            {error && (
              <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            {activeSection === 'general' && (
              <section>
                <form onSubmit={handleProfileSubmit}>
                  <div className={panelClass}>
                    <div className="flex items-center gap-2 mb-4">
                      <UserRound className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Datos personales</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium">
                        Nombre
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          className={`${inputClass} mt-2`}
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        Correo
                        <input value={user?.email ?? ''} readOnly className={`${inputClass} mt-2 opacity-70`} />
                      </label>
                    </div>
                  </div>

                  {profile?.user_type === 'person' && (
                    <div className={panelClass}>
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold">Ubicacion de casa</h2>
                        <p className="mt-1 text-sm text-foreground/60">
                          Este punto sirve para calcular reportes cercanos.
                        </p>
                      </div>
                      <LocationPicker value={homeLocation} onChange={setHomeLocation} />
                    </div>
                  )}

                  <div className="pt-6">
                    <Button type="submit" disabled={savingProfile} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4" />
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                </form>

                {profileMessage && (
                  <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {profileMessage}
                  </p>
                )}
              </section>
            )}

            {activeSection === 'security' && (
              <section className={panelClass}>
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Contrasena</h2>
                </div>

                {canChangePassword ? (
                  <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-4">
                    <input
                      type="password"
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Nueva contrasena"
                      className={inputClass}
                    />
                    <input
                      type="password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirmar nueva contrasena"
                      className={inputClass}
                    />
                    <Button type="submit" disabled={savingPassword} variant="outline">
                      {savingPassword ? 'Actualizando...' : 'Cambiar contrasena'}
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-foreground/60">
                    Esta cuenta usa Google para iniciar sesion. La contrasena se administra desde tu cuenta de Google.
                  </p>
                )}

                {passwordMessage && (
                  <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {passwordMessage}
                  </p>
                )}
              </section>
            )}

            {activeSection === 'publications' && profile?.user_type === 'person' && (
              <section className="space-y-4">
                {petMessage && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {petMessage}
                  </p>
                )}

                {lostPets.length === 0 ? (
                  <div className="rounded-lg border border-border p-8 text-center">
                    <p className="text-foreground/60 mb-4">Todavia no has publicado mascotas perdidas.</p>
                    <Link href="/reportar">
                      <Button className="bg-primary hover:bg-primary/90">Crear reporte</Button>
                    </Link>
                  </div>
                ) : (
                  lostPets.map((pet) => (
                    <div key={pet.id} className="rounded-lg border border-border bg-card p-5">
                      {editingPetId === pet.id && editingPet && editingPetLocation ? (
                        <form onSubmit={handlePetSubmit} className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <input
                              required
                              value={editingPet.name}
                              onChange={(event) => updateEditingPet('name', event.target.value)}
                              className={inputClass}
                              placeholder="Nombre"
                            />
                            <select
                              value={editingPet.status}
                              onChange={(event) => updateEditingPet('status', event.target.value as LostPetStatus)}
                              className={inputClass}
                            >
                              {LOST_PET_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                              <option value="found">Encontrada</option>
                            </select>
                            <input
                              value={editingPet.breed}
                              onChange={(event) => updateEditingPet('breed', event.target.value)}
                              className={inputClass}
                              placeholder="Raza o tipo"
                            />
                            <input
                              value={editingPet.color}
                              onChange={(event) => updateEditingPet('color', event.target.value)}
                              className={inputClass}
                              placeholder="Color o senas"
                            />
                            <input
                              type="email"
                              value={editingPet.contact}
                              onChange={(event) => updateEditingPet('contact', event.target.value)}
                              className={inputClass}
                              placeholder="Correo de contacto"
                            />
                            <input
                              value={editingPet.reward}
                              onChange={(event) => updateEditingPet('reward', event.target.value)}
                              className={inputClass}
                              placeholder="Recompensa"
                            />
                          </div>
                          <textarea
                            value={editingPet.description}
                            onChange={(event) => updateEditingPet('description', event.target.value)}
                            className={`${inputClass} min-h-28`}
                            placeholder="Detalles"
                          />
                          <LocationPicker
                            value={editingPetLocation}
                            onChange={setEditingPetLocation}
                            title="Ultima ubicacion vista"
                          />
                          <ImageUpload
                            bucket="pet-images"
                            folder="lost"
                            label="Foto de la mascota"
                            initialUrl={editingPet.image_url}
                            onUploaded={(url) => updateEditingPet('image_url', url)}
                            onClear={() => updateEditingPet('image_url', null)}
                          />
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setEditingPetId(null)}>
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={savingPet} className="bg-primary hover:bg-primary/90">
                              {savingPet ? 'Guardando...' : 'Guardar publicacion'}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                                {getLostStatusLabel(pet.status)}
                              </span>
                              {pet.location && (
                                <span className="inline-flex items-center gap-1 text-sm text-foreground/60">
                                  <MapPin className="h-4 w-4" />
                                  {pet.location}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold">{pet.name}</h3>
                            <p className="mt-1 text-sm text-foreground/60">
                              {[pet.breed, pet.color].filter(Boolean).join(' - ') || 'Sin descripcion rapida'}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <SharePetButton petName={pet.name} path={`/mascotas/perdidas/${pet.id}`} />
                            <Link href={`/mascotas/perdidas/${pet.id}`}>
                              <Button variant="outline">Ver</Button>
                            </Link>
                            <Button type="button" onClick={() => startEditingPet(pet)}>
                              Editar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </section>
            )}

            {activeSection === 'vet' && profile?.user_type === 'vet' && (
              <section className="space-y-4">
                <div className="flex justify-end">
                  <Link href="/veterinarias/registrar">
                    <Button className="bg-primary hover:bg-primary/90">
                      {vets.length > 0 ? 'Editar veterinaria' : 'Registrar veterinaria'}
                    </Button>
                  </Link>
                </div>
                {vets.length === 0 ? (
                  <div className="rounded-lg border border-border p-8 text-center">
                    <p className="text-foreground/60">Todavia no tienes una veterinaria registrada.</p>
                  </div>
                ) : (
                  vets.map((vet) => (
                    <div key={vet.id} className="rounded-lg border border-border bg-card p-5">
                      <h3 className="text-xl font-semibold">{vet.name}</h3>
                      <p className="mt-2 text-sm text-foreground/60">{vet.services || 'Servicios pendientes'}</p>
                      <p className="mt-2 text-sm text-foreground/60">{vet.location || 'Ubicacion pendiente'}</p>
                      {vet.phone && <p className="mt-2 text-sm text-foreground/60">{vet.phone}</p>}
                    </div>
                  ))
                )}
              </section>
            )}

            {activeSection === 'campaigns' && profile?.user_type === 'foundation' && (
              <section className="space-y-4">
                <div className="flex justify-end">
                  <Link href="/donaciones/nueva">
                    <Button className="bg-primary hover:bg-primary/90">Crear campana</Button>
                  </Link>
                </div>
                {campaigns.length === 0 ? (
                  <div className="rounded-lg border border-border p-8 text-center">
                    <p className="text-foreground/60">Todavia no tienes campanas publicadas.</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="rounded-lg border border-border bg-card p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{campaign.title}</h3>
                          <p className="mt-1 text-sm text-foreground/60">
                            {formatMoney(campaign.current)} recaudados de {formatMoney(campaign.goal)}
                          </p>
                        </div>
                        <div className="text-sm text-foreground/60">
                          {campaign.donors} donantes · {campaign.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground/60">Cargando perfil...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
