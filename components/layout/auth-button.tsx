'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut, MessageCircle, User, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  MobileMenuButton,
  MobileMenuLabel,
  MobileMenuLink,
  mobileMenuLinkClass,
} from '@/components/layout/mobile-menu-link'
import { desktopNavLinkClass, navLinkClass } from '@/lib/navigation/site-nav'
import type { User } from '@supabase/supabase-js'

type AuthNavLinksProps = {
  className?: string
  onNavigate?: () => void
  vertical?: boolean
  mobile?: boolean
}

export function AuthNavLinks({ className, onNavigate, vertical = false, mobile = false }: AuthNavLinksProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    onNavigate?.()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <span className={`text-sm text-foreground/40 ${className ?? ''}`}>…</span>
  }

  if (!user) {
    if (mobile) {
      return (
        <MobileMenuLink href="/auth/login" icon={LogIn} onClick={onNavigate}>
          Iniciar sesión
        </MobileMenuLink>
      )
    }

    return (
      <Link href="/auth/login" className={`${desktopNavLinkClass} ${className ?? ''}`} onClick={onNavigate}>
        Iniciar sesión
      </Link>
    )
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Usuario'

  if (mobile && vertical) {
    return (
      <div className={`flex flex-col items-stretch gap-1 ${className ?? ''}`}>
        <MobileMenuLabel icon={UserCircle}>{displayName}</MobileMenuLabel>
        <MobileMenuLink href="/perfil" icon={User} onClick={onNavigate}>
          Perfil
        </MobileMenuLink>
        <MobileMenuLink href="/mensajes" icon={MessageCircle} onClick={onNavigate}>
          Mensajes
        </MobileMenuLink>
        <MobileMenuButton icon={LogOut} onClick={handleSignOut}>
          Salir
        </MobileMenuButton>
      </div>
    )
  }

  const itemClass = vertical
    ? `${navLinkClass} w-full px-1 py-2 text-left`
    : desktopNavLinkClass

  return (
    <div className={`flex ${vertical ? 'flex-col items-stretch gap-1' : 'items-center gap-4'} ${className ?? ''}`}>
      <span className="max-w-[140px] truncate text-sm font-medium text-foreground/80">
        {displayName}
      </span>
      <Link href="/perfil" className={itemClass} onClick={onNavigate}>
        Perfil
      </Link>
      <Link href="/mensajes" className={itemClass} onClick={onNavigate}>
        Mensajes
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className={`inline-flex items-center gap-1.5 ${itemClass}`}
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </div>
  )
}

/** @deprecated Usa AuthNavLinks */
export function AuthButton({ className }: { className?: string }) {
  return <AuthNavLinks className={className} />
}
