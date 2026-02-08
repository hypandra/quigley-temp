'use client'

import { PromptViewerDialog } from '../src/PromptViewerDialog'

const fetchSystemPrompt = async () => {
  const response = await fetch('/api/prompts/system')
  const data = await response.json()
  return data.prompt as string
}

export function PromptTransparencyExample() {
  return (
    <div className="flex items-center gap-2">
      <PromptViewerDialog
        label="Assistant"
        description="System prompt used to answer questions."
        prompt="You are a helpful assistant."
      />
      <PromptViewerDialog
        label="Image Generator"
        description="Prompt and runtime context used to generate images."
        triggerLabel="View image prompt"
        size="default"
        prompt={{
          systemPrompt: () => fetchSystemPrompt(),
          context: () =>
            fetch('/api/prompts/context').then((res) => res.text()),
        }}
      />
    </div>
  )
}
