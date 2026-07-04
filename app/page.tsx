import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { getThirdModule } from '@/lib/modules'

export default function Home() {
  const third = getThirdModule()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ayuda comunitaria para mascotas
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
            Kany conecta a personas en El Salvador para reportar mascotas perdidas, apoyar campañas de donación
            {third === 'prices' && ' y comparar precios de productos'}
            {third === 'vets' && ' y encontrar veterinarias aliadas'}
            .
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

          <article className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
              ❤️
            </div>
            <h4 className="font-bold text-foreground mb-2">Donaciones</h4>
            <p className="text-sm text-foreground/60 mb-4">
              Apoya campañas de fundaciones y rescatistas con donaciones simuladas.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/donaciones" className="text-primary font-medium hover:underline">
                Ver campañas →
              </Link>
              <Link href="/donaciones/nueva" className="text-primary/80 hover:underline">
                Crear campaña →
              </Link>
            </div>
          </article>

          {third === 'prices' && (
            <article className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-lime-500 dark:bg-lime-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
                💵
              </div>
              <h4 className="font-bold text-foreground mb-2">Precios</h4>
              <p className="text-sm text-foreground/60 mb-4">
                Compara precios de alimento y productos para mascotas por tienda y peso.
              </p>
              <Link href="/precios" className="text-primary text-sm font-medium hover:underline">
                Comparar precios →
              </Link>
            </article>
          )}

          {third === 'vets' && (
            <article className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-teal-500 dark:bg-teal-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
                🩺
              </div>
              <h4 className="font-bold text-foreground mb-2">Veterinarias</h4>
              <p className="text-sm text-foreground/60 mb-4">
                Directorio de clínicas aliadas con servicios, horarios y promociones.
              </p>
              <Link href="/veterinarias" className="text-primary text-sm font-medium hover:underline">
                Ver directorio →
              </Link>
            </article>
          )}
        </div>
      </section>

      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="font-bold text-foreground mb-4">Kany</h5>
              <p className="text-sm text-foreground/60">
                Plataforma comunitaria para el cuidado animal en El Salvador.
              </p>
            </div>
            <div>
              <h6 className="font-semibold text-foreground text-sm mb-4">Módulos</h6>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/perdidas" className="hover:text-foreground">Mascotas perdidas</Link></li>
                <li><Link href="/donaciones" className="hover:text-foreground">Donaciones</Link></li>
                {third === 'prices' && (
                  <li><Link href="/precios" className="hover:text-foreground">Precios</Link></li>
                )}
                {third === 'vets' && (
                  <li><Link href="/veterinarias" className="hover:text-foreground">Veterinarias</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-foreground text-sm mb-4">Contacto</h6>
              <p className="text-sm text-foreground/60">El Salvador · Español</p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-foreground/60">
            <p>© {new Date().getFullYear()} Kany. Hecho para El Salvador.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
