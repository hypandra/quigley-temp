# AGENTS.md

Guidance for AI agents working in this repo.

## Core rules

- This repo is standalone; do not assume any shared Curiosity Builds infrastructure.
- Default table prefix is `cb_` (configurable). All schema objects should use the prefix.
- Migrations live in `supabase/migrations/` and must pass the migration guard.
- Dynamic route params in Next.js 16 are Promises; `await params` in server components.

## Migration guard

Run `npm run db:guard` (or `bun run db:guard`) to validate SQL migrations.

## Auth & DB

- BetterAuth is the only auth system.
- All database access should filter by `user_id` from the session.
