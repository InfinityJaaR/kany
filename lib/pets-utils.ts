export type LostPetStatus = 'critical' | 'urgent' | 'normal' | 'found'

export const LOST_PET_STATUS_OPTIONS: { value: Exclude<LostPetStatus, 'found'>; label: string }[] = [
  { value: 'critical', label: 'Crítico' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'normal', label: 'Normal' },
]

export function getPetEmoji(name: string): string {
  if (/gato|gata|mimi|miau/i.test(name)) return '🐈'
  return '🐕'
}

export function getLostStatusLabel(status: string): string {
  if (status === 'critical') return 'CRÍTICO'
  if (status === 'urgent') return 'URGENTE'
  if (status === 'found') return 'ENCONTRADA'
  return 'NORMAL'
}

export function getFoundStatusLabel(status: string): string {
  if (status === 'high') return 'ALTA COINCIDENCIA'
  if (status === 'medium') return 'POSIBLE MATCH'
  return 'REPORTADA'
}
