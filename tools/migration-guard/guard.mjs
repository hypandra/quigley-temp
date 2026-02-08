import fs from 'fs/promises'
import path from 'path'

function parseArgs(argv) {
  const args = { dir: null, config: null, explain: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dir') {
      args.dir = argv[i + 1]
      i += 1
    } else if (arg === '--config') {
      args.config = argv[i + 1]
      i += 1
    } else if (arg === '--explain') {
      args.explain = true
    }
  }
  return args
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function normalizeList(value) {
  if (!value) return null
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

async function loadConfig(configPath) {
  const resolved = configPath
    ? path.resolve(process.cwd(), configPath)
    : path.resolve(process.cwd(), 'migration-guard.config.json')

  const config = await readJson(resolved)

  const envPrefix = process.env.MIGRATION_GUARD_PREFIX
  const envAllowed = normalizeList(process.env.MIGRATION_GUARD_ALLOWED_SCHEMAS)
  const envBlocked = normalizeList(process.env.MIGRATION_GUARD_BLOCKED_SCHEMAS)

  return {
    requiredPrefix: (envPrefix || config.requiredPrefix || '').toLowerCase(),
    allowedSchemas: (envAllowed || config.allowedSchemas || ['public']).map((s) => s.toLowerCase()),
    blockedSchemas: (envBlocked || config.blockedSchemas || []).map((s) => s.toLowerCase()),
    allowedExtensions: normalizeList(process.env.MIGRATION_GUARD_ALLOWED_EXTENSIONS)
      || (config.allowedExtensions || []).map((s) => s.toLowerCase()),
    configPath: resolved,
  }
}

function normalizeSql(sql) {
  let out = ''
  let i = 0
  const len = sql.length
  let inLineComment = false
  let inBlockComment = false
  let inSingleQuote = false
  let inDoubleQuote = false
  let dollarTag = null

  while (i < len) {
    const ch = sql[i]
    const next = sql[i + 1]

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
        out += '\n'
      }
      i += 1
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i += 2
        continue
      }
      i += 1
      continue
    }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        const tagLength = dollarTag.length
        dollarTag = null
        i += tagLength
        out += ' '
        continue
      }
      i += 1
      continue
    }

    if (inSingleQuote) {
      if (ch === "'" && next === "'") {
        i += 2
        continue
      }
      if (ch === "'") {
        inSingleQuote = false
        i += 1
        out += ' '
        continue
      }
      i += 1
      continue
    }

    if (inDoubleQuote) {
      if (ch === '"' && next === '"') {
        out += '"'
        i += 2
        continue
      }
      if (ch === '"') {
        inDoubleQuote = false
        i += 1
        continue
      }
      out += ch
      i += 1
      continue
    }

    if (ch === '-' && next === '-') {
      inLineComment = true
      i += 2
      continue
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true
      i += 2
      continue
    }

    if (ch === "'") {
      inSingleQuote = true
      i += 1
      continue
    }

    if (ch === '"') {
      inDoubleQuote = true
      i += 1
      continue
    }

    if (ch === '$') {
      const match = sql.slice(i).match(/^\$[a-zA-Z0-9_]*\$/)
      if (match) {
        dollarTag = match[0]
        i += dollarTag.length
        out += ' '
        continue
      }
    }

    out += ch
    i += 1
  }

  return out.toLowerCase()
}

function splitStatements(sql) {
  return sql
    .split(';')
    .map((stmt) => stmt.trim())
    .filter(Boolean)
}

function parseQualifiedName(name) {
  const parts = name.split('.')
  if (parts.length === 1) {
    return { schema: null, name: parts[0] }
  }
  if (parts.length === 2) {
    return { schema: parts[0], name: parts[1] }
  }
  return { schema: null, name: null, invalid: true }
}

function validateSchema(schema, rules) {
  if (!schema) return null
  if (rules.allowedSchemas.includes(schema)) return null
  if (rules.blockedSchemas.includes(schema)) {
    return `Blocked schema reference: ${schema}`
  }
  return `Schema not allowlisted: ${schema}`
}

function requirePrefix(name, rules, context) {
  if (!rules.requiredPrefix) return null
  if (!name || !name.startsWith(rules.requiredPrefix)) {
    return `Missing required prefix for ${context}: ${name || '<unknown>'}`
  }
  return null
}

function validateQualifiedName(rawName, rules, context) {
  const parsed = parseQualifiedName(rawName)
  if (parsed.invalid || !parsed.name) {
    return [`Unrecognized ${context} name: ${rawName}`]
  }
  const errors = []
  const schemaError = validateSchema(parsed.schema, rules)
  if (schemaError) errors.push(schemaError)
  const prefixError = requirePrefix(parsed.name, rules, context)
  if (prefixError) errors.push(prefixError)
  return errors
}

function validateStatement(stmt, rules) {
  const errors = []

  const schemaRegex = /\b([a-z_][a-z0-9_]*)\s*\.\s*([a-z_][a-z0-9_]*)\b/g
  let match
  while ((match = schemaRegex.exec(stmt)) !== null) {
    const schema = match[1]
    const schemaError = validateSchema(schema, rules)
    if (schemaError) {
      errors.push(schemaError)
    }
  }

  const ddlStart = stmt.match(/^(create|alter|drop|truncate|grant|revoke|comment)\b/)
  if (!ddlStart) {
    return errors
  }

  let matched = false

  const patterns = [
    {
      name: 'table',
      regex: /^(create|alter|drop)\s+table\s+(if\s+not\s+exists\s+|if\s+exists\s+)?([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[3], rules, 'table'),
    },
    {
      name: 'drop-trigger',
      regex: /^drop\s+trigger\s+(if\s+exists\s+)?([a-z0-9_.]+)\s+on\s+([a-z0-9_.]+)/,
      handle: (m) => [
        ...validateQualifiedName(m[2], rules, 'trigger'),
        ...validateQualifiedName(m[3], rules, 'table'),
      ],
    },
    {
      name: 'view',
      regex: /^(create|alter|drop)\s+(materialized\s+)?view\s+(if\s+not\s+exists\s+|if\s+exists\s+)?([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[4], rules, 'view'),
    },
    {
      name: 'index',
      regex: /^create\s+(unique\s+)?index\s+(concurrently\s+)?(if\s+not\s+exists\s+)?([a-z0-9_.]+)\s+on\s+([a-z0-9_.]+)/,
      handle: (m) => [
        ...validateQualifiedName(m[4], rules, 'index'),
        ...validateQualifiedName(m[5], rules, 'table'),
      ],
    },
    {
      name: 'index-drop',
      regex: /^drop\s+index\s+(if\s+exists\s+)?([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[2], rules, 'index'),
    },
    {
      name: 'sequence',
      regex: /^(create|alter|drop)\s+sequence\s+(if\s+not\s+exists\s+|if\s+exists\s+)?([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[3], rules, 'sequence'),
    },
    {
      name: 'function',
      regex: /^(create|alter|drop)\s+function\s+([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[2], rules, 'function'),
    },
    {
      name: 'type',
      regex: /^(create|alter|drop)\s+type\s+([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[2], rules, 'type'),
    },
    {
      name: 'trigger',
      regex: /^create\s+trigger\s+([a-z0-9_.]+).*\bon\s+([a-z0-9_.]+)/,
      handle: (m) => [
        ...validateQualifiedName(m[1], rules, 'trigger'),
        ...validateQualifiedName(m[2], rules, 'table'),
      ],
    },
    {
      name: 'comment-on-object',
      regex: /^comment\s+on\s+(table|view|type|sequence|index|trigger)\s+([a-z0-9_.]+)/,
      handle: (m) => validateQualifiedName(m[2], rules, m[1]),
    },
    {
      name: 'create-extension',
      regex: /^create\s+extension\s+(if\s+not\s+exists\s+)?\"?([a-z0-9_-]+)\"?/,
      handle: (m) => {
        const extension = m[2]
        if (!rules.allowedExtensions || rules.allowedExtensions.length === 0) {
          return ['CREATE EXTENSION is not supported by migration guard (no allowlist configured).']
        }
        if (!rules.allowedExtensions.includes(extension)) {
          return [`Extension not allowed by migration guard: ${extension}`]
        }
        return []
      },
    },
    {
      name: 'comment-on-column',
      regex: /^comment\s+on\s+column\s+([a-z0-9_.]+)\s*\.\s*([a-z0-9_]+)/,
      handle: (m) => validateQualifiedName(m[1], rules, 'column'),
    },
    {
      name: 'comment-on-function',
      regex: /^comment\s+on\s+function\s+([a-z0-9_.]+)\s*\(/,
      handle: (m) => validateQualifiedName(m[1], rules, 'function'),
    },
    {
      name: 'grant-revoke',
      regex: /^(grant|revoke)\b/,
      handle: () => ['GRANT/REVOKE is not supported by migration guard (blocked by policy).'],
    },
    {
      name: 'policy',
      regex: /^(create|alter|drop)\s+policy\s+([a-z0-9_.]+).*\bon\s+([a-z0-9_.]+)/,
      handle: (m) => [
        ...validateQualifiedName(m[2], rules, 'policy'),
        ...validateQualifiedName(m[3], rules, 'table'),
      ],
    },
  ]

  for (const pattern of patterns) {
    const m = stmt.match(pattern.regex)
    if (m) {
      matched = true
      errors.push(...pattern.handle(m))
      break
    }
  }

  const referenceRegex = /\breferences\s+([a-z0-9_.]+)/g
  while ((match = referenceRegex.exec(stmt)) !== null) {
    errors.push(...validateQualifiedName(match[1], rules, 'foreign key'))
  }

  if (!matched) {
    errors.push('Unrecognized DDL statement (blocked by default)')
  }

  return errors
}

async function listSqlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listSqlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.sql')) {
      files.push(fullPath)
    }
  }
  return files.sort()
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const configPath = args.config || process.env.MIGRATION_GUARD_CONFIG || null
  const rules = await loadConfig(configPath)

  if (!rules.requiredPrefix) {
    console.error('migration-guard: requiredPrefix is missing (set in config or MIGRATION_GUARD_PREFIX)')
    process.exit(2)
  }

  const dir = path.resolve(process.cwd(), args.dir || 'supabase/migrations')
  let files
  try {
    files = await listSqlFiles(dir)
  } catch (error) {
    console.error(`migration-guard: migrations directory not found: ${dir}`)
    process.exit(2)
  }

  if (files.length === 0) {
    console.error(`migration-guard: no .sql files found in ${dir}`)
    process.exit(2)
  }

  const violations = []

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const normalized = normalizeSql(raw)
    const statements = splitStatements(normalized)

    for (const stmt of statements) {
      const stmtErrors = validateStatement(stmt, rules)
      for (const err of stmtErrors) {
        violations.push({ file, error: err, statement: stmt })
      }
    }
  }

  if (violations.length > 0) {
    console.error(`migration-guard: failed (${violations.length} issue${violations.length === 1 ? '' : 's'})`)
    for (const violation of violations) {
      console.error(`- ${violation.file}: ${violation.error}`)
      if (args.explain) {
        console.error(`  statement: ${violation.statement}`)
      }
    }
    process.exit(1)
  }

  console.log(`migration-guard: OK (${files.length} file${files.length === 1 ? '' : 's'})`)
}

run().catch((error) => {
  console.error('migration-guard: unexpected error', error)
  process.exit(2)
})
