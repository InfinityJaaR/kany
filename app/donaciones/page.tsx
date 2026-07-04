import Link from 'next/link'
import { Heart, TrendingUp, Users, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { campaigns, getCampaignProgress, getStatusColor } from '@/data/mockCampaigns'

export default function DonationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Campañas de Donación</h1>
            <p className="text-foreground/60">Tu ayuda salva vidas animales. Cada donación cuenta.</p>
          </div>
          <Link href="/donaciones/nueva">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Crear campaña
            </Button>
          </Link>
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
            <div className="text-3xl font-bold text-primary mb-1">$18.5K</div>
            <p className="text-sm text-foreground/60">Total recaudado</p>
          </div>
          <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
            <div className="text-3xl font-bold text-accent mb-1">127</div>
            <p className="text-sm text-foreground/60">Donantes activos</p>
          </div>
          <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">24</div>
            <p className="text-sm text-foreground/60">Campañas completadas</p>
          </div>
          <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">12</div>
            <p className="text-sm text-foreground/60">Campañas activas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-6">
          {campaigns.map((campaign) => {
            const progress = getCampaignProgress(campaign.current, campaign.goal)
            const colors = getStatusColor(campaign.status)

            return (
              <div key={campaign.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-4xl flex-shrink-0">
                      ❤️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-1">{campaign.title}</h3>
                          <p className="text-sm text-foreground/60 mb-3">{campaign.organization}</p>
                          <p className="text-sm text-foreground/70 max-w-2xl">{campaign.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text}`}>
                          {colors.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        ${campaign.current} de ${campaign.goal}
                      </span>
                      <span className="text-sm text-foreground/60">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">{campaign.donors}</div>
                      <div className="text-xs text-foreground/60 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" /> Donantes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent mb-1">{campaign.daysLeft}</div>
                      <div className="text-xs text-foreground/60">Días restantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{campaign.updates}</div>
                      <div className="text-xs text-foreground/60 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Actualizaciones
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">Ver detalles</Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <Heart className="w-4 h-4 mr-2" /> Donar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
