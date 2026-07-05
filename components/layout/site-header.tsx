import Link from 'next/link'
import { Suspense } from 'react'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/layout/auth-button'
import { RoleBadge, RoleNav } from '@/components/layout/role-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Logo } from '@/components/ui/logo'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2 md:gap-4">
          <RoleNav />
          <RoleBadge />
          <AuthButton />
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function SiteHeaderWithBanner({ banner }: { banner?: React.ReactNode }) {
  return (
    <>
      {banner}
      <SiteHeader />
    </>
  )
}

export function SiteHeaderSuspense({ banner }: { banner?: React.ReactNode }) {
  return (
    <>
      {banner}
      <Suspense fallback={
        <header className="sticky top-0 z-40 border-b border-border bg-card/50 backdrop-blur-sm h-16" />
      }>
        <SiteHeader />
      </Suspense>
    </>
  )
}
