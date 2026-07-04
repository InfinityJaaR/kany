import type { User } from '@supabase/supabase-js'

/** OAuth users must pick user_type on first login; email signup sets it at register. */
export function needsOnboarding(user: User | null): boolean {
  if (!user) return false
  if (user.user_metadata?.onboarding_completed === true) return false
  if (user.user_metadata?.user_type) return false
  return user.app_metadata?.provider === 'google'
}
