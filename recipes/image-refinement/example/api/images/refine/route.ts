import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { auth } from '@/lib/auth'
import { config } from '@/lib/config'
import { uploadToBunny, generateImageFilename } from '@/lib/bunny'
import { refineImage } from '../../../../src/utils/image-generation'
import { generatePromptVariations } from '../../../../src/utils/variations'

function bunnyReady() {
  return (
    config.features.fileUploads &&
    process.env.BUNNY_STORAGE_ZONE &&
    process.env.BUNNY_STORAGE_API_KEY &&
    process.env.NEXT_PUBLIC_BUNNY_CDN_URL
  )
}

function bufferFromBase64(input: string): Buffer {
  if (input.startsWith('data:image/')) {
    const parts = input.split(',')
    return Buffer.from(parts[1] || '', 'base64')
  }
  return Buffer.from(input, 'base64')
}

export async function POST(request: NextRequest) {
  if (!config.features.aiImages) {
    return NextResponse.json({ error: 'AI image generation is not enabled' }, { status: 404 })
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image_url, image_base64, refinement_prompt } = await request.json()
  const trimmedPrompt = typeof refinement_prompt === 'string' ? refinement_prompt.trim() : ''

  if (!trimmedPrompt) {
    return NextResponse.json({ error: 'refinement_prompt is required' }, { status: 400 })
  }

  if (!image_url && !image_base64) {
    return NextResponse.json({ error: 'image_url or image_base64 is required' }, { status: 400 })
  }

  try {
    let imageBuffer: Buffer

    if (image_base64) {
      imageBuffer = bufferFromBase64(image_base64)
    } else {
      const imageResponse = await fetch(image_url)
      if (!imageResponse.ok) {
        const error = await imageResponse.text()
        return NextResponse.json(
          { error: `Failed to fetch source image: ${imageResponse.status} ${error}` },
          { status: 502 }
        )
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    }

    const variations = await generatePromptVariations(trimmedPrompt)
    if (variations.length === 0) {
      return NextResponse.json({ error: 'No prompt variations generated' }, { status: 500 })
    }

    const refinedBuffers = await Promise.all(
      variations.map((variation) => refineImage({ imageBuffer, prompt: variation }))
    )

    const useBunny = bunnyReady()
    const refinedImages = await Promise.all(
      refinedBuffers.map(async (buffer, index) => {
        const variation = variations[index]
        if (useBunny) {
          const filename = generateImageFilename(session.user.id)
          const url = await uploadToBunny(buffer, filename, 'image/png')
          return {
            id: randomUUID(),
            url,
            refinement_prompt: variation,
          }
        }

        const base64 = buffer.toString('base64')
        return {
          id: randomUUID(),
          url: `data:image/png;base64,${base64}`,
          refinement_prompt: variation,
        }
      })
    )

    return NextResponse.json({ images: refinedImages })
  } catch (error) {
    console.error('Image refinement error:', error)
    return NextResponse.json({ error: 'Failed to refine image' }, { status: 500 })
  }
}
