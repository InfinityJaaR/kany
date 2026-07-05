import Link from 'next/link'

const links = [
  { href: '/perdidas', label: 'Perdidas' },
  { href: '/encontradas', label: 'Encontré una mascota' },
  { href: '/reportar', label: 'Reportar' },
] as const

export function PetsModuleNav({ active }: { active: 'perdidas' | 'encontradas' | 'reportar' }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            active === link.href.slice(1)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground/70 hover:bg-muted/80'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
