/**
 * AI Image Generation API
 *
 * Only works when config.features.aiImages = true
 * Requires: OPENROUTER_API_KEY, BUNNY_* env vars
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { config } from '@/lib/config'
import { generateImage } from '@/lib/gemini'
import { uploadToBunny, generateImageFilename } from '@/lib/bunny'

export async function POST(request: NextRequest) {
  // Check if feature is enabled
  if (!config.features.aiImages) {
    return NextResponse.json(
      { error: 'AI image generation is not enabled' },
      { status: 404 }
    )
  }

  const missing = [
    ['OPENROUTER_API_KEY', process.env.OPENROUTER_API_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (config.features.fileUploads) {
    missing.push(
      ...[
        ['BUNNY_STORAGE_ZONE', process.env.BUNNY_STORAGE_ZONE],
        ['BUNNY_STORAGE_API_KEY', process.env.BUNNY_STORAGE_API_KEY],
        ['NEXT_PUBLIC_BUNNY_CDN_URL', process.env.NEXT_PUBLIC_BUNNY_CDN_URL],
      ]
        .filter(([, value]) => !value)
        .map(([key]) => key)
    )
  }

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: 'AI image generation is enabled but required environment variables are missing.',
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

  const { prompt } = await request.json()

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  try {
    // Generate image
    const imageBuffer = await generateImage(prompt)

    // Upload to Bunny (if file uploads enabled)
    if (config.features.fileUploads) {
      const filename = generateImageFilename(session.user.id)
      const url = await uploadToBunny(imageBuffer, filename, 'image/png')
      return NextResponse.json({ url })
    }

    // Return base64 if no file storage
    const base64 = imageBuffer.toString('base64')
    return NextResponse.json({
      data: `data:image/png;base64,${base64}`
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
