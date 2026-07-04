'use client'

import { useMemo, useState } from 'react'
import { Wand2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'

export default function ReportarPage() {
  const [tipo, setTipo] = useState('perdida')
  const [nombre, setNombre] = useState('')
  const [zona, setZona] = useState('')
  const [color, setColor] = useState('')
  const [ok, setOk] = useState(false)

  const texto = useMemo(
    () =>
      `🚨 ${tipo === 'perdida' ? 'SE BUSCA' : 'MASCOTA ENCONTRADA'} ${nombre || 'mascota'}. ${tipo === 'perdida' ? 'Se perdió' : 'Fue encontrada'} en ${zona || 'la zona indicada'}. Color/descripción: ${color || 'por completar'}. Si tienes información, contacta al número del reporte.`,
    [tipo, nombre, zona, color]
  )

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Formulario de reporte</h1>
        <p className="text-foreground/60 mb-4">Reporta mascotas perdidas o encontradas en Kany (demo sin persistencia).</p>
        <PetsModuleNav active="reportar" />

        <div className="bg-card border border-border rounded-2xl p-6">
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
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre o tipo de mascota"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input placeholder="Raza o descripción" className="px-4 py-2 rounded-lg border border-border bg-background" />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Color"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Zona"
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <input placeholder="Contacto +503" className="px-4 py-2 rounded-lg border border-border bg-background" />
          </div>

          <textarea
            placeholder="Detalles adicionales"
            className="mt-4 w-full min-h-28 px-4 py-2 rounded-lg border border-border bg-background"
          />

          <div className="mt-6 p-4 rounded-xl bg-muted">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Wand2 className="w-4 h-4 text-primary" />
              Texto IA simulado
            </div>
            <p className="text-sm text-foreground/70">{texto}</p>
          </div>

          <Button onClick={() => setOk(true)} className="mt-5 bg-primary hover:bg-primary/90">
            Publicar reporte demo
          </Button>

          {ok && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex gap-2">
              <CheckCircle className="w-4 h-4" />
              Reporte simulado creado y alerta generada.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
