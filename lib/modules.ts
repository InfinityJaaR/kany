export type ThirdModule = 'prices' | 'vets' | 'none'

export function getThirdModule(): ThirdModule {
  const value = process.env.NEXT_PUBLIC_THIRD_MODULE
  if (value === 'prices' || value === 'vets') return value
  return 'none'
}

export function isModuleEnabled(path: '/precios' | '/veterinarias'): boolean {
  const third = getThirdModule()
  if (third === 'prices') return path === '/precios'
  if (third === 'vets') return path === '/veterinarias'
  return false
}

export const REMOVED_ROUTES = [
  '/adopciones',
  '/transporte',
  '/marketplace',
  '/ia',
  '/admin',
  '/fundaciones',
  '/dashboard',
  '/roles',
  '/perros',
  '/gatos',
  '/settings',
] as const

export function isRemovedRoute(pathname: string): boolean {
  return REMOVED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}
