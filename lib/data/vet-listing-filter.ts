import type { SupabaseClient } from '@supabase/supabase-js'

type SupabaseErrorLike = {
  message?: string
  details?: string
  hint?: string
  code?: string
} | null

/** True when admin migration has not been applied yet (vets.listing_status missing). */
export function isMissingListingStatusColumn(error: SupabaseErrorLike): boolean {
  if (!error) return false
  const blob = [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return (
    blob.includes('listing_status') ||
    error.code === 'PGRST204' ||
    error.code === '42703'
  )
}

export function formatQueryError(error: SupabaseErrorLike): string {
  if (!error) return 'Unknown error'
  return (
    [error.message, error.details, error.hint, error.code].filter(Boolean).join(' — ') ||
    'Unknown error'
  )
}

type VetsSelectResult = {
  data: unknown[] | null
  error: SupabaseErrorLike
  count?: number | null
}

export async function countPublicVets(supabase: SupabaseClient): Promise<VetsSelectResult> {
  const filtered = await supabase
    .from('vets')
    .select('*', { count: 'exact', head: true })
    .eq('listing_status', 'active')

  if (!filtered.error) return filtered

  const shouldFallback =
    isMissingListingStatusColumn(filtered.error) || !formatQueryError(filtered.error).trim()

  if (shouldFallback) {
    const fallback = await supabase.from('vets').select('*', { count: 'exact', head: true })
    if (!fallback.error) return fallback
  }

  return filtered
}

export async function selectPublicVets(
  supabase: SupabaseClient,
  columns = '*',
): Promise<VetsSelectResult> {
  const filtered = await supabase.from('vets').select(columns).eq('listing_status', 'active')

  if (!filtered.error) return filtered

  const shouldFallback =
    isMissingListingStatusColumn(filtered.error) || !formatQueryError(filtered.error).trim()

  if (shouldFallback) {
    const fallback = await supabase.from('vets').select(columns)
    if (!fallback.error) return fallback
  }

  return filtered
}
