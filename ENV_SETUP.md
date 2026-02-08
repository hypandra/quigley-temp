# Environment Setup Guide

This guide covers the minimal environment variables to run the template standalone.

## Quick Start

```bash
cp .env.example .env.local
```

Then fill in the required values.

---

## 1. Database (Required)

### Get Supabase Connection String

1. Create a Supabase project
2. Go to **Settings** → **Database**
3. Copy the **Connection string** (URI format, Session mode pooler)

Example:
```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### SSL Certificate (Production)

For production, provide the Supabase CA cert.

**Option A: Environment variable (recommended)**
```bash
# Generate base64 cert
base64 -i supabase-ca.crt | tr -d '\n'

# Set env var
SUPABASE_CA_CERT=<base64-output>
```

**Option B: File (local/hosting environments)**
- Place the cert file at `supabase-ca.crt` in the project root

---

## 2. Authentication (Required)

### Generate Secret

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```bash
BETTER_AUTH_SECRET="<generated-secret>"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

Before deploying, add your production domain to `trustedOrigins` in `src/lib/auth.ts`.

---

## 3. BunnyCDN (Optional file uploads)

Add to `.env.local` only if you enable `config.features.fileUploads`:

```bash
BUNNY_STORAGE_ZONE="yourproject"
BUNNY_STORAGE_API_KEY="your-api-key"
BUNNY_STORAGE_ENDPOINT="https://storage.bunnycdn.com"
NEXT_PUBLIC_BUNNY_CDN_URL="https://yourproject.b-cdn.net"
```

---

## 4. OpenRouter (Optional AI images)

Add to `.env.local` only if you enable `config.features.aiImages`:

```bash
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_SITE_URL="http://localhost:3000"
OPENROUTER_APP_NAME="MyProject"
```

---

## Troubleshooting

### "SSL certificate required"
- Ensure `SUPABASE_CA_CERT` is set, or
- Place `supabase-ca.crt` at the project root

### "Unauthorized" or auth redirects failing
- Confirm `NEXT_PUBLIC_BETTER_AUTH_URL` matches your actual URL
- Ensure your production domain is in `trustedOrigins`
