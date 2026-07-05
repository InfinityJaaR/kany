'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { AuthNavLinks } from '@/components/layout/auth-button'
import {
  mobileMenuLinkClass,
  MobileMenuLink,
} from '@/components/layout/mobile-menu-link'
import { useSiteNavContext } from '@/components/layout/role-nav'
import { ThemeModeLink } from '@/components/layout/theme-toggle'
import { getMobileNavIcon, getVisibleNavItems } from '@/lib/navigation/site-nav'

function SiteNavPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const ctx = useSiteNavContext()
  const items = getVisibleNavItems(ctx)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !mounted) return null

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[200] bg-zinc-600/55 dark:bg-black/80 backdrop-blur-[2px]"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <nav
        className="fixed top-0 right-0 z-[210] flex h-full w-[min(100%,20rem)] flex-col gap-0.5 border-l border-zinc-300 bg-zinc-100 p-5 shadow-2xl md:w-80 dark:border-zinc-700 dark:bg-zinc-900"
        aria-label="Menú principal"
      >
        <div className="mb-3 flex items-center justify-between border-b border-zinc-300 pb-4 dark:border-zinc-700">
          <span className="text-base font-semibold text-foreground">Menú</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {ctx.loading ? (
          <span className={mobileMenuLinkClass}>…</span>
        ) : (
          items.map((item) => (
            <MobileMenuLink
              key={item.href}
              href={item.href}
              icon={getMobileNavIcon(item.href)}
              onClick={onClose}
            >
              {item.label}
            </MobileMenuLink>
          ))
        )}

        <div className="my-3 border-t border-zinc-300 dark:border-zinc-700" />

        <AuthNavLinks vertical mobile onNavigate={onClose} />

        <div className="my-3 border-t border-zinc-300 dark:border-zinc-700" />

        <ThemeModeLink
          className={`${mobileMenuLinkClass} text-left`}
          onToggle={onClose}
        />
      </nav>
    </>,
    document.body,
  )
}

export function SiteNavMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border bg-card p-2 hover:bg-muted transition-colors"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      <SiteNavPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}

/** @deprecated Usa SiteNavMenu */
export const MobileNav = SiteNavMenu
