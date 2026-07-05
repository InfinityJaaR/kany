import { getFoundPetRetentionDays } from '@/lib/auth/admin'
import { fetchAdminRecoveredLostPets } from '@/lib/data/queries'
import {
  FoundPetAdminActions,
  PurgeStaleFoundPetsButton,
} from '@/components/admin/admin-actions'

export const dynamic = 'force-dynamic'

function daysSince(isoDate: string): number {
  const created = new Date(isoDate).getTime()
  const now = Date.now()
  return Math.floor((now - created) / (1000 * 60 * 60 * 24))
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-SV', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminEncontradasPage() {
  const retentionDays = getFoundPetRetentionDays()
  const pets = await fetchAdminRecoveredLostPets()
  const staleCount = pets.filter((pet) => daysSince(pet.created_at) >= retentionDays).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Mascotas encontradas</h2>
          <p className="text-sm text-foreground/60">
            Elimina registros antiguos (≥ {retentionDays} días) para liberar espacio. Solo aplica a
            casos marcados como encontrados.
          </p>
        </div>
        <PurgeStaleFoundPetsButton count={staleCount} retentionDays={retentionDays} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Mascota</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Registrado</th>
              <th className="px-4 py-3 font-medium">Antigüedad</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/60">
                  No hay mascotas encontradas registradas.
                </td>
              </tr>
            ) : (
              pets.map((pet) => {
                const ageDays = daysSince(pet.created_at)
                const stale = ageDays >= retentionDays

                return (
                  <tr
                    key={pet.id}
                    className={`border-b border-border last:border-b-0 ${stale ? 'bg-amber-500/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{pet.name}</p>
                      {pet.breed ? (
                        <p className="text-xs text-foreground/50">{pet.breed}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">{pet.location ?? '—'}</td>
                    <td className="px-4 py-3 text-foreground/70">{formatDate(pet.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          stale
                            ? 'font-medium text-amber-700 dark:text-amber-400'
                            : 'text-foreground/70'
                        }
                      >
                        {ageDays} día(s)
                        {stale ? ' · antigua' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <FoundPetAdminActions petId={pet.id} stale={stale} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
