import { NextRequest } from 'next/server'

interface ConnectionRequest {
  fromEra: string
  fromYear: string
  fromLocation: string
  fromDescription: string
  toEra: string
  toYear: string
  toLocation: string
  toDescription: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json({ connections: [] })
  }

  let body: ConnectionRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ connections: [] })
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rippledechoes.com',
        'X-Title': 'Rippled Echoes Time Machine',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        stream: false,
        messages: [
          {
            role: 'system',
            content: `You find surprising, tangible connections between two historical eras for kids ages 8-13. Return ONLY valid JSON, no other text.

Format: { "connections": [{ "emoji": "single emoji", "from": "what happened in the first era (1 sentence)", "to": "how it connects to the second era (1 sentence)", "thread": "the invisible thread linking them (1 short phrase)" }] }

Rules:
- Find 2-3 connections that would genuinely surprise a curious kid
- Focus on concrete, tangible things: food, inventions, words, trade goods, ideas
- Keep sentences short and vivid
- No abstract or vague connections`,
          },
          {
            role: 'user',
            content: `Find connections between these two eras:

FROM: ${body.fromEra} (${body.fromYear}, ${body.fromLocation})
${body.fromDescription}

TO: ${body.toEra} (${body.toYear}, ${body.toLocation})
${body.toDescription}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.9,
      }),
    })

    if (!response.ok) {
      return Response.json({ connections: [] })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return Response.json({ connections: [] })
    }

    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed.connections)) {
      return Response.json({ connections: [] })
    }

    return Response.json({ connections: parsed.connections })
  } catch {
    return Response.json({ connections: [] })
  }
}
