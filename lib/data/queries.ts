import { createClient } from '@/lib/supabase/server'
import {
  countPublicVets,
  formatQueryError,
  isMissingListingStatusColumn,
} from '@/lib/data/vet-listing-filter'

export type LostPetRow = {
  id: number
  name: string
  breed: string | null
  color: string | null
  location: string | null
  location_department: string | null
  location_municipality: string | null
  latitude: number | null
  longitude: number | null
  date_text: string | null
  description: string | null
  reward: string | null
  contact: string | null
  status: string
  image_url: string | null
  reported_by: string | null
  created_at: string
}

export type FoundPetRow = {
  id: number
  type: string
  breed: string | null
  color: string | null
  location: string | null
  date_text: string | null
  description: string | null
  condition: string | null
  contact: string | null
  match: string | null
  status: string
  image_url: string | null
  created_at: string
}

export type CampaignRow = {
  id: number
  title: string
  description: string | null
  goal: number
  current: number
  donors: number
  days_left: number | null
  organization: string | null
  status: string
  updates: number
  image_url: string | null
  creator_id: string | null
  revoked_at: string | null
  revoked_by: string | null
  revoke_reason: string | null
  created_at: string
}

export type FoodPriceRow = {
  id: number
  brand: string
  weight: string | null
  price: number
  store: string | null
  available: string | null
}

export type VetRow = {
  id: number
  name: string
  services: string | null
  location: string | null
  phone: string | null
  hours: string | null
  promo: string | null
  title: string | null
  latitude: number | null
  longitude: number | null
  located_in: string | null
  category_name: string | null
  search_string: string | null
  address: string | null
  city: string | null
  website: string | null
  total_score: number | null
  url: string | null
  image_url: string | null
  description: string | null
  source_file: string | null
  place_id: string | null
  hours_summary: string | null
  owner_id: string | null
  listing_status: string
  revoked_at: string | null
  revoked_by: string | null
  revoke_reason: string | null
  created_at: string
}

export type FetchVetsOptions = {
  q?: string
  city?: string
  category?: string
  page?: number
  pageSize?: number
}

export type FetchVetsResult = {
  data: VetRow[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export type VetRowWithDistance = VetRow & { distanceKm: number }

export type AdminCampaignRow = CampaignRow & {
  creator_email: string | null
  creator_name: string | null
}

export type AdminVetRow = VetRow & {
  owner_email: string | null
  owner_name: string | null
}

export type VetFilterOptions = {
  cities: string[]
  categories: string[]
}

export async function fetchVetsNearby(
  lat: number,
  lng: number,
  limit = 6,
): Promise<VetRowWithDistance[]> {
  const supabase = await createClient()
  let { data, error } = await supabase
    .from('vets')
    .select('*')
    .eq('listing_status', 'active')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(500)

  if (error && (isMissingListingStatusColumn(error) || !formatQueryError(error).trim())) {
    ;({ data, error } = await supabase
      .from('vets')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(500))
  }

  if (error) {
    console.error('fetchVetsNearby:', formatQueryError(error))
    return []
  }

  const { haversineDistanceKm } = await import('@/lib/geo')

  return (data ?? [])
    .map((vet) => ({
      ...vet,
      distanceKm: haversineDistanceKm(lat, lng, vet.latitude!, vet.longitude!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

export async function fetchLostPets(): Promise<LostPetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
    .neq('status', 'found')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchLostPets:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchRecoveredLostPets(): Promise<LostPetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
    .eq('status', 'found')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchRecoveredLostPets:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchFoundPets(): Promise<FoundPetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('found_pets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchFoundPets:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchCampaigns(): Promise<CampaignRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .neq('status', 'revoked')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchCampaigns:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchFoodPrices(): Promise<FoodPriceRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('food_prices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchFoodPrices:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchVetFilterOptions(): Promise<VetFilterOptions> {
  const supabase = await createClient()
  const columns = 'city, location, category_name, search_string, services'
  let { data, error } = await supabase
    .from('vets')
    .select(columns)
    .eq('listing_status', 'active')
    .limit(3000)

  if (error && (isMissingListingStatusColumn(error) || !formatQueryError(error).trim())) {
    ;({ data, error } = await supabase.from('vets').select(columns).limit(3000))
  }

  if (error) {
    console.error('fetchVetFilterOptions:', formatQueryError(error))
    return { cities: [], categories: [] }
  }

  const cities = new Set<string>()
  const categories = new Set<string>()

  for (const vet of data ?? []) {
    const city = vet.city || vet.location
    const category = vet.category_name || vet.search_string || vet.services
    if (city) cities.add(city)
    if (category) categories.add(category)
  }

  return {
    cities: [...cities].sort((a, b) => a.localeCompare(b, 'es')),
    categories: [...categories].sort((a, b) => a.localeCompare(b, 'es')),
  }
}

export type HomeCommunityStats = {
  activeLostPets: number
  foundPets: number
  activeCampaigns: number
  vets: number
  foodPrices: number
}

export async function fetchHomeCommunityStats(): Promise<HomeCommunityStats> {
  const supabase = await createClient()

  const [lostResult, foundResult, campaignsResult, vetsResult, pricesResult] = await Promise.all([
    supabase
      .from('lost_pets')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'found'),
    supabase.from('found_pets').select('*', { count: 'exact', head: true }),
    supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'success')
      .neq('status', 'revoked'),
    countPublicVets(supabase),
    supabase.from('food_prices').select('*', { count: 'exact', head: true }),
  ])

  if (lostResult.error) {
    console.error('fetchHomeCommunityStats lost_pets:', formatQueryError(lostResult.error))
  }
  if (foundResult.error) {
    console.error('fetchHomeCommunityStats found_pets:', formatQueryError(foundResult.error))
  }
  if (campaignsResult.error) {
    console.error('fetchHomeCommunityStats campaigns:', formatQueryError(campaignsResult.error))
  }
  if (vetsResult.error) {
    console.error('fetchHomeCommunityStats vets:', formatQueryError(vetsResult.error))
  }
  if (pricesResult.error) {
    console.error('fetchHomeCommunityStats food_prices:', formatQueryError(pricesResult.error))
  }

  return {
    activeLostPets: lostResult.count ?? 0,
    foundPets: foundResult.count ?? 0,
    activeCampaigns: campaignsResult.count ?? 0,
    vets: vetsResult.count ?? 0,
    foodPrices: pricesResult.count ?? 0,
  }
}

export async function fetchVets(options: FetchVetsOptions = {}): Promise<FetchVetsResult> {
  const page = Math.max(1, options.page ?? 1)
  const pageSize = options.pageSize ?? 24
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()
  let query = supabase.from('vets').select('*', { count: 'exact' }).eq('listing_status', 'active')

  const q = options.q?.trim()
  if (q) {
    const pattern = `%${q}%`
    query = query.or(
      `name.ilike.${pattern},title.ilike.${pattern},services.ilike.${pattern},category_name.ilike.${pattern},search_string.ilike.${pattern},location.ilike.${pattern},city.ilike.${pattern},address.ilike.${pattern}`,
    )
  }

  if (options.city) {
    query = query.or(`city.eq.${options.city},location.eq.${options.city}`)
  }

  if (options.category) {
    query = query.or(`category_name.eq.${options.category},search_string.eq.${options.category},services.eq.${options.category}`)
  }

  let { data, error, count } = await query
    .order('total_score', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
    .range(from, to)

  if (error && (isMissingListingStatusColumn(error) || !formatQueryError(error).trim())) {
    let fallbackQuery = supabase.from('vets').select('*', { count: 'exact' })
    if (q) {
      const pattern = `%${q}%`
      fallbackQuery = fallbackQuery.or(
        `name.ilike.${pattern},title.ilike.${pattern},services.ilike.${pattern},category_name.ilike.${pattern},search_string.ilike.${pattern},location.ilike.${pattern},city.ilike.${pattern},address.ilike.${pattern}`,
      )
    }
    if (options.city) {
      fallbackQuery = fallbackQuery.or(`city.eq.${options.city},location.eq.${options.city}`)
    }
    if (options.category) {
      fallbackQuery = fallbackQuery.or(
        `category_name.eq.${options.category},search_string.eq.${options.category},services.eq.${options.category}`,
      )
    }
    ;({ data, error, count } = await fallbackQuery
      .order('total_score', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true })
      .range(from, to))
  }

  if (error) {
    console.error('fetchVets:', formatQueryError(error))
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  const total = count ?? 0
  return {
    data: data ?? [],
    count: total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  }
}

async function attachProfileFields<T extends { creator_id?: string | null; owner_id?: string | null }>(
  rows: T[],
  idKey: 'creator_id' | 'owner_id',
  emailKey: 'creator_email' | 'owner_email',
  nameKey: 'creator_name' | 'owner_name',
): Promise<(T & Record<string, string | null>)[]> {
  if (rows.length === 0) return []

  const supabase = await createClient()
  const ids = [...new Set(rows.map((r) => r[idKey]).filter(Boolean))] as string[]

  if (ids.length === 0) {
    return rows.map((row) => ({
      ...row,
      [emailKey]: null,
      [nameKey]: null,
    }))
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', ids)

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]))

  return rows.map((row) => {
    const profile = row[idKey] ? byId.get(row[idKey]!) : null
    return {
      ...row,
      [emailKey]: profile?.email ?? null,
      [nameKey]: profile?.full_name ?? null,
    }
  })
}

export async function fetchAdminCampaigns(): Promise<AdminCampaignRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchAdminCampaigns:', error.message)
    return []
  }

  return (await attachProfileFields(
    data ?? [],
    'creator_id',
    'creator_email',
    'creator_name',
  )) as AdminCampaignRow[]
}

export async function fetchAdminVets(): Promise<AdminVetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchAdminVets:', error.message)
    return []
  }

  return (await attachProfileFields(
    data ?? [],
    'owner_id',
    'owner_email',
    'owner_name',
  )) as AdminVetRow[]
}

export async function fetchAdminRecoveredLostPets(): Promise<LostPetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
    .eq('status', 'found')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchAdminRecoveredLostPets:', error.message)
    return []
  }

  return data ?? []
}

export async function fetchAdminStaleFoundPets(days = 90): Promise<LostPetRow[]> {
  const supabase = await createClient()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffIso = cutoff.toISOString()

  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
    .eq('status', 'found')
    .lt('created_at', cutoffIso)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('fetchAdminStaleFoundPets:', error.message)
    return []
  }

  return data ?? []
}

export async function fetchAdminDashboardCounts(retentionDays = 90) {
  const [campaigns, vets, recovered, stale] = await Promise.all([
    fetchAdminCampaigns(),
    fetchAdminVets(),
    fetchAdminRecoveredLostPets(),
    fetchAdminStaleFoundPets(retentionDays),
  ])

  return {
    totalCampaigns: campaigns.length,
    revokedCampaigns: campaigns.filter((c) => c.status === 'revoked').length,
    totalVets: vets.length,
    revokedVets: vets.filter((v) => v.listing_status === 'revoked').length,
    recoveredPets: recovered.length,
    staleFoundPets: stale.length,
    retentionDays,
  }
}
