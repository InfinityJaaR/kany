export type PetUrgency = 'critical' | 'urgent' | 'normal'

export interface LostPet {
  id: number
  name: string
  breed: string
  color: string
  location: string
  date: string
  description: string
  reward: string
  contact: string
  status: PetUrgency
}

export interface FoundPet {
  id: number
  type: string
  breed: string
  color: string
  location: string
  date: string
  description: string
  condition: string
  contact: string
  match: string
  status: 'high' | 'medium' | 'normal'
}

export const lostPets: LostPet[] = [
  {
    id: 1,
    name: 'Rocky',
    breed: 'Pastor Alemán',
    color: 'Café con blanco',
    location: 'San Benito, San Salvador',
    date: 'Hace 2 días',
    description: 'Perro mediano, muy cariñoso, con collar azul. Responde al nombre Rocky.',
    reward: '$100',
    contact: '+503 7123-4567',
    status: 'urgent',
  },
  {
    id: 2,
    name: 'Mimi',
    breed: 'Gato Persa',
    color: 'Blanco y gris',
    location: 'Antiguo Cuscatlán',
    date: 'Hace 5 días',
    description: 'Gata pequeña, collar rojo con campana. Tímida pero amigable.',
    reward: '$50',
    contact: '+503 7234-5678',
    status: 'normal',
  },
  {
    id: 3,
    name: 'Firulais',
    breed: 'Cocker Spaniel',
    color: 'Marrón',
    location: 'Soyapango',
    date: 'Hace 1 semana',
    description: 'Perro pequeño, muy travieso. Lleva collar amarillo fluorescente.',
    reward: '$150',
    contact: '+503 7345-6789',
    status: 'critical',
  },
]

export const foundPets: FoundPet[] = [
  {
    id: 1,
    type: 'Perro mediano',
    breed: 'Labrador mix',
    color: 'Dorado con pecho blanco',
    location: 'Colonia Escalón, San Salvador',
    date: 'Encontrado hoy',
    description: 'Muy dócil, llevaba collar negro sin placa. Parece estar acostumbrado a estar con personas.',
    condition: 'Buen estado',
    contact: '+503 7456-7890',
    match: 'Alta coincidencia con Rocky',
    status: 'high',
  },
  {
    id: 2,
    type: 'Gata pequeña',
    breed: 'Doméstica pelo corto',
    color: 'Blanco y gris',
    location: 'Antiguo Cuscatlán',
    date: 'Hace 1 día',
    description: 'Gata asustada pero sana. Tiene campanita roja y fue resguardada temporalmente.',
    condition: 'Resguardada',
    contact: '+503 7567-8901',
    match: 'Posible coincidencia con Mimi',
    status: 'medium',
  },
  {
    id: 3,
    type: 'Cachorro',
    breed: 'Criollo',
    color: 'Negro con café',
    location: 'Santa Tecla',
    date: 'Hace 3 días',
    description: 'Encontrado cerca de una parada de buses. Necesita hogar temporal o contacto de su familia.',
    condition: 'Necesita revisión',
    contact: '+503 7678-9012',
    match: 'Sin coincidencias claras',
    status: 'normal',
  },
]

export function getPetEmoji(name: string): string {
  if (name === 'Mimi' || name === 'Bigotes') return '🐈'
  return '🐕'
}
