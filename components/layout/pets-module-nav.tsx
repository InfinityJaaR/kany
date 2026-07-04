import Link from 'next/link'

const links = [
  { href: '/perdidas', label: 'Perdidas', active: true },
  { href: '/encontradas', label: 'Encontradas', active: false },
  { href: '/reportar', label: 'Reportar', active: false },
] as const

export function PetsModuleNav({ active }: { active: 'perdidas' | 'encontradas' | 'reportar' }) {
  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
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
