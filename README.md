# Curiosity Build OSS Template

Standalone Next.js 16 starter that ships with auth, Supabase, and an opinionated migration guard. Works with Node LTS + npm; Bun is supported and recommended.

## What's Included

### Core (always)
- Next.js 16 + React 19 + TypeScript
- BetterAuth (email/password)
- Supabase PostgreSQL with SSL
- shadcn/ui components
- Tailwind CSS
- Migration guard with tests (`tools/migration-guard`)

### Optional Features
- **AI Images**: Gemini via OpenRouter (`/api/images/generate`)
- **File Uploads**: BunnyCDN storage (`/api/uploads`)

## Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup pages
│   ├── (app)/            # Authenticated pages (dashboard)
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn components
│   └── auth/             # Auth forms
└── lib/
    ├── config.ts         # Project config (edit this!)
    ├── auth.ts           # BetterAuth server
    ├── auth-client.ts    # BetterAuth client
    ├── postgres.ts       # DB connection
    ├── gemini.ts         # AI image generation
    └── bunny.ts          # File uploads
tools/
  migration-guard/        # SQL migration validator + tests
supabase/
  migrations/             # Local SQL migrations
```

## Configuration

All project settings are in `src/lib/config.ts`:

```typescript
export const config = {
  name: 'MyProject',      // Display name
  slug: 'myproject',      // URL-safe name
  prefix: 'cb',           // Database table prefix (required by guard)

  features: {
    aiImages: false,      // Enable AI image generation
    fileUploads: false,   // Enable BunnyCDN uploads
  },
}
```

## Quickstart (60 seconds)

```bash
git clone <repo-url> myproject && cd myproject
npm install
npm run dev
```

**That's it.** The app boots in limited mode — landing page works, auth routes return helpful errors.

To enable auth + dashboard:
1. Copy `.env.example` → `.env.local`
2. Set `DATABASE_URL` (Supabase connection string)
3. Set `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
4. Apply migrations: `cd supabase && supabase db push`

See `docs/QUICKSTART.md` for detailed setup with your own Supabase project.

## Migration Guard

Validates `supabase/migrations/*.sql` before they're applied:

- Enforces table prefix (default: `cb_`) and schema allowlist
- Blocks access to `auth`, `storage`, `realtime` schemas
- Supports tables, views, indexes, functions, types, policies, triggers
- Allows specific extensions (`pgcrypto`, `uuid-ossp`, `vector`)

```bash
npm run db:guard            # validate migrations
npm run db:guard -- --explain   # show offending statements
```

Config: `migration-guard.config.json` or env vars like `MIGRATION_GUARD_PREFIX`.
See `tools/migration-guard/README.md` for full docs.

## License

MIT
