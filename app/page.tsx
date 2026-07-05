import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { SiteHeaderSuspense } from '@/components/layout/site-header'
import { WrongRoleBanner } from '@/components/layout/wrong-role-banner'
import { getSessionProfile } from '@/lib/auth/profile'
import { getThirdModule } from '@/lib/modules'
import { USER_TYPE_LABELS } from '@/types/auth'

export default async function HomePage() {
  const { userType, isLoggedIn, profile } = await getSessionProfile()
  const third = getThirdModule()
  const displayName = profile?.full_name ?? 'Usuario'

  return (
    <div className="min-h-screen bg-background">
      <SiteHeaderSuspense
        banner={
          <Suspense fallback={null}>
            <WrongRoleBanner />
          </Suspense>
        }
      />

      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {!isLoggedIn ? (
            <>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Ayuda comunitaria para mascotas
              </h2>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-4">
                Kany conecta a personas en El Salvador para reportar mascotas perdidas, apoyar campañas de donación
                {third === 'vets' && ' y encontrar veterinarias aliadas'}
                .
              </p>
              <p className="text-sm text-foreground/50 max-w-xl mx-auto mb-8">
                Inicia sesión y elige tu rol para reportar, donar o registrar tu clínica.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/perdidas">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Ver mascotas perdidas
                  </Button>
                </Link>
              </div>
            </>
          ) : userType === 'person' ? (
            <>
              <p className="text-sm text-primary font-medium mb-2">{USER_TYPE_LABELS.person}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Hola, {displayName}
              </h2>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
                Reporta mascotas, apoya fundaciones y encuentra veterinarias cerca de ti.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/reportar">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">Reportar mascota</Button>
                </Link>
                <Link href="/perdidas">
                  <Button size="lg" variant="outline">Ver perdidas</Button>
                </Link>
                <Link href="/donaciones">
                  <Button size="lg" variant="outline">Donar</Button>
                </Link>
                {third === 'vets' && (
                  <Link href="/veterinarias">
                    <Button size="lg" variant="outline">Veterinarias cerca</Button>
                  </Link>
                )}
              </div>
            </>
          ) : userType === 'foundation' ? (
            <>
              <p className="text-sm text-primary font-medium mb-2">{USER_TYPE_LABELS.foundation}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Panel de fundación
              </h2>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
                Crea y gestiona campañas de donación para apoyar rescates y refugios.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/donaciones/nueva">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">Crear campaña</Button>
                </Link>
                <Link href="/donaciones">
                  <Button size="lg" variant="outline">Ver campañas</Button>
                </Link>
              </div>
            </>
          ) : userType === 'vet' ? (
            <>
              <p className="text-sm text-primary font-medium mb-2">{USER_TYPE_LABELS.vet}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Panel de veterinaria
              </h2>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
                Registra tu clínica para aparecer en el directorio y conectar con la comunidad.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/veterinarias/registrar">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">Registrar clínica</Button>
                </Link>
                <Link href="/veterinarias">
                  <Button size="lg" variant="outline">Ver directorio</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Ayuda comunitaria para mascotas
              </h2>
              <Link href="/auth/onboarding">
                <Button size="lg" className="bg-primary hover:bg-primary/90">Completar perfil</Button>
              </Link>
            </>
          )}
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
              {isLoggedIn && userType === 'person' && (
                <Link href="/reportar" className="text-primary/80 hover:underline">
                  Reportar mascota →
                </Link>
              )}
              {!isLoggedIn && (
                <Link href="/auth/login?redirect=/reportar" className="text-primary/80 hover:underline">
                  Iniciar sesión para reportar →
                </Link>
              )}
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
              {userType === 'foundation' && (
                <Link href="/donaciones/nueva" className="text-primary/80 hover:underline">
                  Crear campaña →
                </Link>
              )}
            </div>
          </article>

          {third === 'vets' && (
            <article className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-teal-500 dark:bg-teal-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
                🩺
              </div>
              <h4 className="font-bold text-foreground mb-2">Veterinarias</h4>
              <p className="text-sm text-foreground/60 mb-4">
                Directorio de clínicas aliadas con servicios, horarios y promociones.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/veterinarias" className="text-primary font-medium hover:underline">
                  Ver directorio →
                </Link>
                {userType === 'vet' && (
                  <Link href="/veterinarias/registrar" className="text-primary/80 hover:underline">
                    Mi clínica →
                  </Link>
                )}
              </div>
            </article>
          )}
        </div>
      </section>

      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <Logo size={40} className="mb-4" />
              <p className="text-sm text-foreground/60">
                Plataforma comunitaria para el cuidado animal en El Salvador.
              </p>
            </div>
            <div>
              <h6 className="font-semibold text-foreground text-sm mb-4">Módulos</h6>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/perdidas" className="hover:text-foreground">Mascotas perdidas</Link></li>
                <li><Link href="/donaciones" className="hover:text-foreground">Donaciones</Link></li>
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
