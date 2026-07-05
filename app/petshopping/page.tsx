import Link from 'next/link'
import { ExternalLink, Package, Search, Store, Tags } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { ProductCardImage } from '@/components/petshopping/product-card-image'
import { Button } from '@/components/ui/button'
import { fetchPetShoppingPrices } from '@/lib/data/queries'

export const dynamic = 'force-dynamic'

type PetShoppingPageProps = {
  searchParams: Promise<{ q?: string }>
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium' }).format(new Date(value))
}

export default async function PetShoppingPage({ searchParams }: PetShoppingPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const products = await fetchPetShoppingPrices(q)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-8">
          <p className="text-sm font-semibold text-primary mb-2">PetShopping</p>
          <h1 className="text-4xl font-bold text-foreground mb-2">Comparador de precios</h1>
          <p className="text-foreground/60 max-w-2xl">
            Busca productos para mascotas y compara precios guardados en Supabase desde tus procesos de scraping.
          </p>
        </section>

        <form className="mb-8 flex flex-col sm:flex-row gap-3" action="/petshopping">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar: comida perro, pedigree, gato, arena, collar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90">Buscar</Button>
        </form>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-foreground/60">
            {products.length} resultado{products.length === 1 ? '' : 's'} {q ? `para “${q}”` : 'disponibles'}
          </p>
          <p className="text-xs text-foreground/50">Ordenado por menor precio</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Package className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
            <h2 className="font-semibold text-foreground mb-1">No hay productos para mostrar</h2>
            <p className="text-foreground/60 text-sm">
              Verifica que la tabla <code className="text-xs bg-muted px-1 rounded">food_prices</code> tenga datos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const title = product.product_name || product.brand
              return (
                <article key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                  <ProductCardImage
                    imageUrl={product.image_url}
                    title={title}
                    category={product.category}
                    store={product.store}
                  />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h2 className="font-bold text-foreground leading-snug line-clamp-2">{title}</h2>
                      <p className="text-xl font-bold text-primary whitespace-nowrap">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-foreground/60 mb-5">
                      <p className="flex items-center gap-2">
                        <Store className="w-4 h-4" /> {product.store || 'Tienda no especificada'}
                      </p>
                      {(product.category || product.weight) && (
                        <p className="flex items-center gap-2">
                          <Tags className="w-4 h-4" /> {[product.category, product.weight].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {product.available && <p>{product.available}</p>}
                      <p className="text-xs text-foreground/50">Actualizado: {formatDate(product.last_scraped_at)}</p>
                    </div>

                    <div className="mt-auto">
                    {product.product_url ? (
                      <Link href={product.product_url} target="_blank" rel="noreferrer">
                        <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                          Ver en tienda <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Link no disponible
                      </Button>
                    )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
