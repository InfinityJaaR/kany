import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { AuthButton } from '@/components/layout/auth-button'
import { getThirdModule } from '@/lib/modules'

export function SiteHeader() {
  const third = getThirdModule()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Kany</h1>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/perdidas" className="text-foreground/60 hover:text-foreground transition">
              Perdidas
            </Link>
            <Link href="/donaciones" className="text-foreground/60 hover:text-foreground transition">
              Donaciones
            </Link>
            {third === 'prices' && (
              <Link href="/precios" className="text-foreground/60 hover:text-foreground transition">
                Precios
              </Link>
            )}
            {third === 'vets' && (
              <Link href="/veterinarias" className="text-foreground/60 hover:text-foreground transition">
                Veterinarias
              </Link>
            )}
          </nav>
          <AuthButton />
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
