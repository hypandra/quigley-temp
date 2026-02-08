import { NextRequest, NextResponse } from 'next/server'
import { buildContextSummary } from '../../../src/context'
import { orchestrateQuerySearchSummaries, sanitizeMessages } from '../../../src/orchestrator'
import type { ChatMessage, OrchestrationContext } from '../../../src/types'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-haiku'
const PARALLEL_API_KEY = process.env.PARALLEL_API_KEY

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY || !PARALLEL_API_KEY) {
    return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 })
  }

  const body = await request.json()
  const messages = Array.isArray(body?.messages) ? body.messages : []
  const context = body?.context as OrchestrationContext | undefined

  const sanitizedMessages = sanitizeMessages(messages as ChatMessage[])
  const lastUserMessage = [...sanitizedMessages].reverse().find((message) => message.role === 'user')

  const contextSummary = buildContextSummary(context)
  const seedPrompt = lastUserMessage?.content
    ?? 'Summarize the most relevant sources for the user.'

  try {
    const result = await orchestrateQuerySearchSummaries({
      config: {
        openRouterApiKey: OPENROUTER_API_KEY,
        openRouterModel: OPENROUTER_MODEL,
        openRouterSiteUrl: process.env.OPENROUTER_SITE_URL,
        openRouterAppName: process.env.OPENROUTER_APP_NAME,
        parallelApiKey: PARALLEL_API_KEY,
      },
      contextSummary,
      seedPrompt,
    })

    return NextResponse.json({
      message: result.summary.intro,
      package: result.summary,
      plan: result.plan,
      results: result.results,
    })
  } catch (error) {
    console.error('Multi-LLM orchestrator error:', error)
    return NextResponse.json({ error: 'Orchestration failed' }, { status: 502 })
  }
}
