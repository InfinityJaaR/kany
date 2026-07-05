'use client'

import Link from 'next/link'
import { NavDivider } from '@/components/layout/nav-divider'
import { AuthNavLinks } from '@/components/layout/auth-button'
import { useSiteNavContext } from '@/components/layout/role-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { desktopNavLinkClass, getVisibleNavItems } from '@/lib/navigation/site-nav'

export function DesktopNav() {
  const ctx = useSiteNavContext()
  const items = getVisibleNavItems(ctx)

  return (
    <nav
      className="hidden md:flex min-w-0 flex-1 items-center justify-end gap-3"
      aria-label="Navegación principal"
    >
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
        {ctx.loading ? (
          <span className={desktopNavLinkClass}>…</span>
        ) : (
          items.map((item) => (
            <Link key={item.href} href={item.href} className={desktopNavLinkClass}>
              {item.label}
            </Link>
          ))
        )}
      </div>

      <NavDivider />

      <AuthNavLinks className="shrink-0 gap-3" />

      <NavDivider />

      <ThemeToggle className="shrink-0" />
    </nav>
  )
}
