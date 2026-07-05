import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/auth/is-admin-user'
import { createClient } from '@/lib/supabase/server'

export { isAdminUser } from '@/lib/auth/is-admin-user'

export async function getAdminSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    user,
    userId: user?.id ?? null,
    isAdmin: isAdminUser(user),
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session.isAdmin || !session.userId || !session.user) {
    redirect('/?error=unauthorized')
  }
  return { user: session.user, userId: session.userId }
}

export async function assertAdmin() {
  const session = await getAdminSession()
  if (!session.isAdmin || !session.userId || !session.user) {
    throw new Error('Unauthorized')
  }
  return { user: session.user, userId: session.userId }
}

export function getFoundPetRetentionDays(): number {
  const raw = process.env.ADMIN_FOUND_PET_RETENTION_DAYS
  const parsed = raw ? parseInt(raw, 10) : 90
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 90
}
