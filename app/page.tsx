import { CommunityTrustStrip } from '@/components/home/community-trust-strip'
import { DashboardHero } from '@/components/home/dashboard-hero'
import { HomeHeroContent } from '@/components/home/home-hero-content'
import { ModulesSection } from '@/components/home/modules-section'
import { SiteHeaderSuspense } from '@/components/layout/site-header'
import { WrongRoleBanner } from '@/components/layout/wrong-role-banner'
import { getSessionProfile } from '@/lib/auth/profile'
import { fetchHomeCommunityStats } from '@/lib/data/queries'
import { getThirdModule } from '@/lib/modules'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function HomePage() {
  const [{ userType, isLoggedIn, profile }, third, stats] = await Promise.all([
    getSessionProfile(),
    Promise.resolve(getThirdModule()),
    fetchHomeCommunityStats(),
  ])
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

      <DashboardHero
        metricsFooter={<CommunityTrustStrip stats={stats} third={third} />}
      >
        <HomeHeroContent
          isLoggedIn={isLoggedIn}
          userType={userType}
          displayName={displayName}
          third={third}
        />
      </DashboardHero>

      <ModulesSection
        stats={stats}
        isLoggedIn={isLoggedIn}
        userType={userType}
        third={third}
      />

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h5 className="mb-4 font-bold text-foreground">Kany</h5>
              <p className="text-sm text-foreground/60">
                Plataforma comunitaria para el cuidado animal en El Salvador.
              </p>
            </div>
            <div>
              <h6 className="mb-4 text-sm font-semibold text-foreground">Módulos</h6>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/perdidas" className="hover:text-foreground">
                    Mascotas perdidas
                  </Link>
                </li>
                <li>
                  <Link href="/donaciones" className="hover:text-foreground">
                    Donaciones
                  </Link>
                </li>
                {third === 'vets' && (
                  <li>
                    <Link href="/veterinarias" className="hover:text-foreground">
                      Veterinarias
                    </Link>
                  </li>
                )}
                {third === 'prices' && (
                  <li>
                    <Link href="/precios" className="hover:text-foreground">
                      Precios
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h6 className="mb-4 text-sm font-semibold text-foreground">Contacto</h6>
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
