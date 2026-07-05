import Link from 'next/link'
import { HeartHandshake, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { DonateButton } from '@/components/donations/donate-button'
import { SiteDonateButton } from '@/components/donations/site-donate-button'
import { getSessionProfile } from '@/lib/auth/profile'
import { getPayPalMode } from '@/lib/paypal'
import { getCampaignProgress, getStatusColor } from '@/data/mockCampaigns'
import { fetchCampaigns } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

export default async function DonationsPage() {
  const campaigns = await fetchCampaigns()
  const { userType } = await getSessionProfile()
  const isFoundation = userType === 'foundation'
  const paypalMode = getPayPalMode()

  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.current), 0)
  const totalDonors = campaigns.reduce((sum, c) => sum + c.donors, 0)
  const completed = campaigns.filter((c) => c.status === 'success').length
  const active = campaigns.filter((c) => c.status !== 'success').length

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Campañas de Donación</h1>
            <p className="text-foreground/60">Tu ayuda salva vidas animales. Cada donación cuenta.</p>
          </div>
          {isFoundation && (
            <Link href="/donaciones/nueva">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Crear campaña
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Buscar campañas..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-1">${totalRaised.toLocaleString()}</div>
            <p className="text-sm text-foreground/60">Total recaudado</p>
          </div>
          <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
            <div className="text-3xl font-bold text-accent mb-1">{totalDonors}</div>
            <p className="text-sm text-foreground/60">Donantes activos</p>
          </div>
          <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{completed}</div>
            <p className="text-sm text-foreground/60">Campañas completadas</p>
          </div>
          <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{active}</div>
            <p className="text-sm text-foreground/60">Campañas activas</p>
          </div>
        </div>

        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Apoya la plataforma Kany</h2>
              </div>
              <p className="text-sm text-foreground/60 max-w-xl">
                Dona directamente para mantener la plataforma comunitaria. Pago con PayPal
                {paypalMode === 'simulated' ? ' (modo simulado para demo)' : ' Sandbox'}.
              </p>
            </div>
            <SiteDonateButton paypalMode={paypalMode} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60 mb-4">No hay campañas publicadas.</p>
            <p className="text-sm text-foreground/50 mb-6">
              Ejecuta <code className="text-xs bg-muted px-1 rounded">supabase/seed.sql</code> o crea una como fundación.
            </p>
            {isFoundation && (
              <Link href="/donaciones/nueva">
                <Button className="bg-primary hover:bg-primary/90">Crear campaña</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => {
              const progress = getCampaignProgress(Number(campaign.current), Number(campaign.goal))
              const colors = getStatusColor(campaign.status as 'urgent' | 'success' | 'normal')

              return (
                <article
                  key={campaign.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/30 hover:shadow-md"
                >
                  {campaign.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {!campaign.image_url && (
                          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                            <HeartHandshake className="size-6 text-secondary" strokeWidth={1.75} />
                          </div>
                        )}
                        <h3 className="line-clamp-2 text-lg font-bold text-foreground">{campaign.title}</h3>
                        {campaign.organization && (
                          <p className="mt-1 truncate text-xs text-foreground/60">{campaign.organization}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                        {colors.label}
                      </span>
                    </div>

                    {campaign.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-foreground/65">{campaign.description}</p>
                    )}

                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          ${campaign.current} de ${campaign.goal}
                        </span>
                        <span className="text-foreground/60">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">{campaign.donors}</div>
                        <div className="text-[10px] text-foreground/55">Donantes</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-accent">{campaign.days_left ?? '—'}</div>
                        <div className="text-[10px] text-foreground/55">Días</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{campaign.updates}</div>
                        <div className="text-[10px] text-foreground/55">Updates</div>
                      </div>
                    </div>

                    <div className="mt-auto w-full [&_button]:w-full">
                      <DonateButton
                        campaignId={campaign.id}
                        campaignTitle={campaign.title}
                        paypalMode={paypalMode}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
