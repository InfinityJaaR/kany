export function getPetEmoji(name: string): string {
  if (/gato|gata|mimi|miau/i.test(name)) return '🐈'
  return '🐕'
}

export function getLostStatusLabel(status: string): string {
  if (status === 'critical') return 'CRÍTICO'
  if (status === 'urgent') return 'URGENTE'
  return 'NORMAL'
}

export function getFoundStatusLabel(status: string): string {
  if (status === 'high') return 'ALTA COINCIDENCIA'
  if (status === 'medium') return 'POSIBLE MATCH'
  return 'REPORTADA'
}
