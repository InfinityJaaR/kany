import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export const mobileMenuLinkClass =
  'inline-flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors'

type MobileMenuLinkProps = {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  onClick?: () => void
}

export function MobileMenuLink({ href, icon: Icon, children, onClick }: MobileMenuLinkProps) {
  return (
    <Link href={href} className={mobileMenuLinkClass} onClick={onClick}>
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
      {children}
    </Link>
  )
}

type MobileMenuButtonProps = {
  icon: LucideIcon
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function MobileMenuButton({ icon: Icon, children, onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${mobileMenuLinkClass} ${className ?? ''}`}
    >
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
      {children}
    </button>
  )
}

type MobileMenuLabelProps = {
  icon: LucideIcon
  children: React.ReactNode
}

export function MobileMenuLabel({ icon: Icon, children }: MobileMenuLabelProps) {
  return (
    <span className={`${mobileMenuLinkClass} cursor-default hover:bg-transparent dark:hover:bg-transparent`}>
      <Icon className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
      {children}
    </span>
  )
}
