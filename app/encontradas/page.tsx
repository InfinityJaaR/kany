import { SiteHeader } from '@/components/layout/site-header'
import { PetsModuleNav } from '@/components/layout/pets-module-nav'
import { FoundPetMatcher } from '@/components/pets/found-pet-matcher'
import { fetchLostPets } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

export default async function FoundPetsPage() {
  const activeLostPets = await fetchLostPets()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Encontré una mascota</h1>
          <p className="max-w-3xl text-foreground/60">
            Filtra los reportes activos por zona, raza o color. Si una publicación coincide con la mascota que viste,
            avisa al dueño para que pueda confirmar.
          </p>
        </div>

        <PetsModuleNav active="encontradas" />

        <FoundPetMatcher pets={activeLostPets} />
      </main>
    </div>
  )
}
