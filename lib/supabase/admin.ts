import { createClient } from '@supabase/supabase-js'
import { getSupabaseRuntimeEnv } from '@/lib/supabase/env'

export function createAdminClient() {
  const { supabaseUrl } = getSupabaseRuntimeEnv()

  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
