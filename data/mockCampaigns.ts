export type CampaignStatus = 'urgent' | 'success' | 'normal'

export interface DonationCampaign {
  id: number
  title: string
  description: string
  goal: number
  current: number
  donors: number
  daysLeft: number
  organization: string
  status: CampaignStatus
  updates: number
}

export const campaigns: DonationCampaign[] = [
  {
    id: 1,
    title: 'Luna necesita cirugía de urgencia',
    description: 'Luna fue atropellada y requiere cirugía ortopédica urgente. Ayuda a salvar su vida.',
    goal: 500,
    current: 385,
    donors: 24,
    daysLeft: 5,
    organization: 'Rescate Perritos SV',
    status: 'urgent',
    updates: 3,
  },
  {
    id: 2,
    title: 'Alimento para 50 perros rescatados',
    description: 'La fundación necesita alimento de calidad para los 50 perros en el refugio durante el mes.',
    goal: 300,
    current: 180,
    donors: 12,
    daysLeft: 15,
    organization: 'Huellitas Salvadoreñas',
    status: 'normal',
    updates: 2,
  },
  {
    id: 3,
    title: 'Campaña de esterilización comunitaria',
    description: 'Jornada de esterilización para controlar la población de mascotas callejeras en Apopa.',
    goal: 800,
    current: 650,
    donors: 38,
    daysLeft: 8,
    organization: 'Veterinarios por la Vida',
    status: 'success',
    updates: 5,
  },
  {
    id: 4,
    title: 'Medicinas para gatos enfermos',
    description: 'Necesitamos antibióticos y medicinas para tratar a los gatos con infecciones respiratorias.',
    goal: 200,
    current: 95,
    donors: 8,
    daysLeft: 20,
    organization: 'Rescate Felino SV',
    status: 'normal',
    updates: 1,
  },
]

export function getCampaignProgress(current: number, goal: number): number {
  return (current / goal) * 100
}

export function getStatusColor(status: CampaignStatus) {
  switch (status) {
    case 'urgent':
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'URGENTE' }
    case 'success':
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'EN META' }
    default:
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'EN PROGRESO' }
  }
}
