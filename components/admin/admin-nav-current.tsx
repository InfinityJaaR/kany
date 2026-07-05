'use client'

import { usePathname } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'

export function AdminNavCurrent() {
  const pathname = usePathname()
  return <AdminNav pathname={pathname} />
}
