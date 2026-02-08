# Prompt Transparency

A reusable, shadcn/ui-styled dialog for revealing system prompts and optional context. Supports lazy loading with strings, promises, or async functions.

## Files

- `src/PromptViewerDialog.tsx`
- `src/types.ts`
- `example/usage.tsx`

## Requirements

This recipe uses only shadcn/ui components:

- `Dialog`
- `Button`
- `Textarea`

Install them in your project if needed:

```bash
bunx shadcn@latest add dialog button textarea
```

## Basic usage (sync string)

```tsx
import { PromptViewerDialog } from './PromptViewerDialog'

export function PromptTransparency() {
  return (
    <PromptViewerDialog
      label="Assistant"
      description="Shows the system prompt used for answers."
      prompt="You are a helpful assistant."
    />
  )
}
```

## Lazy loading (async function)

```tsx
import { PromptViewerDialog } from './PromptViewerDialog'

async function fetchPrompt(): Promise<string> {
  const res = await fetch('/api/prompt')
  const data = await res.json()
  return data.systemPrompt
}

export function PromptTransparency() {
  return (
    <PromptViewerDialog
      label="Research Agent"
      prompt={() => fetchPrompt()}
    />
  )
}
```

## System prompt + context

```tsx
import { PromptViewerDialog } from './PromptViewerDialog'

export function PromptTransparency() {
  return (
    <PromptViewerDialog
      label="Summarizer"
      description="Prompt and runtime context for the summarizer."
      prompt={{
        systemPrompt: 'You summarize text into three bullets.',
        context: () => fetch('/api/context').then((res) => res.text()),
      }}
    />
  )
}
```

## Notes

- `prompt` accepts a string, a promise, or a function returning a promise (for lazy loading).
- If a string is provided, it is treated as the system prompt.
- `context` is optional and supports the same lazy-loading options.
