export const DEFAULT_VARIATION_SYSTEM_PROMPT =
  'Rewrite the user instruction into three creative variations. Return only a JSON array of three strings. The first entry must be the original instruction.'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

export interface VariationOptions {
  apiKey?: string
  siteUrl?: string
  appName?: string
  model?: string
  systemPrompt?: string
}

function extractTextContent(message: any): string {
  if (!message?.content) return ''
  if (typeof message.content === 'string') return message.content
  if (Array.isArray(message.content)) {
    return message.content
      .map((part: any) => {
        if (typeof part === 'string') return part
        if (typeof part?.text === 'string') return part.text
        return ''
      })
      .join('')
  }
  return ''
}

function getOpenRouterHeaders(options: VariationOptions) {
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

export async function generatePromptVariations(
  userInstruction: string,
  options: VariationOptions = {}
): Promise<string[]> {
  const trimmed = userInstruction.trim()
  if (!trimmed) return []

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getOpenRouterHeaders(options),
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || DEFAULT_VARIATION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: trimmed,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Prompt variation failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  const message = data?.choices?.[0]?.message
  const content = extractTextContent(message).trim()

  let variations: string[] = []
  if (content) {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        variations = parsed.filter((item) => typeof item === 'string').map((item) => item.trim())
      }
    } catch (error) {
      variations = []
    }
  }

  if (variations.length === 0) {
    variations = [
      trimmed,
      `${trimmed}, emphasize the change with richer detail`,
      `${trimmed}, add more nuance and stylistic flair`,
    ]
  }

  if (variations.length < 3) {
    variations = variations.concat(
      Array.from({ length: 3 - variations.length }, () => trimmed)
    )
  }

  variations[0] = trimmed
  return variations.slice(0, 3)
}
