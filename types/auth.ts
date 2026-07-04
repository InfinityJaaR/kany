export type UserType = 'person' | 'foundation' | 'vet'

export const USER_TYPE_LABELS: Record<UserType, string> = {
  person: 'Usuario normal',
  foundation: 'Fundación',
  vet: 'Veterinaria',
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  home_location_label: string | null
  home_department: string | null
  home_municipality: string | null
  home_latitude: number | null
  home_longitude: number | null
  notification_radius_m: number
  notify_nearby_lost_pets: boolean
  user_type: UserType
  created_at: string
}
