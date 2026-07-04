'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserType } from '@/types/auth'

function safeRedirectPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null
  return path
}

export function useRequireAuth(options?: {
  userType?: UserType
  redirectTo?: string
}) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const currentPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : options?.redirectTo ?? '/'

      if (!user) {
        const loginUrl = new URL('/auth/login', window.location.origin)
        loginUrl.searchParams.set('redirect', safeRedirectPath(currentPath) ?? '/')
        router.replace(loginUrl.pathname + loginUrl.search)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (options?.userType) {
        if (!profile || profile.user_type !== options.userType) {
          router.replace('/?error=wrong_role')
          return
        }
        setUserType(profile.user_type as UserType)
      }

      setUserId(user.id)
      setReady(true)
    }

    check()
  }, [router, options?.userType, options?.redirectTo])

  return { ready, userId, userType }
}
