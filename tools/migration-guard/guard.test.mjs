import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const guardPath = path.join(rootDir, 'tools', 'migration-guard', 'guard.mjs')
const allowedDir = path.join(rootDir, 'tools', 'migration-guard', 'fixtures', 'allowed')
const blockedDir = path.join(rootDir, 'tools', 'migration-guard', 'fixtures', 'blocked')

function runGuard(dir) {
  const result = spawnSync(process.execPath, [guardPath, '--dir', dir], {
    env: {
      ...process.env,
      MIGRATION_GUARD_CONFIG: path.join(rootDir, 'migration-guard.config.json'),
    },
    encoding: 'utf8',
  })

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  }
}

test('migration guard passes allowed fixtures', () => {
  const result = runGuard(allowedDir)
  assert.equal(result.status, 0, result.stderr || result.stdout)
})

test('migration guard blocks disallowed fixtures', () => {
  const result = runGuard(blockedDir)
  assert.equal(result.status, 1, 'expected non-zero exit code for blocked fixtures')
})
