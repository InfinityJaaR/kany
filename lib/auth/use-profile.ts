'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isAdminUser } from '@/lib/auth/is-admin-user'
import type { Profile, UserType } from '@/types/auth'

export function useProfile() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserId(null)
        setUserType(null)
        setIsAdmin(false)
        setProfile(null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle<Profile>()

      setUserId(user.id)
      setUserType((data?.user_type as UserType | undefined) ?? null)
      setIsAdmin(isAdminUser(user))
      setProfile(data ?? null)
      setLoading(false)
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    loading,
    userId,
    userType,
    isAdmin,
    profile,
    isLoggedIn: !!userId,
  }
}
