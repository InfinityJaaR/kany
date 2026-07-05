'use client'

import Link from 'next/link'
import { useProfile } from '@/lib/auth/use-profile'
import { getThirdModule } from '@/lib/modules'
import { getVisibleNavItems, navLinkClass, type NavContext } from '@/lib/navigation/site-nav'

function useNavContext(): NavContext & { loading: boolean } {
  const { loading, userType, isLoggedIn } = useProfile()
  const third = getThirdModule()
  return { loading, isLoggedIn, userType, third }
}

export function RoleNav() {
  const ctx = useNavContext()

  if (ctx.loading) {
    return (
      <nav className="hidden md:flex items-center gap-4">
        <span className="text-sm text-foreground/40">…</span>
      </nav>
    )
  }

  const items = getVisibleNavItems(ctx)

  return (
    <nav className="hidden md:flex items-center gap-4">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={navLinkClass}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function useSiteNavContext() {
  return useNavContext()
}
