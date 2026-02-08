# Quickstart (Standalone)

This template runs on your own Supabase project with no external CB infrastructure. Node LTS + npm are first-class; Bun is supported.

## 1) Install dependencies

Choose one:

```bash
npm install
```

```bash
bun install
```

## 2) Create a Supabase project

- Create a new project in Supabase.
- Copy the **connection string (Session mode pooler)** from Settings → Database.

## 3) Configure environment variables

```bash
cp .env.example .env.local
```

Set these required values in `.env.local`:

- `DATABASE_URL` (your Supabase pooler URL)
- `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_BETTER_AUTH_URL` (e.g. `http://localhost:3000`)

## 4) Apply migrations

The template includes an initial migration in `supabase/migrations/`.

Pick one path:

### Option A: Supabase CLI (recommended)

```bash
supabase init
supabase link --project-ref <your-project-ref>
supabase db push
```

### Option B: Supabase SQL editor

Open the SQL editor in the Supabase dashboard and run the SQL from the latest file in `supabase/migrations/`.

## 5) Run the app

```bash
npm run dev
```

or

```bash
bun dev
```

Open `http://localhost:3000`.

## 6) Validate migrations (optional but recommended)

```bash
npm run db:guard
```

## Optional providers

- **OpenRouter**: set `OPENROUTER_API_KEY` to enable AI image generation
- **BunnyCDN**: set `BUNNY_*` values to enable file uploads

If optional provider env vars are missing while features are enabled, the API returns `501` with a helpful error.
