# Migration Guard

Validates SQL migrations in `supabase/migrations/` for prefix safety and schema isolation.

## Goals

- Ensure all schema objects use the required prefix (default `cb_`)
- Block access to restricted schemas (default: `auth`, `storage`, `realtime`, `extensions`)
- Fail closed on unrecognized DDL (“block if uncertain”)

## Usage

```bash
npm run db:guard
```

```bash
node tools/migration-guard/guard.mjs --dir supabase/migrations --explain
```

## Configuration

Default config is in `migration-guard.config.json`:

```json
{
  "requiredPrefix": "cb_",
  "allowedSchemas": ["public"],
  "blockedSchemas": ["auth", "storage", "realtime", "extensions"],
  "allowedExtensions": ["pgcrypto", "uuid-ossp", "vector"]
}
```

Environment overrides:

- `MIGRATION_GUARD_PREFIX` (string)
- `MIGRATION_GUARD_ALLOWED_SCHEMAS` (comma-separated)
- `MIGRATION_GUARD_BLOCKED_SCHEMAS` (comma-separated)
- `MIGRATION_GUARD_ALLOWED_EXTENSIONS` (comma-separated)

## Supported statements

- `CREATE/ALTER/DROP TABLE`
- `CREATE/ALTER/DROP VIEW`
- `CREATE/DROP INDEX`
- `CREATE/ALTER/DROP SEQUENCE`
- `CREATE/ALTER/DROP FUNCTION`
- `CREATE/ALTER/DROP TYPE`
- `CREATE TRIGGER`
- `DROP TRIGGER ... ON ...`
- `CREATE/ALTER/DROP POLICY`
- `COMMENT ON ...` (table, view, type, sequence, index, trigger, column, function)
- `CREATE EXTENSION IF NOT EXISTS ...` (allowlist only)

## Policy notes

- GRANT/REVOKE are blocked explicitly.
- Any unknown DDL statement is blocked by default.
- All referenced tables (including foreign keys) must be prefixed.
