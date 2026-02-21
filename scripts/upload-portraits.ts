/**
 * Upload all portrait PNGs from public/portraits/ to BunnyCDN storage.
 *
 * Usage:
 *   bun scripts/upload-portraits.ts             # Upload all (skip existing)
 *   bun scripts/upload-portraits.ts --force      # Re-upload all
 *   bun scripts/upload-portraits.ts --dry-run    # Preview only
 */

import { readdirSync, readFileSync, existsSync } from 'fs'
import { resolve, basename } from 'path'

const PORTRAITS_DIR = resolve(import.meta.dir, '../public/portraits')

function getEnv(key: string): string {
  const envPath = resolve(import.meta.dir, '../.env.local')
  if (!existsSync(envPath)) throw new Error('Missing .env.local')
  const env = readFileSync(envPath, 'utf-8')
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
  if (!match) throw new Error(`${key} not found in .env.local`)
  return match[1].trim()
}

async function fileExistsOnCDN(cdnUrl: string, path: string): Promise<boolean> {
  // HEAD returns 401 on Bunny — use GET per QUIRKS.md
  try {
    const res = await fetch(`${cdnUrl}/${path}`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

function getEnvOptional(key: string): string | undefined {
  const envPath = resolve(import.meta.dir, '../.env.local')
  if (!existsSync(envPath)) return undefined
  const env = readFileSync(envPath, 'utf-8')
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : undefined
}

async function uploadFile(
  endpoint: string,
  storageZone: string,
  apiKey: string,
  remotePath: string,
  data: Buffer,
): Promise<void> {
  const url = `${endpoint}/${storageZone}/${remotePath}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'image/png',
    },
    body: data,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload failed (${res.status}): ${err}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const dryRun = args.includes('--dry-run')

  const storageZone = getEnv('BUNNY_STORAGE_ZONE')
  const apiKey = getEnv('BUNNY_STORAGE_API_KEY')
  const endpoint = getEnvOptional('BUNNY_STORAGE_ENDPOINT') || 'https://storage.bunnycdn.com'
  const cdnUrl = getEnv('NEXT_PUBLIC_BUNNY_CDN_URL')

  const files = readdirSync(PORTRAITS_DIR).filter(f => f.endsWith('.png')).sort()
  console.log(`Found ${files.length} portraits in public/portraits/\n`)

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const file of files) {
    const remotePath = `portraits/${file}`

    if (!force) {
      const exists = await fileExistsOnCDN(cdnUrl, remotePath)
      if (exists) {
        console.log(`  [skip] ${file} (already on CDN)`)
        skipped++
        continue
      }
    }

    if (dryRun) {
      console.log(`  [dry]  ${file} → ${remotePath}`)
      uploaded++
      continue
    }

    try {
      const data = readFileSync(resolve(PORTRAITS_DIR, file))
      process.stdout.write(`  [up]   ${file} (${(data.length / 1024).toFixed(0)} KB)...`)
      await uploadFile(endpoint, storageZone, apiKey, remotePath, data)
      console.log(' ✓')
      uploaded++
    } catch (err: any) {
      console.log(` ✗ ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`)
  if (dryRun) console.log('(dry run — nothing was actually uploaded)')
}

main()
