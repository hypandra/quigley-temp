/**
 * Project Configuration
 *
 * This is the ONLY file you need to edit when setting up a new project.
 * The setup script (scripts/new-project.ts) will update this automatically.
 */

export const config = {
  // Project identity
  name: 'MyProject',           // Display name (shown in UI)
  slug: 'myproject',           // URL-safe name (used in package.json)
  prefix: 'cb',                // Database table prefix (2-3 chars)

  // Feature flags - set to true to enable
  features: {
    aiImages: false,           // AI image generation (gemini.ts + /api/images/generate)
    fileUploads: false,        // File uploads to BunnyCDN (bunny.ts + /api/uploads)
  },
}

// Build table names from prefix
export const tables = {
  user: `${config.prefix}_user`,
  session: `${config.prefix}_session`,
  account: `${config.prefix}_account`,
  verification: `${config.prefix}_verification`,
}

// Helper for other project-specific tables
export function table(name: string): string {
  return `${config.prefix}_${name}`
}
