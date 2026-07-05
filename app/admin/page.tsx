import Link from 'next/link'
import { getFoundPetRetentionDays } from '@/lib/auth/admin'
import { fetchAdminDashboardCounts } from '@/lib/data/queries'
import { PurgeStaleFoundPetsButton } from '@/components/admin/admin-actions'

export const dynamic = 'force-dynamic'

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: number
  hint?: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/40"
    >
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-2 text-xs text-foreground/50">{hint}</p> : null}
    </Link>
  )
}

export default async function AdminDashboardPage() {
  const retentionDays = getFoundPetRetentionDays()
  const counts = await fetchAdminDashboardCounts(retentionDays)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Campañas activas"
          value={counts.totalCampaigns - counts.revokedCampaigns}
          hint={`${counts.revokedCampaigns} revocada(s)`}
          href="/admin/campaigns"
        />
        <StatCard
          label="Veterinarias activas"
          value={counts.totalVets - counts.revokedVets}
          hint={`${counts.revokedVets} revocada(s)`}
          href="/admin/veterinarias"
        />
        <StatCard
          label="Mascotas encontradas"
          value={counts.recoveredPets}
          hint={`${counts.staleFoundPets} con más de ${retentionDays} días`}
          href="/admin/encontradas"
        />
      </div>

      {counts.staleFoundPets > 0 ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="text-lg font-semibold text-foreground">Limpieza recomendada</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Hay {counts.staleFoundPets} registro(s) de mascotas encontradas con más de{' '}
            {retentionDays} días. Puedes eliminarlos para liberar espacio.
          </p>
          <div className="mt-4">
            <PurgeStaleFoundPetsButton count={counts.staleFoundPets} retentionDays={retentionDays} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
