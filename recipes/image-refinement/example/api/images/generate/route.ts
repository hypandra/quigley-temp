import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { config } from '@/lib/config'
import { uploadToBunny, generateImageFilename } from '@/lib/bunny'
import { generateImage, renderPromptTemplate } from '../../../../src/utils/image-generation'

function bunnyReady() {
  return (
    config.features.fileUploads &&
    process.env.BUNNY_STORAGE_ZONE &&
    process.env.BUNNY_STORAGE_API_KEY &&
    process.env.NEXT_PUBLIC_BUNNY_CDN_URL
  )
}

export async function POST(request: NextRequest) {
  if (!config.features.aiImages) {
    return NextResponse.json({ error: 'AI image generation is not enabled' }, { status: 404 })
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { prompt, source_text, prompt_template } = await request.json()

  let finalPrompt: string | undefined = prompt
  if (!finalPrompt && source_text && prompt_template) {
    finalPrompt = renderPromptTemplate(prompt_template, source_text)
  }

  if (!finalPrompt) {
    return NextResponse.json({ error: 'prompt or prompt_template + source_text is required' }, { status: 400 })
  }

  try {
    const imageBuffer = await generateImage({ prompt: finalPrompt })

    if (bunnyReady()) {
      const filename = generateImageFilename(session.user.id)
      const url = await uploadToBunny(imageBuffer, filename, 'image/png')
      return NextResponse.json({ url })
    }

    const base64 = imageBuffer.toString('base64')
    return NextResponse.json({
      url: `data:image/png;base64,${base64}`,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
