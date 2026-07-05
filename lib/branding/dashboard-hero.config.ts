/**
 * Comportamiento del bloque Dashboard (hero de inicio).
 *
 * collapseScrollRatio: al bajar este % de la altura del hero, se cierra solo (solo desktop).
 * modulesPeekPx: cuántos px de la sección Módulos se asoman abajo al cargar.
 * autoCollapseOnMobile: false evita el salto brusco de scroll en móvil.
 */
export const dashboardHeroConfig = {
  collapseScrollRatio: 0.5,
  autoCollapseOnMobile: false,
  modulesSectionId: 'modulos',
  headerHeightPx: 64,
  modulesPeekPx: 72,
  /** Mobile: un poco más de asomo de módulos al cargar. */
  mobileModulesPeekPx: 100,
  collapseDurationMs: 900,
} as const

export function dashboardHeroMinHeight(mobile = false, config = dashboardHeroConfig) {
  const peek = mobile ? config.mobileModulesPeekPx : config.modulesPeekPx
  return `calc(100dvh - ${config.headerHeightPx}px - ${peek}px)`
}

export function isMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

export function shouldAutoCollapseHero() {
  if (typeof window === 'undefined') return true
  if (isMobileViewport()) return dashboardHeroConfig.autoCollapseOnMobile
  return true
}
