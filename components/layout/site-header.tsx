import Link from 'next/link'
import { Suspense } from 'react'
import { DesktopNav } from '@/components/layout/desktop-nav'
import { SiteNavMenu } from '@/components/layout/mobile-nav'
import { SiteLogo } from '@/components/layout/site-logo'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 transition hover:opacity-80">
          <SiteLogo />
          <h1 className="text-xl font-bold text-foreground">Kany</h1>
        </Link>
        <DesktopNav />
        <div className="shrink-0 md:hidden">
          <SiteNavMenu />
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
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md h-16" />
      }>
        <SiteHeader />
      </Suspense>
    </>
  )
}
