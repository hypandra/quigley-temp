import { NextRequest } from 'next/server'

interface DefineRequest {
  term: string
  era: string
  year: string
  location: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
  }

  let body: DefineRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { term, era, year, location } = body
  if (!term) {
    return Response.json({ error: 'Missing term' }, { status: 400 })
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
        messages: [
          {
            role: 'system',
            content: `You are a friendly encyclopedia for curious 8-13 year olds. Give a 1-2 sentence explanation. Use simple, concrete language. If the term relates to ${era} (${location}, ${year}), include that context.`,
          },
          {
            role: 'user',
            content: `What is "${term}"?`,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter define error:', response.status, err)
      return Response.json({ error: 'Definition lookup failed' }, { status: 502 })
    }

    const data = await response.json()
    const definition = data.choices?.[0]?.message?.content ?? ''

    return Response.json({ definition })
  } catch (err) {
    console.error('Define route error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
