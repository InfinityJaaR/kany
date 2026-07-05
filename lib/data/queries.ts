import { createClient } from '@/lib/supabase/server'

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
  const { data, error } = await supabase
    .from('vets')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(500)

  if (error) {
    console.error('fetchVetsNearby:', error.message)
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchLostPets:', error.message)
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
  const { data, error } = await supabase
    .from('vets')
    .select('city, location, category_name, search_string, services')
    .limit(3000)

  if (error) {
    console.error('fetchVetFilterOptions:', error.message)
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

export async function fetchVets(options: FetchVetsOptions = {}): Promise<FetchVetsResult> {
  const page = Math.max(1, options.page ?? 1)
  const pageSize = options.pageSize ?? 24
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()
  let query = supabase.from('vets').select('*', { count: 'exact' })

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

  const { data, error, count } = await query
    .order('total_score', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('fetchVets:', error.message)
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
