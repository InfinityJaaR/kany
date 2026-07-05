import type { UserType } from '@/types/auth'
import type { ThirdModule } from '@/lib/modules'
import {
  Heart,
  PawPrint,
  PlusCircle,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'

export const navLinkClass =
  'text-sm text-foreground/60 hover:text-foreground transition-colors'

export const desktopNavLinkClass =
  'text-sm font-medium text-foreground/70 hover:text-foreground whitespace-nowrap transition-colors'

export type NavContext = {
  isLoggedIn: boolean
  userType: UserType | null
  third: ThirdModule
}

export type SiteNavItem = {
  href: string
  label: string
  show?: (ctx: NavContext) => boolean
}

export function getMainNavItems(): SiteNavItem[] {
  return [
    { href: '/perdidas', label: 'Lista de mascotas' },
    { href: '/donaciones', label: 'Donaciones' },
    {
      href: '/veterinarias',
      label: 'Veterinarias',
      show: (ctx) => ctx.third === 'vets',
    },
    {
      href: '/donaciones/nueva',
      label: 'Crear campaña',
      show: (ctx) => ctx.userType === 'foundation',
    },
    {
      href: '/veterinarias/registrar',
      label: 'Mi clínica',
      show: (ctx) => ctx.userType === 'vet',
    },
  ]
}

export function getVisibleNavItems(ctx: NavContext): SiteNavItem[] {
  return getMainNavItems().filter((item) => !item.show || item.show(ctx))
}

const mobileNavIcons: Record<string, LucideIcon> = {
  '/perdidas': PawPrint,
  '/donaciones': Heart,
  '/veterinarias': Stethoscope,
  '/donaciones/nueva': PlusCircle,
  '/veterinarias/registrar': Stethoscope,
}

export function getMobileNavIcon(href: string): LucideIcon {
  return mobileNavIcons[href] ?? PawPrint
}
