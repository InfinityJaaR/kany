'use client'

import { useSyncExternalStore } from 'react'
import type { HomeCommunityStats } from '@/lib/data/queries'
import { buildHomeStats } from '@/lib/branding/home-stats'
import type { ThirdModule } from '@/lib/modules'

/** Copias del set de métricas para loop continuo sin salto visible */
const MARQUEE_COPIES = 4

type CommunityTrustStripProps = {
  stats: HomeCommunityStats
  third: ThirdModule
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex shrink-0 items-baseline gap-3 px-10 md:px-14"
      aria-hidden={false}
    >
      <span className="text-2xl font-bold tabular-nums text-primary md:text-3xl">
        {value.toLocaleString('es-SV')}
      </span>
      <span className="whitespace-nowrap text-sm text-foreground/60">{label}</span>
    </div>
  )
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function CommunityTrustStrip({ stats, third }: CommunityTrustStripProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  )
  const items = buildHomeStats(stats, third)
  const loop = Array.from({ length: MARQUEE_COPIES }, () => items).flat()
  const marqueeShift = `${100 / MARQUEE_COPIES}%`
  const durationSec = Math.max(items.length * 4, 14)

  return (
    <section aria-label="Actividad comunitaria" className="w-full">
      <div className="relative overflow-hidden py-4 md:py-5">
        {reducedMotion ? (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4">
            {items.map((item) => (
              <div key={item.label} aria-label={`${item.label}: ${item.value.toLocaleString('es-SV')}`}>
                <StatBlock value={item.value} label={item.label} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex w-max animate-metrics-marquee will-change-transform"
            style={
              {
                '--marquee-shift': marqueeShift,
                animationDuration: `${durationSec}s`,
              } as React.CSSProperties
            }
            aria-live="off"
          >
            {loop.map((item, i) => (
              <StatBlock key={`${item.label}-${i}`} value={item.value} label={item.label} />
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-border/50 px-4 py-3 text-center text-xs leading-relaxed text-foreground/55 sm:px-6 md:text-sm">
        Personas de El Salvador ayudando a reunir mascotas y apoyar rescates.
      </p>
    </section>
  )
}
