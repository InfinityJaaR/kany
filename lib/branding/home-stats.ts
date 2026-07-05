import type { HomeCommunityStats } from '@/lib/data/queries'
import type { ThirdModule } from '@/lib/modules'

export type HomeStatItem = {
  value: number
  label: string
}

export function buildHomeStats(stats: HomeCommunityStats, third: ThirdModule): HomeStatItem[] {
  const items: HomeStatItem[] = [
    { value: stats.activeLostPets, label: 'Reportes activos' },
    { value: stats.foundPets, label: 'Mascotas encontradas' },
    { value: stats.activeCampaigns, label: 'Campañas activas' },
  ]

  if (third === 'vets') {
    items.push({ value: stats.vets, label: 'Veterinarias aliadas' })
  } else if (third === 'prices') {
    items.push({ value: stats.foodPrices, label: 'Precios registrados' })
  }

  return items
}
