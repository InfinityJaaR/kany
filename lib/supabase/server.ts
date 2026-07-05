import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseRuntimeEnv } from '@/lib/supabase/env'

export async function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseRuntimeEnv()

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll from a Server Component can be ignored when middleware refreshes the session
          }
        },
      },
    },
  )
}
