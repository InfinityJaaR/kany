type SupabaseRuntimeEnv = {
  supabaseUrl: string
  supabaseAnonKey: string
}

function trimEnv(value: string | undefined): string | undefined {
  return value?.trim() || undefined
}

export function getSupabaseRuntimeEnv(): SupabaseRuntimeEnv {
  // Static property access is required: middleware inlines env vars at build time
  // and dynamic lookups like process.env[key] resolve to undefined.
  const supabaseUrl =
    trimEnv(process.env.SUPABASE_URL) ??
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnonKey =
    trimEnv(process.env.SUPABASE_ANON_KEY) ??
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env or .env.local.',
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}
