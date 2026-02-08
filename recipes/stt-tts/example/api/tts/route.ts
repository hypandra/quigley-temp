import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import type { TtsSpeed, TtsVoice } from '../../../src/types'

export const runtime = 'nodejs'

const DEFAULT_MODEL = 'tts-1'
const TTS_MODEL = process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL

const speedMap: Record<TtsSpeed, number> = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.2,
}

type TtsPayload = {
  text?: string
  voice?: TtsVoice
  speed?: TtsSpeed
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const body = (await request.json()) as TtsPayload
    const input = body.text

    if (!input) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const voice = body.voice ?? 'alloy'
    const speed = body.speed ?? 'normal'
    const zone = process.env.BUNNY_STORAGE_ZONE
    const apiKeyBunny = process.env.BUNNY_STORAGE_API_KEY
    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL

    const cacheKey = createHash('sha256')
      .update(`${TTS_MODEL}|${voice}|${speed}|${input}`)
      .digest('hex')
    const objectPath = `tts/${cacheKey}.mp3`

    const missingEnv: string[] = []
    if (!zone) missingEnv.push('BUNNY_STORAGE_ZONE')
    if (!apiKeyBunny) missingEnv.push('BUNNY_STORAGE_API_KEY')
    if (!cdnUrl) missingEnv.push('NEXT_PUBLIC_BUNNY_CDN_URL')

    if (missingEnv.length > 0) {
      console.info(
        `TTS cache: missing env (${missingEnv.join(', ')}). Using OpenAI TTS only.`
      )
    }

    if (zone && apiKeyBunny) {
      const storageUrl = `https://storage.bunnycdn.com/${zone}/${objectPath}`
      const cachedResponse = await fetch(storageUrl, {
        headers: { AccessKey: apiKeyBunny },
      })

      if (cachedResponse.ok) {
        if (cdnUrl) {
          console.info('TTS cache: HIT (Bunny CDN)')
          return NextResponse.redirect(`${cdnUrl}/${objectPath}`, 307)
        }
        console.info('TTS cache: HIT (Bunny storage)')
        const cachedBuffer = await cachedResponse.arrayBuffer()
        return new NextResponse(new Uint8Array(cachedBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'X-TTS-Model': TTS_MODEL,
          },
        })
      }
    }

    console.info('TTS cache: MISS (generating audio)')

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice,
        input,
        speed: speedMap[speed],
        response_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to read TTS error')
      throw new Error(`TTS request failed (${response.status}): ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const audioBytes = new Uint8Array(audioBuffer)

    if (zone && apiKeyBunny) {
      const storageUrl = `https://storage.bunnycdn.com/${zone}/${objectPath}`
      const uploadResponse = await fetch(storageUrl, {
        method: 'PUT',
        headers: {
          AccessKey: apiKeyBunny,
          'Content-Type': 'audio/mpeg',
        },
        body: audioBytes,
      })

      if (!uploadResponse.ok) {
        console.warn('Bunny TTS upload failed:', await uploadResponse.text())
      }
    }

    return new NextResponse(audioBytes, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-TTS-Model': TTS_MODEL,
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
  }
}
