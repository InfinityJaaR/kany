import Link from 'next/link'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Resumen', exact: true },
  { href: '/admin/campaigns', label: 'Campañas' },
  { href: '/admin/veterinarias', label: 'Veterinarias' },
  { href: '/admin/encontradas', label: 'Encontradas' },
]

export function AdminNav({ pathname }: { pathname: string }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/70 hover:bg-muted hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
