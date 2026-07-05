import type { LucideIcon } from 'lucide-react'
import { Calculator, Heart, Search, Stethoscope } from 'lucide-react'
import type { HomeCommunityStats } from '@/lib/data/queries'
import type { ThirdModule } from '@/lib/modules'
import type { UserType } from '@/types/auth'

export type HomeModuleStatKey = keyof Pick<
  HomeCommunityStats,
  'activeLostPets' | 'foundPets' | 'activeCampaigns' | 'vets' | 'foodPrices'
>

export type HomeModuleLink = {
  href: string
  label: string
  show?: (ctx: HomeModuleContext) => boolean
}

export type HomeModuleContext = {
  isLoggedIn: boolean
  userType: UserType | null
  third: ThirdModule
}

export type HomeModuleDefinition = {
  id: string
  label: string
  title: string
  description: string
  icon: LucideIcon
  statKey: HomeModuleStatKey
  statLabel: (count: number) => string
  featured?: boolean
  show?: (ctx: HomeModuleContext) => boolean
  tint: {
    surface: string
    border: string
    icon: string
    iconBg: string
  }
  primaryAction: {
    href: string | ((ctx: HomeModuleContext) => string)
    label: string
  }
  secondaryLinks: HomeModuleLink[]
}

export function getHomeModules(ctx: HomeModuleContext): HomeModuleDefinition[] {
  return HOME_MODULE_DEFINITIONS.filter((mod) => mod.show?.(ctx) ?? true)
}

export function resolveModuleHref(
  href: string | ((ctx: HomeModuleContext) => string),
  ctx: HomeModuleContext,
): string {
  return typeof href === 'function' ? href(ctx) : href
}

const HOME_MODULE_DEFINITIONS: HomeModuleDefinition[] = [
  {
    id: 'lost',
    label: 'Mascotas perdidas',
    title: 'Mascotas perdidas',
    description:
      'Reporta, busca y ayuda a reunir mascotas perdidas o encontradas en tu zona.',
    icon: Search,
    statKey: 'activeLostPets',
    statLabel: (n) => `${n} reporte${n === 1 ? '' : 's'} activo${n === 1 ? '' : 's'}`,
    featured: true,
    tint: {
      surface: 'bg-primary/5',
      border: 'border-primary/20',
      icon: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    primaryAction: {
      href: '/perdidas',
      label: 'Ver perdidas',
    },
    secondaryLinks: [
      { href: '/encontradas', label: 'Ver encontradas' },
      {
        href: '/reportar',
        label: 'Reportar mascota',
        show: (c) => c.isLoggedIn && c.userType === 'person',
      },
      {
        href: '/auth/login?redirect=/reportar',
        label: 'Iniciar sesión para reportar',
        show: (c) => !c.isLoggedIn,
      },
    ],
  },
  {
    id: 'donations',
    label: 'Donaciones',
    title: 'Donaciones',
    description:
      'Apoya campañas de fundaciones y rescatistas con donaciones simuladas.',
    icon: Heart,
    statKey: 'activeCampaigns',
    statLabel: (n) => `${n} campaña${n === 1 ? '' : 's'} activa${n === 1 ? '' : 's'}`,
    tint: {
      surface: 'bg-secondary/5',
      border: 'border-secondary/25',
      icon: 'text-secondary',
      iconBg: 'bg-secondary/10',
    },
    primaryAction: {
      href: '/donaciones',
      label: 'Ver campañas',
    },
    secondaryLinks: [
      {
        href: '/donaciones/nueva',
        label: 'Crear campaña',
        show: (c) => c.userType === 'foundation',
      },
    ],
  },
  {
    id: 'vets',
    label: 'Veterinarias',
    title: 'Veterinarias',
    description:
      'Directorio de clínicas aliadas con servicios, horarios y promociones.',
    icon: Stethoscope,
    statKey: 'vets',
    statLabel: (n) => `${n} clínica${n === 1 ? '' : 's'} registrada${n === 1 ? '' : 's'}`,
    show: (c) => c.third === 'vets',
    tint: {
      surface: 'bg-muted/60',
      border: 'border-border',
      icon: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    primaryAction: {
      href: '/veterinarias',
      label: 'Ver directorio',
    },
    secondaryLinks: [
      {
        href: '/veterinarias/registrar',
        label: 'Mi clínica',
        show: (c) => c.userType === 'vet',
      },
    ],
  },
  {
    id: 'prices',
    label: 'Precios',
    title: 'Precios de alimento',
    description: 'Compara precios de alimento para mascotas en distintas tiendas.',
    icon: Calculator,
    statKey: 'foodPrices',
    statLabel: (n) => `${n} precio${n === 1 ? '' : 's'} registrado${n === 1 ? '' : 's'}`,
    show: (c) => c.third === 'prices',
    tint: {
      surface: 'bg-muted/60',
      border: 'border-border',
      icon: 'text-accent',
      iconBg: 'bg-accent/10',
    },
    primaryAction: {
      href: '/precios',
      label: 'Ver precios',
    },
    secondaryLinks: [],
  },
]

export function getStatValue(stats: HomeCommunityStats, key: HomeModuleStatKey): number {
  return stats[key]
}
