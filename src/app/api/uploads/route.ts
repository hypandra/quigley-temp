/**
 * File Upload API
 *
 * Only works when config.features.fileUploads = true
 * Requires: BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, NEXT_PUBLIC_BUNNY_CDN_URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { config } from '@/lib/config'
import { uploadToBunny, generateFilename } from '@/lib/bunny'

export async function POST(request: NextRequest) {
  // Check if feature is enabled
  if (!config.features.fileUploads) {
    return NextResponse.json(
      { error: 'File uploads are not enabled' },
      { status: 404 }
    )
  }

  const missing = [
    ['BUNNY_STORAGE_ZONE', process.env.BUNNY_STORAGE_ZONE],
    ['BUNNY_STORAGE_API_KEY', process.env.BUNNY_STORAGE_API_KEY],
    ['NEXT_PUBLIC_BUNNY_CDN_URL', process.env.NEXT_PUBLIC_BUNNY_CDN_URL],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: 'File uploads are enabled but required environment variables are missing.',
        missing,
      },
      { status: 501 }
    )
  }

  // Auth check
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file size (5MB default)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  try {
    const filename = generateFilename(`uploads/${session.user.id}`, file.name)
    const url = await uploadToBunny(file, filename)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
