import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

function getSslConfig() {
  const databaseUrl = process.env.DATABASE_URL || ''

  // Auto-detect local development
  const disableSsl =
    process.env.DATABASE_SSL === 'disable' ||
    process.env.DATABASE_SSL === 'false' ||
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1')

  if (disableSsl) {
    return false
  }

  // Production: Read cert from env var or file
  if (process.env.SUPABASE_CA_CERT) {
    return {
      ca: Buffer.from(process.env.SUPABASE_CA_CERT, 'base64').toString(),
      rejectUnauthorized: true,
    }
  }

  // Check common cert filenames
  const certPaths = [
    path.join(process.cwd(), 'supabase-ca.crt'),
    path.join(process.cwd(), 'prod-ca-2021.crt'),
  ]

  for (const certPath of certPaths) {
    if (fs.existsSync(certPath)) {
      return {
        ca: fs.readFileSync(certPath).toString(),
        rejectUnauthorized: true,
      }
    }
  }

  // NEVER fall back to rejectUnauthorized: false in production
  throw new Error('SSL cert required for production. Set SUPABASE_CA_CERT env var or add supabase-ca.crt (or prod-ca-2021.crt)')
}

// Lazy-initialized pool singleton
let _pool: Pool | null = null

export function getPool(): Pool {
  if (_pool) return _pool

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. See ENV_SETUP.md for configuration instructions.'
    )
  }

  _pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: getSslConfig(),
  })

  return _pool
}

/** @deprecated Use getPool() instead */
export function createPgPool() {
  return getPool()
}
