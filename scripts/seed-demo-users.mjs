/**
 * Creates 3 demo accounts for hackathon jury testing.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage: pnpm seed:demo
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const DEMO_PASSWORD = 'DemoKany2026!'

const DEMO_USERS = [
  {
    email: 'demo.usuario@kany.sv',
    fullName: 'Demo Usuario',
    userType: 'person',
  },
  {
    email: 'demo.fundacion@kany.sv',
    fullName: 'Demo Fundación',
    userType: 'foundation',
  },
  {
    email: 'demo.vet@kany.sv',
    fullName: 'Demo Veterinaria',
    userType: 'vet',
  },
]

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

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const userIds = {}

  for (const demo of DEMO_USERS) {
    const { data: existingList } = await admin.auth.admin.listUsers()
    const existing = existingList?.users.find((u) => u.email === demo.email)

    let userId

    if (existing) {
      userId = existing.id
      await admin.auth.admin.updateUserById(userId, {
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: demo.fullName,
          user_type: demo.userType,
          onboarding_completed: true,
        },
      })
      console.log(`Updated demo user: ${demo.email}`)
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: demo.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: demo.fullName,
          user_type: demo.userType,
          onboarding_completed: true,
        },
      })

      if (error || !data.user) {
        console.error(`Failed to create ${demo.email}:`, error?.message)
        process.exit(1)
      }

      userId = data.user.id
      console.log(`Created demo user: ${demo.email}`)
    }

    userIds[demo.userType] = userId

    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      email: demo.email,
      full_name: demo.fullName,
      user_type: demo.userType,
      onboarding_completed: true,
      home_location_label: 'San Salvador, El Salvador',
      home_department: 'San Salvador',
      home_municipality: 'San Salvador',
      home_latitude: 13.6929,
      home_longitude: -89.2182,
      notification_radius_m: 5000,
      notify_nearby_lost_pets: true,
    })

    if (profileError) {
      console.error(`Profile update failed for ${demo.email}:`, profileError.message)
      process.exit(1)
    }
  }

  const foundationId = userIds.foundation
  if (foundationId) {
    const { error: campaignError } = await admin
      .from('campaigns')
      .update({ creator_id: foundationId })
      .is('creator_id', null)

    if (campaignError) {
      console.warn('Could not link campaigns:', campaignError.message)
    } else {
      console.log('Linked demo campaigns to foundation user')
    }
  }

  const vetId = userIds.vet
  if (vetId) {
    const { data: existingVet } = await admin
      .from('vets')
      .select('id')
      .eq('owner_id', vetId)
      .maybeSingle()

    if (!existingVet) {
      const { error: vetError } = await admin.from('vets').insert({
        name: 'Clínica Demo Kany',
        services: 'Consulta, vacunas, emergencias',
        location: 'San Salvador',
        city: 'San Salvador',
        address: 'Colonia Escalón, San Salvador',
        phone: '+503 2222-0000',
        hours: 'Lun-Sáb 8:00-18:00',
        promo: 'Cuenta demo para jurado del hackathon',
        latitude: 13.6929,
        longitude: -89.2182,
        owner_id: vetId,
      })

      if (vetError) {
        console.warn('Could not insert demo vet clinic:', vetError.message)
      } else {
        console.log('Inserted demo vet clinic')
      }
    } else {
      console.log('Demo vet clinic already exists')
    }
  }

  console.log('\nDemo accounts ready:')
  console.log('  Password for all:', DEMO_PASSWORD)
  for (const demo of DEMO_USERS) {
    console.log(`  ${demo.email} (${demo.userType})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
