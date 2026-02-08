/**
 * BunnyCDN File Storage
 *
 * Enable by setting config.features.fileUploads = true
 * Requires BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, NEXT_PUBLIC_BUNNY_CDN_URL env vars
 */

import { config } from './config'

export async function uploadToBunny(
  file: File | Buffer,
  filename: string,
  mimeType?: string
): Promise<string> {
  if (!config.features.fileUploads) {
    throw new Error('File uploads not enabled. Set config.features.fileUploads = true')
  }

  const storageZone = process.env.BUNNY_STORAGE_ZONE!
  const apiKey = process.env.BUNNY_STORAGE_API_KEY!
  const endpoint = process.env.BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com'
  const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL!

  if (!storageZone || !apiKey || !cdnUrl) {
    throw new Error('Missing Bunny environment variables')
  }

  const url = `${endpoint}/${storageZone}/${filename}`

  const contentType = mimeType || (file instanceof File ? file.type : 'application/octet-stream')
  let body: BodyInit

  if (file instanceof File) {
    body = file
  } else {
    // Convert Buffer to ArrayBuffer for Blob compatibility
    const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
    body = new Blob([arrayBuffer], { type: contentType })
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: apiKey,
      'Content-Type': contentType,
    },
    body,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`BunnyCDN upload failed: ${response.status} ${error}`)
  }

  return `${cdnUrl}/${filename}`
}

export function generateFilename(prefix: string, originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}/${timestamp}-${random}.${ext}`
}

export function generateImageFilename(userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `images/${userId}/${timestamp}-${random}.png`
}
