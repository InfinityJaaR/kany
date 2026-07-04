import { createClient } from '@/lib/supabase/server'
import type { Profile, UserType } from '@/types/auth'

export type SessionProfile = {
  userId: string | null
  email: string | null
  userType: UserType | null
  profile: Profile | null
  isLoggedIn: boolean
}

export async function getSessionProfile(): Promise<SessionProfile> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      userId: null,
      email: null,
      userType: null,
      profile: null,
      isLoggedIn: false,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>()

  return {
    userId: user.id,
    email: user.email ?? profile?.email ?? null,
    userType: (profile?.user_type as UserType | undefined) ?? null,
    profile: profile ?? null,
    isLoggedIn: true,
  }
}
