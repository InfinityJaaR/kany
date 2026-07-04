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
  user_type: UserType
  created_at: string
}
