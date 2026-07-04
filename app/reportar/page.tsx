'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wand2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRequireAuth } from '@/lib/auth/use-require-auth'
import { createClient } from '@/lib/supabase/client'

export default function ReportarPage() {
  const router = useRouter()
  const { ready, userId } = useRequireAuth()
  const [tipo, setTipo] = useState('perdida')
  const [nombre, setNombre] = useState('')
  const [raza, setRaza] = useState('')
  const [zona, setZona] = useState('')
  const [color, setColor] = useState('')
  const [contacto, setContacto] = useState('')
  const [detalles, setDetalles] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const texto = useMemo(
    () =>
      `🚨 ${tipo === 'perdida' ? 'SE BUSCA' : 'MASCOTA ENCONTRADA'} ${nombre || 'mascota'}. ${tipo === 'perdida' ? 'Se perdió' : 'Fue encontrada'} en ${zona || 'la zona indicada'}. Color/descripción: ${color || 'por completar'}. Si tienes información, contacta al número del reporte.`,
    [tipo, nombre, zona, color]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (tipo === 'perdida') {
        const { error: insertError } = await supabase.from('lost_pets').insert({
          name: nombre,
          breed: raza,
          color,
          location: zona,
          date_text: 'Hoy',
          description: detalles || texto,
          reward: '',
          contact: contacto,
          status: 'normal',
          image_url: imageUrl,
          reported_by: userId,
        })
        if (insertError) throw insertError
      } else {
        const { error: insertError } = await supabase.from('found_pets').insert({
          type: nombre || 'Mascota',
          breed: raza,
          color,
          location: zona,
          date_text: 'Hoy',
          description: detalles || texto,
          condition: 'Por confirmar',
          contact: contacto,
          match: 'Sin coincidencias',
          status: 'normal',
          image_url: imageUrl,
          reported_by: userId,
        })
        if (insertError) throw insertError
      }
        setOk(true)
        setTimeout(() => router.push(tipo === 'perdida' ? '/perdidas' : '/encontradas'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Verificando sesión…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Formulario de reporte</h1>
        <p className="text-foreground/60 mb-4">Reporta mascotas perdidas o encontradas en Kany.</p>
        <PetsModuleNav active="reportar" />

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="perdida">Mascota perdida</option>
              <option value="encontrada">Mascota encontrada</option>
            </select>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre o tipo de mascota"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              value={raza}
              onChange={(e) => setRaza(e.target.value)}
              placeholder="Raza o descripción"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Color"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              required
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Zona"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              required
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Contacto +503"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
          </div>

          <textarea
            value={detalles}
            onChange={(e) => setDetalles(e.target.value)}
            placeholder="Detalles adicionales"
            className="mt-4 w-full min-h-28 px-4 py-2 rounded-lg border border-border bg-background"
          />

          <div className="mt-4">
            <ImageUpload
              bucket="pet-images"
              folder={tipo === 'perdida' ? 'lost' : 'found'}
              label="Foto de la mascota (opcional)"
              onUploaded={setImageUrl}
              onClear={() => setImageUrl(null)}
            />
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Wand2 className="w-4 h-4 text-primary" />
              Texto sugerido
            </div>
            <p className="text-sm text-foreground/70">{texto}</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-5 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Publicando…' : 'Publicar reporte'}
          </Button>

          {error && (
            <p className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          {ok && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex gap-2">
              <CheckCircle className="w-4 h-4" />
              Reporte publicado correctamente.
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
