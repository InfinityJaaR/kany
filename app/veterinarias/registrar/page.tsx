'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle, Clock3, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { useRequireAuth } from '@/lib/auth/use-require-auth'
import { createClient } from '@/lib/supabase/client'

type VetForm = {
  name: string
  category: string
  services: string
  description: string
  address: string
  city: string
  phone: string
  website: string
  hours: string
  promo: string
}

type FieldErrors = Partial<Record<keyof VetForm | 'location', string>>

const emptyForm: VetForm = {
  name: '',
  category: '',
  services: '',
  description: '',
  address: '',
  city: '',
  phone: '',
  website: '',
  hours: '',
  promo: '',
}

const categoryOptions = [
  'Clinica veterinaria',
  'Hospital veterinario',
  'Emergencias',
  'Grooming',
  'Pet shop',
  'Servicios a domicilio',
]

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary'

const textareaClass = `${inputClass} min-h-28 resize-y`

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15 && /^[+\d\s()-]+$/.test(value)
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'No se pudo guardar la clinica.'
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-red-500">{message}</p>
}

export default function RegistrarVeterinariaPage() {
  const router = useRouter()
  const { ready, userId } = useRequireAuth({ userType: 'vet' })
  const [form, setForm] = useState<VetForm>(emptyForm)
  const [location, setLocation] = useState<HomeLocation>({
    label: '',
    latitude: null,
    longitude: null,
    department: null,
    municipality: null,
    radiusMeters: 1000,
  })
  const [existingId, setExistingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ok, setOk] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !userId) return

    async function loadExisting() {
      const supabase = createClient()
      const { data } = await supabase
        .from('vets')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle()

      if (data) {
        setExistingId(data.id)
        setForm({
          name: data.name ?? data.title ?? '',
          category: data.category_name ?? '',
          services: data.services ?? '',
          description: data.description ?? '',
          address: data.address ?? data.location ?? '',
          city: data.city ?? data.located_in ?? data.location ?? '',
          phone: data.phone ?? '',
          website: data.website ?? '',
          hours: data.hours ?? data.hours_summary ?? '',
          promo: data.promo ?? '',
        })
        setLocation({
          label: data.address ?? data.location ?? '',
          latitude: data.latitude,
          longitude: data.longitude,
          department: null,
          municipality: data.city ?? data.located_in ?? null,
          radiusMeters: 1000,
        })
      }

      setLoading(false)
    }

    loadExisting()
  }, [ready, userId])

  function updateField<K extends keyof VetForm>(key: K, value: VetForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    setError(null)
  }

  function validateForm() {
    const nextErrors: FieldErrors = {}
    const website = normalizeUrl(form.website)

    if (form.name.trim().length < 3) {
      nextErrors.name = 'Escribe el nombre de la clinica.'
    }

    if (!form.category.trim()) {
      nextErrors.category = 'Selecciona una categoria.'
    }

    if (form.services.trim().length < 5) {
      nextErrors.services = 'Agrega al menos un servicio principal.'
    }

    if (form.description.trim().length > 500) {
      nextErrors.description = 'La descripcion no debe superar 500 caracteres.'
    }

    if (!form.city.trim() && !location.municipality) {
      nextErrors.city = 'Indica la ciudad o municipio.'
    }

    if (!form.address.trim() && !location.label.trim()) {
      nextErrors.address = 'Agrega una direccion o referencia.'
    }

    if (form.phone.trim() && !isValidPhone(form.phone.trim())) {
      nextErrors.phone = 'Usa un telefono valido.'
    }

    if (website) {
      try {
        new URL(website)
      } catch {
        nextErrors.website = 'Usa una URL valida.'
      }
    }

    if (form.hours.trim().length > 140) {
      nextErrors.hours = 'Resume el horario en 140 caracteres o menos.'
    }

    if (form.promo.trim().length > 160) {
      nextErrors.promo = 'La promocion no debe superar 160 caracteres.'
    }

    if (location.latitude === null || location.longitude === null) {
      nextErrors.location = 'Selecciona la ubicacion de tu clinica en el mapa.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    if (!validateForm()) {
      setError('Revisa los campos marcados antes de guardar.')
      return
    }

    setSubmitting(true)
    setError(null)

    const address = form.address.trim() || location.label.trim() || null
    const city = form.city.trim() || location.municipality || null
    const category = form.category.trim() || null
    const services = form.services.trim()
    const searchString = [
      form.name,
      category,
      services,
      form.description,
      address,
      city,
    ]
      .filter(Boolean)
      .join(', ')

    const payload = {
      name: form.name.trim(),
      title: form.name.trim(),
      category_name: category,
      services,
      description: form.description.trim() || null,
      address,
      location: city || address,
      city,
      located_in: city,
      phone: form.phone.trim() || null,
      website: normalizeUrl(form.website) || null,
      hours: form.hours.trim() || null,
      hours_summary: form.hours.trim() || null,
      promo: form.promo.trim() || null,
      latitude: location.latitude,
      longitude: location.longitude,
      search_string: searchString,
      owner_id: userId,
    }

    const supabase = createClient()

    try {
      if (existingId) {
        const { error: updateError } = await supabase
          .from('vets')
          .update(payload)
          .eq('id', existingId)
          .eq('owner_id', userId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('vets').insert(payload)
        if (insertError) throw insertError
      }

      setOk(true)
      setTimeout(() => router.push('/veterinarias'), 1500)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-foreground/60">Cargando...</p>
        </main>
      </div>
    )
  }

  if (ok) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Clinica guardada</h1>
          <p className="text-foreground/60">Redirigiendo al directorio...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/veterinarias"
          className="mb-6 inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a veterinarias
        </Link>

        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Building2 className="w-4 h-4" />
            {existingId ? 'Perfil de veterinaria' : 'Nueva veterinaria'}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground">
            {existingId ? 'Editar mi clinica' : 'Registrar veterinaria'}
          </h1>
          <p className="mt-2 max-w-2xl text-foreground/60">
            Completa los datos que se mostraran en el directorio para que las personas puedan encontrar tu clinica y contactarte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <section className="grid gap-5 border-b border-border pb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">Datos generales</h2>
                <p className="text-sm text-foreground/60">Nombre, categoria y servicios principales.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre de la clinica *</label>
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClass}
                  maxLength={120}
                  placeholder="Ej. Clinica Veterinaria San Patricio"
                />
                <FieldError message={fieldErrors.name} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Categoria *</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecciona una categoria</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.category} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Servicios *</label>
              <input
                value={form.services}
                onChange={(e) => updateField('services', e.target.value)}
                className={inputClass}
                maxLength={220}
                placeholder="Consulta, vacunas, cirugia, emergencias"
              />
              <FieldError message={fieldErrors.services} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Descripcion</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={textareaClass}
                maxLength={500}
                placeholder="Ej. Atencion general, control de vacunas y servicios para perros y gatos."
              />
              <div className="mt-1 flex items-center justify-between text-xs text-foreground/50">
                <FieldError message={fieldErrors.description} />
                <span className="ml-auto">{form.description.length}/500</span>
              </div>
            </div>
          </section>

          <section className="grid gap-5 border-b border-border py-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">Contacto y ubicacion</h2>
                <p className="text-sm text-foreground/60">La direccion y el pin ayudan a mostrar rutas y veterinarias cercanas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ciudad o municipio *</label>
                <input
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass}
                  maxLength={90}
                  placeholder="San Salvador"
                />
                <FieldError message={fieldErrors.city} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefono</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={inputClass}
                  maxLength={24}
                  placeholder="2222-0000"
                />
                <FieldError message={fieldErrors.phone} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Direccion o referencia *</label>
                <input
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={inputClass}
                  maxLength={180}
                  placeholder="Colonia, calle, numero o punto de referencia"
                />
                <FieldError message={fieldErrors.address} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sitio web</label>
                <input
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className={inputClass}
                  maxLength={180}
                  placeholder="https://tuclinica.com"
                />
                <FieldError message={fieldErrors.website} />
              </div>
            </div>

            <div>
              <LocationPicker
                value={location}
                onChange={(nextLocation) => {
                  setLocation(nextLocation)
                  setFieldErrors((prev) => ({ ...prev, location: undefined }))
                  setError(null)
                }}
                title="Ubicacion de la clinica"
                description="Usa tu ubicacion actual o mueve el mapa hasta dejar el pin sobre la clinica."
                emptyHint="Presiona Actual o mueve el mapa para ubicar la clinica."
                footerText="Este punto se usara para mostrar tu veterinaria cerca de los usuarios."
              />
              <FieldError message={fieldErrors.location} />
            </div>
          </section>

          <section className="grid gap-5 py-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock3 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">Horario y promocion</h2>
                <p className="text-sm text-foreground/60">Estos campos son opcionales, pero ayudan a que el perfil sea mas util.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Horario</label>
                <input
                  value={form.hours}
                  onChange={(e) => updateField('hours', e.target.value)}
                  className={inputClass}
                  maxLength={140}
                  placeholder="Lun-Vie 8:00-18:00, Sab 8:00-12:00"
                />
                <FieldError message={fieldErrors.hours} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Promocion</label>
                <input
                  value={form.promo}
                  onChange={(e) => updateField('promo', e.target.value)}
                  className={inputClass}
                  maxLength={160}
                  placeholder="10% de descuento en primera consulta"
                />
                <FieldError message={fieldErrors.promo} />
              </div>
            </div>
          </section>

          {error && (
            <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Link href="/veterinarias" className="sm:w-44">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="sm:w-52 bg-primary hover:bg-primary/90"
            >
              {submitting ? 'Guardando...' : existingId ? 'Actualizar clinica' : 'Registrar clinica'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
