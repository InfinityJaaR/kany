import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ayuda comunitaria para mascotas
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
            Kany conecta a personas en El Salvador para reportar y encontrar mascotas perdidas.
          </p>
          <Link href="/perdidas">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Ver mascotas perdidas
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-foreground mb-8">Módulos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-red-500 dark:bg-red-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
              🚨
            </div>
            <h4 className="font-bold text-foreground mb-2">Mascotas perdidas</h4>
            <p className="text-sm text-foreground/60 mb-4">
              Reporta, busca y ayuda a reunir mascotas perdidas o encontradas.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/perdidas" className="text-primary font-medium hover:underline">
                Ver perdidas →
              </Link>
              <Link href="/encontradas" className="text-primary/80 hover:underline">
                Ver encontradas →
              </Link>
              <Link href="/reportar" className="text-primary/80 hover:underline">
                Reportar mascota →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-foreground/60">
          <p>© {new Date().getFullYear()} Kany. Hecho para El Salvador.</p>
        </div>
      </footer>
    </div>
  )
}
