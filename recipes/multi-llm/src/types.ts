export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface OrchestrationContextImage {
  id: string
  url: string
  sourceText: string
  chapterId?: string | null
}

export interface OrchestrationDocumentContext {
  id: string
  title: string
  content: string
  path?: string
}

export interface OrchestrationCanvasNodeContext {
  id: string
  label: string
  content?: string | null
  chapterId?: string | null
  imageId?: string | null
}

export interface OrchestrationCanvasEdgeContext {
  id: string
  source: string
  target: string
  label?: string
}

export interface OrchestrationCanvasContext {
  id: string
  title: string
  nodes: OrchestrationCanvasNodeContext[]
  edges: OrchestrationCanvasEdgeContext[]
}

export interface OrchestrationContext {
  projectId?: string
  filePath?: string
  document?: OrchestrationDocumentContext
  canvas?: OrchestrationCanvasContext
  images?: OrchestrationContextImage[]
}

export interface QueryPlan {
  objective: string
  searchQueries: string[]
}

export interface SearchResult {
  title: string
  url: string
  excerpts?: string[]
  content?: string
}

export interface SummarySource {
  title: string
  url: string
  notes: string
}

export interface SummaryPackage {
  intro: string
  headline: string
  summary: string
  sources: SummarySource[]
  followups?: string[]
}

export interface OrchestrationConfig {
  openRouterApiKey: string
  openRouterModel: string
  openRouterSiteUrl?: string
  openRouterAppName?: string
  parallelApiKey: string
  parallelBetaHeader?: string
  maxResults?: number
  maxCharsPerResult?: number
}
