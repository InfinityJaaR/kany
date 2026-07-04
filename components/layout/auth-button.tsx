'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthButton() {
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
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        …
      </Button>
    )
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm">
          <span className="hidden sm:inline">Iniciar sesión</span>
          <span className="sm:hidden">Entrar</span>
        </Button>
      </Link>
    )
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Usuario'

  return (
    <div className="flex items-center gap-2">
      <span className="hidden md:inline text-sm text-foreground/70 max-w-[120px] truncate">
        {displayName}
      </span>
      <Link href="/perfil">
        <Button variant="outline" size="sm">
          Perfil
        </Button>
      </Link>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Salir
      </Button>
    </div>
  )
}
