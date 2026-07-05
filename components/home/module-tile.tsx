'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { HomeCommunityStats } from '@/lib/data/queries'
import {
  getStatValue,
  resolveModuleHref,
  type HomeModuleContext,
  type HomeModuleDefinition,
} from '@/lib/branding/home-modules.config'
import { cn } from '@/lib/utils'

type ModuleTileProps = {
  module: HomeModuleDefinition
  stats: HomeCommunityStats
  ctx: HomeModuleContext
  index: number
}

export function ModuleTile({ module, stats, ctx, index }: ModuleTileProps) {
  const ref = useRef<HTMLElement>(null)
  const Icon = module.icon
  const statCount = getStatValue(stats, module.statKey)
  const primaryHref = resolveModuleHref(module.primaryAction.href, ctx)
  const visibleLinks = module.secondaryLinks.filter((link) => link.show?.(ctx) ?? true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      el.dataset.visible = 'true'
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          window.setTimeout(() => {
            el.dataset.visible = 'true'
          }, index * 80)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <article
      ref={ref}
      data-visible="false"
      className={cn(
        'group flex h-full flex-col rounded-2xl border p-6 transition-[transform,opacity,border-color,box-shadow] duration-500 ease-out',
        'opacity-0 translate-y-3 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0',
        'motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none',
        'hover:-translate-y-px hover:border-primary/40',
        'hover:shadow-[0_8px_24px_-8px_oklch(from_var(--primary)_l_c_h_/_0.15)]',
        module.tint.surface,
        module.tint.border,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            module.tint.iconBg,
          )}
        >
          <Icon className={cn('size-6', module.tint.icon)} strokeWidth={1.75} aria-hidden />
        </div>
        <span className="text-sm font-medium text-foreground/70">{module.label}</span>
      </div>

      <h4 className="mb-2 text-lg font-bold text-foreground">{module.title}</h4>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/60">{module.description}</p>

      <p
        className={cn(
          'mb-4 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium tabular-nums',
          module.tint.border,
          module.tint.icon,
        )}
      >
        {module.statLabel(statCount)}
      </p>

      <Link href={primaryHref} className="mb-3">
        <Button
          className={cn(
            'w-full active:scale-[0.98] sm:w-auto',
            module.id === 'donations' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
          )}
        >
          {module.primaryAction.label}
        </Button>
      </Link>

      {visibleLinks.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-medium text-primary/90 transition-colors hover:text-primary hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
