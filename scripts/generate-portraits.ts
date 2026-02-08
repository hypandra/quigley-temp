/**
 * Generate persona portraits using Gemini 2.5 Flash Image via OpenRouter.
 *
 * Usage:
 *   bun scripts/generate-portraits.ts                 # Generate all 12
 *   bun scripts/generate-portraits.ts --only nefertari # Generate one persona
 *   bun scripts/generate-portraits.ts --force          # Overwrite existing
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { TIME_PERIODS, type TimePeriod, type Persona } from '../src/lib/time-periods'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-2.5-flash-image'
const OUTPUT_DIR = resolve(import.meta.dir, '../public/portraits')

// Read API key from .env.local
function getApiKey(): string {
  const envPath = resolve(import.meta.dir, '../.env.local')
  if (!existsSync(envPath)) {
    throw new Error('Missing .env.local — need OPENROUTER_API_KEY')
  }
  const env = readFileSync(envPath, 'utf-8')
  const match = env.match(/^OPENROUTER_API_KEY=(.+)$/m)
  if (!match) throw new Error('OPENROUTER_API_KEY not found in .env.local')
  return match[1].trim()
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function buildPrompt(period: TimePeriod, persona: Persona): string {
  return `Create a warm, friendly children's book illustration portrait of ${persona.name}, a ${persona.age}-year-old ${persona.gender} ${persona.role} from ${period.location} during ${period.yearLabel} (${period.era}).

${persona.details}

Style: rich, detailed digital painting in a children's book illustration style for ages 8-13. Historically accurate clothing. Warm lighting, inviting expression. Waist-up close-up portrait with detailed facial features and shading — NOT a simple cartoon, NOT flat vector art. Background must be a single flat color or a simple soft gradient — no objects, no scenery, no props, no buildings. No text or words in the image.`
}

// Extract base64 image data from OpenRouter Gemini response
function extractImageData(response: any): string | null {
  const message = response?.choices?.[0]?.message

  // Strategy 1: message.images array
  if (message?.images?.length > 0) {
    const url = message.images[0]?.image_url?.url || message.images[0]?.image_url
    if (url) return url
  }

  // Strategy 2: content array with image parts
  const content = message?.content
  if (Array.isArray(content)) {
    for (const part of content) {
      // image_url part
      if (part.type === 'image_url' && part.image_url?.url) {
        return part.image_url.url
      }
      // inline base64 source
      if (part.type === 'image' && part.source?.data) {
        const mime = part.source?.media_type || part.mime_type || 'image/png'
        return `data:${mime};base64,${part.source.data}`
      }
      // data field directly
      if (part.data) {
        const mime = part.mime_type || 'image/png'
        return `data:${mime};base64,${part.data}`
      }
      // text field with embedded data URL
      if (typeof part.text === 'string') {
        const match = part.text.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/)
        if (match) return match[0]
      }
    }
  }

  // Strategy 3: content is a string with embedded data URL
  if (typeof content === 'string') {
    const match = content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/)
    if (match) return match[0]
  }

  return null
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  return Buffer.from(base64, 'base64')
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generatePortrait(
  apiKey: string,
  period: TimePeriod,
  persona: Persona,
  maxRetries = 3,
): Promise<Buffer> {
  const prompt = buildPrompt(period, persona)
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://quigley.cb.hypandra.com',
          'X-Title': 'Rippled Echoes',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          modalities: ['text', 'image'],
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * Math.pow(2, attempt)
          console.log(`  Rate limited, retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        const errorText = await response.text()
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const imageData = extractImageData(data)

      if (!imageData) {
        console.error('  Response structure:', JSON.stringify(data, null, 2).slice(0, 500))
        throw new Error('No image data found in response')
      }

      return dataUrlToBuffer(imageData)
    } catch (err: any) {
      lastError = err
      if (attempt < maxRetries - 1) {
        const delay = 2000 * Math.pow(2, attempt)
        console.log(`  Error: ${err.message}. Retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
    }
  }

  throw lastError || new Error('Failed after retries')
}

async function main() {
  const args = process.argv.slice(2)
  const onlyFlag = args.indexOf('--only')
  const onlyName = onlyFlag !== -1 ? args[onlyFlag + 1]?.toLowerCase() : null
  const force = args.includes('--force')

  const apiKey = getApiKey()

  // Build list of (period, persona) pairs to generate
  const tasks: Array<{ period: TimePeriod; persona: Persona; filename: string }> = []

  for (const period of TIME_PERIODS) {
    for (const persona of period.personas) {
      if (onlyName && slugify(persona.name) !== onlyName) continue
      const filename = `${period.id}-${slugify(persona.name)}.png`
      tasks.push({ period, persona, filename })
    }
  }

  if (tasks.length === 0) {
    console.error(`No persona found matching "${onlyName}"`)
    process.exit(1)
  }

  console.log(`Generating ${tasks.length} portrait(s)...\n`)

  let generated = 0
  let skipped = 0

  for (const task of tasks) {
    const outputPath = resolve(OUTPUT_DIR, task.filename)

    if (!force && existsSync(outputPath)) {
      console.log(`  [skip] ${task.filename} (already exists)`)
      skipped++
      continue
    }

    console.log(`  [gen]  ${task.persona.name} — ${task.period.era}...`)

    try {
      const buffer = await generatePortrait(apiKey, task.period, task.persona)
      writeFileSync(outputPath, buffer)
      console.log(`         ✓ ${task.filename} (${(buffer.length / 1024).toFixed(0)} KB)`)
      generated++

      // Small delay between requests to avoid rate limits
      if (tasks.indexOf(task) < tasks.length - 1) {
        await sleep(1500)
      }
    } catch (err: any) {
      console.error(`         ✗ Failed: ${err.message}`)
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}`)
}

main()
