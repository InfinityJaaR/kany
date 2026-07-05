import { fetchAdminCampaigns } from '@/lib/data/queries'
import { CampaignAdminActions } from '@/components/admin/admin-actions'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'revoked'
      ? 'bg-destructive/10 text-destructive'
      : status === 'success'
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        : status === 'urgent'
          ? 'bg-red-500/10 text-red-700 dark:text-red-400'
          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${styles}`}>
      {status}
    </span>
  )
}

export default async function AdminCampaignsPage() {
  const campaigns = await fetchAdminCampaigns()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Campañas de donación</h2>
        <p className="text-sm text-foreground/60">
          Revoca campañas fraudulentas o finalizadas incorrectamente. Las revocadas dejan de aceptar
          donaciones.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Campaña</th>
              <th className="px-4 py-3 font-medium">Fundación</th>
              <th className="px-4 py-3 font-medium">Recaudado</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/60">
                  No hay campañas registradas.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{campaign.title}</p>
                    {campaign.organization ? (
                      <p className="text-xs text-foreground/50">{campaign.organization}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {campaign.creator_name ?? campaign.creator_email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    ${Number(campaign.current).toLocaleString('es-SV')} / $
                    {Number(campaign.goal).toLocaleString('es-SV')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="px-4 py-3">
                    <CampaignAdminActions campaignId={campaign.id} status={campaign.status} />
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
