import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'
import { SiteHeader } from '@/components/layout/site-header'
import { AdminNavCurrent } from '@/components/admin/admin-nav-current'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground/50">Moderación</p>
            <h1 className="text-3xl font-bold text-foreground">Panel de administración</h1>
          </div>
          <Link
            href="/"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
        <AdminNavCurrent />
        {children}
      </div>
    </div>
  )
}
