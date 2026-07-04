import { createClient } from '@/lib/supabase/server'

export type LostPetRow = {
  id: number
  name: string
  breed: string | null
  color: string | null
  location: string | null
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

export async function fetchVets(): Promise<VetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchVets:', error.message)
    return []
  }
  return data ?? []
}
