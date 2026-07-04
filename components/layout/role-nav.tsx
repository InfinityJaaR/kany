'use client'

import Link from 'next/link'
import { useProfile } from '@/lib/auth/use-profile'
import { getThirdModule } from '@/lib/modules'
import { USER_TYPE_LABELS } from '@/types/auth'

export function RoleNav() {
  const { loading, userType, isLoggedIn } = useProfile()
  const third = getThirdModule()

  if (loading) {
    return (
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <span className="text-foreground/40">…</span>
      </nav>
    )
  }

  return (
    <nav className="hidden md:flex items-center gap-4 text-sm">
      <Link href="/perdidas" className="text-foreground/60 hover:text-foreground transition">
        Perdidas
      </Link>
      {isLoggedIn && userType === 'person' && (
        <>
          <Link href="/encontradas" className="text-foreground/60 hover:text-foreground transition">
            Encontradas
          </Link>
          <Link href="/reportar" className="text-foreground/60 hover:text-foreground transition">
            Reportar
          </Link>
        </>
      )}
      <Link href="/donaciones" className="text-foreground/60 hover:text-foreground transition">
        Donaciones
      </Link>
      {third === 'vets' && (
        <Link href="/veterinarias" className="text-foreground/60 hover:text-foreground transition">
          Veterinarias
        </Link>
      )}
      {userType === 'foundation' && (
        <Link href="/donaciones/nueva" className="text-primary font-medium hover:underline transition">
          Crear campaña
        </Link>
      )}
      {userType === 'vet' && (
        <Link href="/veterinarias/registrar" className="text-primary font-medium hover:underline transition">
          Mi clínica
        </Link>
      )}
    </nav>
  )
}

export function RoleBadge() {
  const { loading, userType, isLoggedIn } = useProfile()

  if (loading || !isLoggedIn || !userType) return null

  return (
    <span className="hidden lg:inline text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
      {USER_TYPE_LABELS[userType]}
    </span>
  )
}
