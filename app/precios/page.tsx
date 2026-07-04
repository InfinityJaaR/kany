import { Calculator, Search, Store, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/site-header'
import { fetchFoodPrices } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

function parseWeightLb(weight: string | null): number {
  if (!weight) return 1
  const match = weight.match(/([\d.]+)/)
  return match ? Number.parseFloat(match[1]) || 1 : 1
}

export default async function PreciosPage() {
  const foodPrices = await fetchFoodPrices()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Comparador de Precios</h1>
          <p className="text-foreground/60">Compara comida por marca, tienda, peso y precio aproximado</p>
        </div>
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
          <input
            placeholder="Buscar alimento, marca o tienda..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {foodPrices.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-foreground/60">No hay precios cargados. Ejecuta <code className="text-xs bg-muted px-1 rounded">supabase/seed.sql</code>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foodPrices.map((food) => (
              <article key={food.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{food.brand}</h2>
                    {food.weight && (
                      <p className="text-sm text-foreground/60 flex items-center gap-2 mt-1">
                        <Package className="w-4 h-4" /> {food.weight}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${Number(food.price).toFixed(2)}</p>
                    <p className="text-xs text-foreground/50">total</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted mb-4">
                  <span className="text-sm text-foreground/60 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Precio estimado por lb
                  </span>
                  <span className="font-semibold text-foreground">
                    ${(Number(food.price) / parseWeightLb(food.weight)).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4" /> {food.store} · {food.available}
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">Ver en marketplace</Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
