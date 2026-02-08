import { betterAuth } from "better-auth"
import { getPool } from "@/lib/postgres"
import { config, tables } from "@/lib/config"

// Lazy-initialized auth instance
let _auth: ReturnType<typeof betterAuth> | null = null

/**
 * Get the auth instance (lazy-initialized on first call).
 * Throws if DATABASE_URL is not configured.
 */
export function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: getPool() as any,
      emailAndPassword: {
        enabled: true,
      },
      // Table names from config
      user: {
        modelName: tables.user,
      },
      session: {
        modelName: tables.session,
        expiresIn: 60 * 60 * 24 * 7, // 7 days
      },
      account: {
        modelName: tables.account,
      },
      verification: {
        modelName: tables.verification,
      },
      // Add your production domains here
      trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        // `https://${config.slug}.vercel.app`,
        // `https://${config.slug}.com`,
      ],
    })
  }
  return _auth
}

// Re-export for routes that use auth.api.getSession() etc.
// This is a getter that defers to getAuth()
export const auth = {
  get api() {
    return getAuth().api
  },
  get handler() {
    return getAuth().handler
  },
}
