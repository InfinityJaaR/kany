'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { HeroVideoBackground } from '@/components/home/hero-video-background'
import {
  dashboardHeroConfig,
  dashboardHeroMinHeight,
  isMobileViewport,
  shouldAutoCollapseHero,
} from '@/lib/branding/dashboard-hero.config'

type DashboardHeroProps = {
  children: ReactNode
}

function subscribeViewport(cb: () => void) {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}

export function DashboardHero({ children }: DashboardHeroProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useSyncExternalStore(
    subscribeViewport,
    isMobileViewport,
    () => true,
  )
  const collapsedRef = useRef(false)
  const scrollLockedRef = useRef(false)

  const setCollapsedState = useCallback((next: boolean) => {
    if (collapsedRef.current === next) return
    collapsedRef.current = next
    setCollapsed(next)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (scrollLockedRef.current || !shouldAutoCollapseHero()) return

      const inner = innerRef.current
      if (!inner) return

      if (collapsedRef.current) {
        if (window.scrollY < 2) {
          setCollapsedState(false)
        }
        return
      }

      const heroHeight = inner.offsetHeight
      if (heroHeight <= 0) return

      const threshold = heroHeight * dashboardHeroConfig.collapseScrollRatio
      if (window.scrollY < threshold) return

      const modules = document.getElementById(dashboardHeroConfig.modulesSectionId)
      const targetTop = modules
        ? modules.getBoundingClientRect().top + window.scrollY - dashboardHeroConfig.headerHeightPx
        : window.scrollY

      scrollLockedRef.current = true
      setCollapsedState(true)

      window.setTimeout(() => {
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' })
        window.setTimeout(() => {
          scrollLockedRef.current = false
        }, 150)
      }, dashboardHeroConfig.collapseDurationMs)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [setCollapsedState])

  const autoCollapse = !isMobile && collapsed
  const durationMs = dashboardHeroConfig.collapseDurationMs

  return (
    <section
      className="border-b border-border data-[collapsed=true]:border-b-0"
      data-collapsed={autoCollapse}
      style={
        isMobile
          ? undefined
          : {
              display: 'grid',
              gridTemplateRows: autoCollapse ? '0fr' : '1fr',
              transitionProperty: 'grid-template-rows',
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }
      }
      aria-hidden={autoCollapse}
    >
      <div
        className={isMobile ? undefined : 'min-h-0 overflow-hidden'}
        style={
          isMobile
            ? undefined
            : {
                opacity: autoCollapse ? 0 : 1,
                transitionProperty: 'opacity',
                transitionDuration: `${durationMs}ms`,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }
        }
      >
        <div
          ref={innerRef}
          className="relative flex min-h-[var(--hero-min-height)] flex-col justify-center"
          style={
            {
              '--hero-min-height': dashboardHeroMinHeight(isMobile),
            } as CSSProperties
          }
        >
          <HeroVideoBackground paused={autoCollapse} />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
