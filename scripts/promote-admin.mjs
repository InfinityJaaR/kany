/**
 * Promotes users to platform admin via auth.users.app_metadata.role = 'admin'.
 * Requires SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAILS in .env.local
 *
 * Usage: pnpm promote:admin
 * Example: ADMIN_EMAILS=admin@kany.sv,otro@example.com
 *
 * After promotion, the user must sign out and sign in again for the JWT to refresh.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

async function findUserByEmail(admin, email) {
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (match) return match

    if (data.users.length < perPage) return null
    page += 1
  }
}

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const emailsRaw = process.env.ADMIN_EMAILS

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  if (!emailsRaw?.trim()) {
    console.error('Missing ADMIN_EMAILS in .env.local (comma-separated list of admin emails)')
    process.exit(1)
  }

  const emails = emailsRaw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (emails.length === 0) {
    console.error('ADMIN_EMAILS is empty')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  for (const email of emails) {
    const user = await findUserByEmail(admin, email)

    if (!user) {
      console.warn(`User not found (register first): ${email}`)
      continue
    }

    const existingRole = user.app_metadata?.role
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, role: 'admin' },
    })

    if (error) {
      console.error(`Failed to promote ${email}:`, error.message)
      process.exit(1)
    }

    console.log(`Promoted to admin: ${email}${existingRole === 'admin' ? ' (already admin)' : ''}`)
  }

  console.log('\nDone. Affected users must sign out and sign in again to refresh their session.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
