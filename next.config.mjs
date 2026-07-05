import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}

  const result = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const index = trimmed.indexOf('=')
    if (index === -1) continue

    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}

const root = process.cwd()
const fileEnv = {
  ...parseEnvFile(join(root, '.env')),
  ...parseEnvFile(join(root, '.env.development')),
  ...parseEnvFile(join(root, '.env.local')),
  ...parseEnvFile(join(root, '.env.development.local')),
}

const supabaseUrl = fileEnv.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack edge middleware does not always receive .env values at runtime.
  // Inlining them here makes process.env.* available in middleware.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_URL: fileEnv.SUPABASE_URL ?? supabaseUrl,
    SUPABASE_ANON_KEY: fileEnv.SUPABASE_ANON_KEY ?? supabaseAnonKey,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
