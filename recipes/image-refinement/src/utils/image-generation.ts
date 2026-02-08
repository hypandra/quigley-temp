const DEFAULT_MODEL = 'google/gemini-2.5-flash-image'

export interface OpenRouterOptions {
  apiKey?: string
  siteUrl?: string
  appName?: string
}

export interface GenerateImageOptions extends OpenRouterOptions {
  prompt: string
  model?: string
}

export interface RefineImageOptions extends OpenRouterOptions {
  imageBuffer: Buffer
  prompt: string
  model?: string
  mimeType?: string
}

export function renderPromptTemplate(template: string, sourceText: string): string {
  const trimmed = template.trim()
  if (trimmed.includes('{{source_text}}')) {
    return trimmed.replaceAll('{{source_text}}', sourceText)
  }
  return `${trimmed}\n\n"${sourceText}"`
}

function getOpenRouterHeaders(options: OpenRouterOptions) {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': options.siteUrl || process.env.OPENROUTER_SITE_URL || 'https://example.com',
    'X-Title': options.appName || process.env.OPENROUTER_APP_NAME || 'ImageRefinement',
  }
}

function extractBase64FromPart(part: any): string | null {
  if (!part) return null

  if (part.data && typeof part.data === 'string') return part.data
  if (part.inline_data?.data) return part.inline_data.data
  if (part.image?.data) return part.image.data
  if (part.b64_json) return part.b64_json
  if (part.source?.data) return part.source.data

  const urlCandidate = part.image_url?.url || part.image_url || part.url
  if (typeof urlCandidate === 'string' && urlCandidate.startsWith('data:image/')) {
    const base64 = urlCandidate.split(',')[1]
    if (base64) return base64
  }

  if (typeof part === 'string') {
    const match = part.match(/data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=]+)/)
    if (match) return match[1]
  }

  if (typeof part.text === 'string') {
    const match = part.text.match(/data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=]+)/)
    if (match) return match[1]
  }

  return null
}

function extractImageBufferFromResponse(data: any): Buffer | null {
  const message = data?.choices?.[0]?.message

  if (message?.images && Array.isArray(message.images)) {
    for (const img of message.images) {
      const base64 = extractBase64FromPart(img)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  if (Array.isArray(message?.content)) {
    for (const part of message.content) {
      const base64 = extractBase64FromPart(part)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  if (Array.isArray(message?.content?.parts)) {
    for (const part of message.content.parts) {
      const base64 = extractBase64FromPart(part)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  if (typeof message?.content === 'string') {
    const base64 = extractBase64FromPart(message.content)
    if (base64) return Buffer.from(base64, 'base64')
  }

  if (Array.isArray(data?.data)) {
    for (const item of data.data) {
      const base64 = extractBase64FromPart(item)
      if (base64) return Buffer.from(base64, 'base64')
    }
  }

  if (Array.isArray(data?.candidates)) {
    for (const candidate of data.candidates) {
      if (Array.isArray(candidate?.content?.parts)) {
        for (const part of candidate.content.parts) {
          const base64 = extractBase64FromPart(part)
          if (base64) return Buffer.from(base64, 'base64')
        }
      }
    }
  }

  if (Array.isArray(data?.images)) {
    for (const img of data.images) {
      const base64 = extractBase64FromPart(img)
      if (base64) return Buffer.from(base64, 'base64')
      if (typeof img === 'string') return Buffer.from(img, 'base64')
    }
  }

  return null
}

export async function generateImage(options: GenerateImageOptions): Promise<Buffer> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getOpenRouterHeaders(options),
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      modalities: ['text', 'image'],
      messages: [
        {
          role: 'user',
          content: options.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Image generation failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  const buffer = extractImageBufferFromResponse(data)
  if (buffer) return buffer

  console.error('Could not extract image. Full response:', JSON.stringify(data, null, 2))
  throw new Error('Could not extract image from response')
}

export async function refineImage(options: RefineImageOptions): Promise<Buffer> {
  const base64 = options.imageBuffer.toString('base64')
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getOpenRouterHeaders(options),
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      modalities: ['text', 'image'],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: { data: base64, mime_type: options.mimeType || 'image/png' },
            },
            {
              type: 'text',
              text: options.prompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Image refinement failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  const buffer = extractImageBufferFromResponse(data)
  if (buffer) return buffer

  console.error('Could not extract refined image. Full response:', JSON.stringify(data, null, 2))
  throw new Error('Could not extract refined image from response')
}
