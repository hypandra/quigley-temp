export type PromptSource =
  | string
  | Promise<string>
  | (() => string)
  | (() => Promise<string>)

export type PromptData = {
  systemPrompt: PromptSource
  context?: PromptSource
}

export type PromptInput =
  | PromptSource
  | PromptData
  | Promise<PromptData>
  | (() => PromptData)
  | (() => Promise<PromptData>)

export type ResolvedPromptData = {
  systemPrompt: string
  context?: string
}
