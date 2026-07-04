'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'

export default function NuevaCampanaPage() {
  const [ok, setOk] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Crear campaña</h1>
        <p className="text-foreground/60 mb-8">Formulario frontend para fundaciones/rescatistas.</p>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" placeholder="Nombre del caso" />
          <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" placeholder="Meta en dólares" />
          <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
            <option>Dinero</option>
            <option>Alimento</option>
            <option>Medicina</option>
            <option>Transporte</option>
          </select>
          <textarea
            className="w-full min-h-32 px-4 py-2 rounded-lg border border-border bg-background"
            placeholder="Historia del caso"
          />
          <Button onClick={() => setOk(true)} className="bg-primary hover:bg-primary/90">
            Publicar campaña demo
          </Button>
          {ok && (
            <p className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
              Campaña simulada lista para compartir.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
