const CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL

/**
 * Returns a Bunny Optimizer URL for a portrait at the given pixel size,
 * or falls back to the local path if CDN is not configured.
 */
export function portraitUrl(path: string, size: number): string {
  if (!CDN_URL || !path) return path
  // path is like "/portraits/ancient-egypt-nefertari.png"
  const filename = path.startsWith('/') ? path.slice(1) : path
  return `${CDN_URL}/${filename}?width=${size}&quality=80`
}
