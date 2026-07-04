'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function WrongRoleBanner() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error') === 'wrong_role'

  if (!hasError) return null

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm text-red-700 dark:text-red-400">
          Esta acción requiere otro rol. Cierra sesión e inicia con la cuenta demo correspondiente.
        </p>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-red-700 dark:text-red-400 hover:underline whitespace-nowrap"
        >
          Cambiar cuenta →
        </Link>
      </div>
    </div>
  )
}
