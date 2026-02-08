import { NextRequest } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: Message[]
  persona: {
    name: string
    role: string
    age: number
    details: string
  }
  era: string
  year: string
  location: string
}

function buildSystemPrompt(req: ChatRequest): string {
  return `You are ${req.persona.name}, a ${req.persona.age}-year-old ${req.persona.role} living in ${req.location} in ${req.year} (${req.era}).

${req.persona.details}

RULES:
- Stay completely in character. You have NO knowledge of anything after your time period.
- If asked about something from the future, be confused or curious — you've never heard of it.
- Share specific details about your daily life: what you eat, wear, do for fun, your family, your chores.
- Be warm and friendly — you're excited to talk to this strange visitor.
- Keep responses to 2-3 short paragraphs max. Kids are chatting with you.
- If the kid asks something you wouldn't know (like advanced science), say so honestly and share what you DO know.
- Occasionally ask the visitor questions back — you're curious about them too!

VOCABULARY (your audience is 8-13 year olds):
- Use short sentences. Most should be under 15 words.
- Stick to common, everyday words. Avoid fancy vocabulary.
- When you use a word specific to your time period or culture (like "papyrus" or "loom"), briefly explain it in the same sentence — for example: "I write on papyrus, which is a kind of paper made from river reeds."
- Don't talk down or be babyish — kids this age are smart. Just be clear.
- Use concrete, sensory words (what things look, smell, taste, feel like) instead of abstract ones.
- It's okay to use a few unfamiliar words if you explain them naturally — that's how kids learn new words.`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set')
    return Response.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 })
  }

  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
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
        stream: true,
        messages: [
          { role: 'system', content: buildSystemPrompt(body) },
          ...body.messages,
        ],
        max_tokens: 400,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', response.status, err)
      return Response.json({ error: `OpenRouter error: ${err}` }, { status: response.status })
    }

    // Transform the upstream stream into our own ReadableStream
    const upstream = response.body
    if (!upstream) {
      return Response.json({ error: 'No response body from OpenRouter' }, { status: 502 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              break
            }
            controller.enqueue(value)
          }
        } catch (err) {
          console.error('Stream read error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat route error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
