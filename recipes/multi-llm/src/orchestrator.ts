import type {
  ChatMessage,
  OrchestrationConfig,
  QueryPlan,
  SearchResult,
  SummaryPackage,
} from './types'
import { QUERY_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from './prompts'

const DEFAULT_MAX_RESULTS = 6
const DEFAULT_MAX_CHARS_PER_RESULT = 1200
const DEFAULT_PARALLEL_BETA_HEADER = 'search-extract-2025-10-10'

export const extractJsonObject = (content: string) => {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  const candidate = content.slice(start, end + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

export const sanitizeMessages = (messages: ChatMessage[]) => {
  return messages
    .filter((message) =>
      message
      && (message.role === 'user' || message.role === 'assistant')
      && typeof message.content === 'string'
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
}

const getParallelClient = async (apiKey: string) => {
  const module: any = await import('parallel-web')
  const ParallelClient = module.Parallel ?? module.default ?? module
  return new ParallelClient({ apiKey })
}

const openRouterChat = async (config: {
  apiKey: string
  model: string
  siteUrl?: string
  appName?: string
  messages: ChatMessage[]
  temperature?: number
}) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl ?? 'https://example.com',
      'X-Title': config.appName ?? 'Multi-LLM Orchestrator',
    },
    body: JSON.stringify({
      model: config.model,
      messages: config.messages,
      temperature: config.temperature ?? 0.5,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${error}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

export const planSearchQueries = async (params: {
  config: OrchestrationConfig
  contextSummary: string
  seedPrompt: string
}) => {
  const content = await openRouterChat({
    apiKey: params.config.openRouterApiKey,
    model: params.config.openRouterModel,
    siteUrl: params.config.openRouterSiteUrl,
    appName: params.config.openRouterAppName,
    temperature: 0.5,
    messages: [
      { role: 'system', content: QUERY_SYSTEM_PROMPT },
      { role: 'system', content: params.contextSummary },
      { role: 'user', content: params.seedPrompt },
    ],
  })

  const payload = extractJsonObject(content) ?? {}
  const objective = typeof payload.objective === 'string'
    ? payload.objective
    : `Find sources related to: ${params.seedPrompt}`.slice(0, 200)
  const rawQueries = Array.isArray(payload.search_queries)
    ? payload.search_queries.filter((query: unknown) => typeof query === 'string')
    : []
  const dedupedQueries = rawQueries
    .map((query: string) => query.trim())
    .filter((query: string) => query.length > 0)
    .filter((query: string, index: number, list: string[]) => {
      const normalized = query.toLowerCase()
      return list.findIndex((item) => item.toLowerCase() === normalized) === index
    })
  const searchQueries = dedupedQueries.length > 0
    ? dedupedQueries.slice(0, 3)
    : [params.seedPrompt]

  return {
    objective,
    searchQueries,
  } satisfies QueryPlan
}

export const runParallelSearch = async (params: {
  config: OrchestrationConfig
  objective: string
  searchQueries: string[]
}) => {
  const client = await getParallelClient(params.config.parallelApiKey)
  const searchResponse = await client.beta.search({
    objective: params.objective,
    search_queries: params.searchQueries,
    max_results: params.config.maxResults ?? DEFAULT_MAX_RESULTS,
    max_chars_per_result: params.config.maxCharsPerResult ?? DEFAULT_MAX_CHARS_PER_RESULT,
    depth: 'snippets',
  }, {
    headers: {
      'parallel-beta': params.config.parallelBetaHeader ?? DEFAULT_PARALLEL_BETA_HEADER,
    },
  })
  return Array.isArray(searchResponse?.results) ? searchResponse.results : []
}

export const summarizeSearchResults = async (params: {
  config: OrchestrationConfig
  contextSummary: string
  objective: string
  results: SearchResult[]
}) => {
  const content = await openRouterChat({
    apiKey: params.config.openRouterApiKey,
    model: params.config.openRouterModel,
    siteUrl: params.config.openRouterSiteUrl,
    appName: params.config.openRouterAppName,
    temperature: 0.4,
    messages: [
      { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
      { role: 'system', content: params.contextSummary },
      {
        role: 'user',
        content: JSON.stringify({
          objective: params.objective,
          results: params.results,
        }, null, 2),
      },
    ],
  })

  const payload = extractJsonObject(content)

  const fallbackSources = params.results.slice(0, 4).map((result) => ({
    title: result.title,
    url: result.url,
    notes: result.excerpts?.[0]?.slice(0, 200) || 'Relevant source to explore.',
  }))

  const safeSources = Array.isArray(payload?.sources)
    ? payload.sources
        .filter((source: unknown) => {
          if (!source || typeof source !== 'object') return false
          const candidate = source as { title?: unknown; url?: unknown; notes?: unknown }
          return typeof candidate.title === 'string'
            && typeof candidate.url === 'string'
            && typeof candidate.notes === 'string'
        })
        .map((source: unknown) => {
          const candidate = source as { title: string; url: string; notes: string }
          return {
            title: candidate.title,
            url: candidate.url,
            notes: candidate.notes,
          }
        })
        .slice(0, 6)
    : []

  return {
    intro: typeof payload?.intro === 'string'
      ? payload.intro
      : 'Here is a curated bundle of sources.',
    headline: typeof payload?.headline === 'string'
      ? payload.headline
      : 'Research bundle',
    summary: typeof payload?.summary === 'string'
      ? payload.summary
      : 'A compact set of sources to explore.',
    sources: safeSources.length > 0 ? safeSources : fallbackSources,
    followups: Array.isArray(payload?.followups)
      ? payload.followups.filter((item: unknown) => typeof item === 'string').slice(0, 3)
      : undefined,
  } satisfies SummaryPackage
}

export const orchestrateQuerySearchSummaries = async (params: {
  config: OrchestrationConfig
  contextSummary: string
  seedPrompt: string
}) => {
  const plan = await planSearchQueries({
    config: params.config,
    contextSummary: params.contextSummary,
    seedPrompt: params.seedPrompt,
  })

  const results = await runParallelSearch({
    config: params.config,
    objective: plan.objective,
    searchQueries: plan.searchQueries,
  })

  const summary = await summarizeSearchResults({
    config: params.config,
    contextSummary: params.contextSummary,
    objective: plan.objective,
    results,
  })

  return {
    plan,
    results,
    summary,
  }
}
