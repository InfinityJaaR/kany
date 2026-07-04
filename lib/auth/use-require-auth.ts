'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserType } from '@/types/auth'

export function useRequireAuth(options?: { userType?: UserType }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      if (options?.userType) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()

        if (!profile || profile.user_type !== options.userType) {
          router.replace('/')
          return
        }
        setUserType(profile.user_type as UserType)
      }

      setUserId(user.id)
      setReady(true)
    }

    check()
  }, [router, options?.userType])

  return { ready, userId, userType }
}
