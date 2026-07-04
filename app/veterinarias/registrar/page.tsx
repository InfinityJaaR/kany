'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { LocationPicker, type HomeLocation } from '@/components/auth/location-picker'
import { useRequireAuth } from '@/lib/auth/use-require-auth'
import { createClient } from '@/lib/supabase/client'

type VetForm = {
  name: string
  services: string
  address: string
  phone: string
  hours: string
  promo: string
  city: string
}

const emptyForm: VetForm = {
  name: '',
  services: '',
  address: '',
  phone: '',
  hours: '',
  promo: '',
  city: '',
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
          name: data.name ?? '',
          services: data.services ?? '',
          address: data.address ?? data.location ?? '',
          phone: data.phone ?? '',
          hours: data.hours ?? data.hours_summary ?? '',
          promo: data.promo ?? '',
          city: data.city ?? data.location ?? '',
        })
        setLocation({
          label: data.address ?? data.location ?? '',
          latitude: data.latitude,
          longitude: data.longitude,
          department: null,
          municipality: data.city,
          radiusMeters: 1000,
        })
      }

      setLoading(false)
    }

    loadExisting()
  }, [ready, userId])

  function updateField<K extends keyof VetForm>(key: K, value: VetForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    if (!form.name.trim()) {
      setError('El nombre de la clínica es obligatorio.')
      return
    }

    if (!location.latitude || !location.longitude) {
      setError('Selecciona la ubicación de tu clínica en el mapa.')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      services: form.services.trim() || null,
      address: form.address.trim() || location.label || null,
      location: form.city.trim() || form.address.trim() || location.label || null,
      city: form.city.trim() || location.municipality || null,
      phone: form.phone.trim() || null,
      hours: form.hours.trim() || null,
      promo: form.promo.trim() || null,
      latitude: location.latitude,
      longitude: location.longitude,
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
      setError(err instanceof Error ? err.message : 'No se pudo guardar la clínica.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-foreground/60">Cargando…</p>
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Clínica guardada</h1>
          <p className="text-foreground/60">Redirigiendo al directorio…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {existingId ? 'Editar mi clínica' : 'Registrar veterinaria'}
          </h1>
          <p className="text-foreground/60">
            Completa los datos de tu clínica para aparecer en el directorio de Kany.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre de la clínica *</label>
            <input
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Ej. Clínica Veterinaria San Patricio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Servicios</label>
            <input
              value={form.services}
              onChange={(e) => updateField('services', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Consulta, vacunas, cirugía, emergencias"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Ciudad</label>
              <input
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="San Salvador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="2222-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
            <input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Colonia, calle, número"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Horario</label>
            <input
              value={form.hours}
              onChange={(e) => updateField('hours', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="Lun-Vie 8:00-18:00, Sáb 8:00-12:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Promoción (opcional)</label>
            <input
              value={form.promo}
              onChange={(e) => updateField('promo', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="10% descuento en consulta de primera vez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ubicación en mapa *</label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          {error && (
            <p className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Link href="/veterinarias" className="flex-1">
              <Button type="button" variant="outline" className="w-full">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {submitting ? 'Guardando…' : existingId ? 'Actualizar clínica' : 'Registrar clínica'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
