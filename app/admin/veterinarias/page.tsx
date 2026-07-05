import { fetchAdminVets } from '@/lib/data/queries'
import { VetAdminActions } from '@/components/admin/admin-actions'

export const dynamic = 'force-dynamic'

function ListingBadge({ status }: { status: string }) {
  const revoked = status === 'revoked'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
        revoked
          ? 'bg-destructive/10 text-destructive'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      }`}
    >
      {revoked ? 'revocada' : 'activa'}
    </span>
  )
}

export default async function AdminVeterinariasPage() {
  const vets = await fetchAdminVets()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Veterinarias</h2>
        <p className="text-sm text-foreground/60">
          Revoca listings incorrectos o elimínalos permanentemente si son spam o datos erróneos.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Clínica</th>
              <th className="px-4 py-3 font-medium">Ciudad</th>
              <th className="px-4 py-3 font-medium">Propietario</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/60">
                  No hay veterinarias registradas.
                </td>
              </tr>
            ) : (
              vets.map((vet) => (
                <tr key={vet.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{vet.name}</p>
                    {vet.phone ? (
                      <p className="text-xs text-foreground/50">{vet.phone}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{vet.city ?? vet.location ?? '—'}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {vet.owner_name ?? vet.owner_email ?? 'Import / sin dueño'}
                  </td>
                  <td className="px-4 py-3">
                    <ListingBadge status={vet.listing_status ?? 'active'} />
                  </td>
                  <td className="px-4 py-3">
                    <VetAdminActions
                      vetId={vet.id}
                      listingStatus={vet.listing_status ?? 'active'}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
