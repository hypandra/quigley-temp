/**
 * AI Image Generation via OpenRouter + Gemini
 *
 * Enable by setting config.features.aiImages = true
 * Requires OPENROUTER_API_KEY env var
 */

import { config } from './config'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

/**
 * Extract base64 data from a response part, handling multiple formats
 */
function extractBase64FromPart(part: any): string | null {
  if (!part) return null

  // Direct data field
  if (part.data && typeof part.data === 'string') return part.data
  // inline_data format (Gemini native)
  if (part.inline_data?.data) return part.inline_data.data
  // image object with data
  if (part.image?.data) return part.image.data
  // b64_json format (OpenAI style)
  if (part.b64_json) return part.b64_json
  // source.data format
  if (part.source?.data) return part.source.data

  // image_url with data URL (ACTUAL FORMAT FROM OPENROUTER)
  const urlCandidate = part.image_url?.url || part.image_url || part.url
  if (typeof urlCandidate === 'string' && urlCandidate.startsWith('data:image/')) {
    const base64 = urlCandidate.split(',')[1]
    if (base64) return base64
  }

  return null
}

export async function generateImage(prompt: string): Promise<Buffer> {
  if (!config.features.aiImages) {
    throw new Error('AI image generation is not enabled. Set config.features.aiImages = true')
  }

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || `https://${config.slug}.com`,
      'X-Title': process.env.OPENROUTER_APP_NAME || config.name,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',  // EXACT model ID - do not change
      modalities: ['text', 'image'],
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Image generation failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  const message = data.choices?.[0]?.message

  // Format 1: message.images array (ACTUAL OPENROUTER FORMAT)
  if (message?.images && Array.isArray(message.images)) {
    for (const img of message.images) {
      const base64 = extractBase64FromPart(img)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  // Format 2: message.content array
  if (Array.isArray(message?.content)) {
    for (const part of message.content) {
      const base64 = extractBase64FromPart(part)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  // Format 3: message.content.parts array
  if (Array.isArray(message?.content?.parts)) {
    for (const part of message.content.parts) {
      const base64 = extractBase64FromPart(part)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  console.error('Could not extract image. Response:', JSON.stringify(data, null, 2))
  throw new Error('Could not extract image from response')
}
