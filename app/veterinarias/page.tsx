import { MapPin, Phone, Clock, ShieldCheck, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { fetchVets } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

export default async function VeterinariasPage() {
  const vets = await fetchVets()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Veterinarias Aliadas</h1>
            <p className="text-foreground/60">Directorio de clínicas, jornadas y servicios para mascotas</p>
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Registrar veterinaria
          </Button>
        </div>

        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
          <input
            placeholder="Buscar por clínica, servicio o ubicación..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {vets.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60">No hay veterinarias registradas. Ejecuta <code className="text-xs bg-muted px-1 rounded">supabase/seed.sql</code>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vets.map((vet) => {
              const services = vet.services?.split(',').map((s) => s.trim()).filter(Boolean) ?? []

              return (
                <article key={vet.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{vet.name}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {services.map((service) => (
                      <span key={service} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/70">
                        {service}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3 text-sm text-foreground/60 mb-4">
                    {vet.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {vet.location}</p>}
                    {vet.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {vet.phone}</p>}
                    {vet.hours && <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {vet.hours}</p>}
                  </div>
                  {vet.promo && (
                    <p className="text-sm p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 mb-4">
                      {vet.promo}
                    </p>
                  )}
                  <Button className="w-full bg-primary hover:bg-primary/90">Ver contacto</Button>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
