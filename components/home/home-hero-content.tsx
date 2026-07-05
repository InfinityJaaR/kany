import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ThirdModule } from '@/lib/modules'
import type { UserType } from '@/types/auth'

type HomeHeroContentProps = {
  isLoggedIn: boolean
  userType: UserType | null
  displayName: string
  third: ThirdModule
}

const heroBtnClass = 'active:scale-[0.98] w-full sm:w-auto text-base md:text-lg h-10 md:h-11 px-5'

const eyebrowClass =
  'mb-4 text-base font-semibold text-foreground/90 md:text-lg [text-shadow:0_1px_12px_oklch(from_var(--background)_l_c_h_/_0.85)]'

const headingClass =
  'mb-5 text-5xl font-bold tracking-tighter leading-none text-foreground sm:text-6xl md:text-6xl lg:text-7xl [text-shadow:0_2px_16px_oklch(from_var(--background)_l_c_h_/_0.9)]'

const subtextClass =
  'mb-8 max-w-[65ch] text-xl leading-relaxed text-foreground/90 md:text-2xl [text-shadow:0_1px_10px_oklch(from_var(--background)_l_c_h_/_0.8)]'

export function HomeHeroContent({
  isLoggedIn,
  userType,
  displayName,
  third,
}: HomeHeroContentProps) {
  return (
    <div className="mx-auto max-w-2xl md:mx-0 md:max-w-2xl lg:max-w-3xl">
      <p className={eyebrowClass}>El Salvador · Comunidad Kany</p>

      {!isLoggedIn ? (
        <>
          <h2 className={headingClass}>Ayuda comunitaria para mascotas</h2>
          <p className={subtextClass}>
            Kany conecta a personas en El Salvador para reportar mascotas perdidas
            {third === 'vets' && ' y encontrar veterinarias aliadas'}
            {third === 'prices' && ' y comparar precios de alimento'}
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/auth/login">
              <Button size="lg" className={`bg-primary hover:bg-primary/90 ${heroBtnClass}`}>
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/perdidas">
              <Button
                size="lg"
                variant="outline"
                className={`border-foreground/25 bg-background/90 backdrop-blur-sm ${heroBtnClass}`}
              >
                Ver perdidas
              </Button>
            </Link>
          </div>
        </>
      ) : userType === 'person' ? (
        <>
          <h2 className={headingClass}>Hola, {displayName}</h2>
          <p className={subtextClass}>
            Reporta mascotas, apoya fundaciones y conecta con tu comunidad local.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/reportar">
              <Button size="lg" className={`bg-primary hover:bg-primary/90 ${heroBtnClass}`}>
                Reportar mascota
              </Button>
            </Link>
            <Link href="/perdidas">
              <Button
                size="lg"
                variant="outline"
                className={`border-foreground/25 bg-background/90 backdrop-blur-sm ${heroBtnClass}`}
              >
                Ver perdidas
              </Button>
            </Link>
          </div>
        </>
      ) : userType === 'foundation' ? (
        <>
          <h2 className={headingClass}>Panel de fundación</h2>
          <p className={subtextClass}>
            Crea campañas de donación para apoyar rescates y refugios en El Salvador.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/donaciones/nueva">
              <Button size="lg" className={`bg-primary hover:bg-primary/90 ${heroBtnClass}`}>
                Crear campaña
              </Button>
            </Link>
            <Link href="/donaciones">
              <Button
                size="lg"
                variant="outline"
                className={`border-foreground/25 bg-background/90 backdrop-blur-sm ${heroBtnClass}`}
              >
                Ver campañas
              </Button>
            </Link>
          </div>
        </>
      ) : userType === 'vet' ? (
        <>
          <h2 className={headingClass}>Panel de veterinaria</h2>
          <p className={subtextClass}>
            Registra tu clínica en el directorio y conecta con la comunidad.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/veterinarias/registrar">
              <Button size="lg" className={`bg-primary hover:bg-primary/90 ${heroBtnClass}`}>
                Registrar clínica
              </Button>
            </Link>
            <Link href="/veterinarias">
              <Button
                size="lg"
                variant="outline"
                className={`border-foreground/25 bg-background/90 backdrop-blur-sm ${heroBtnClass}`}
              >
                Ver directorio
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className={headingClass}>Ayuda comunitaria para mascotas</h2>
          <p className={subtextClass}>
            Completa tu perfil para reportar, donar o registrar tu clínica.
          </p>
          <Link href="/auth/onboarding">
            <Button size="lg" className={`bg-primary hover:bg-primary/90 ${heroBtnClass}`}>
              Completar perfil
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}
