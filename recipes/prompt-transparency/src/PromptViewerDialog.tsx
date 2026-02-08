'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PromptData, PromptInput, PromptSource, ResolvedPromptData } from './types'

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof value === 'object' && value !== null && 'then' in value

const resolvePromptSource = async (source: PromptSource): Promise<string> => {
  if (typeof source === 'function') {
    const result = source()
    return isPromise(result) ? await result : result
  }

  return isPromise(source) ? await source : source
}

const resolvePromptInput = async (input: PromptInput): Promise<ResolvedPromptData> => {
  let resolved: PromptInput | PromptData | string = input

  if (typeof resolved === 'function') {
    resolved = resolved()
  }

  if (isPromise(resolved)) {
    resolved = await resolved
  }

  if (typeof resolved === 'string') {
    return { systemPrompt: resolved }
  }

  const promptData = resolved as PromptData

  return {
    systemPrompt: await resolvePromptSource(promptData.systemPrompt),
    context: promptData.context
      ? await resolvePromptSource(promptData.context)
      : undefined,
  }
}

interface PromptViewerDialogProps {
  /** The prompt to display, or a lazy loader for it. */
  prompt: PromptInput
  /** Label for what this prompt is for (e.g., "Image Generation"). */
  label: string
  /** Optional description of what this AI does. */
  description?: string
  /** Text shown on the trigger button. */
  triggerLabel?: string
  /** Size of the trigger button. */
  size?: 'sm' | 'default'
}

export function PromptViewerDialog({
  prompt,
  label,
  description,
  triggerLabel = 'View prompt',
  size = 'sm',
}: PromptViewerDialogProps) {
  const [open, setOpen] = useState(false)
  const [promptData, setPromptData] = useState<ResolvedPromptData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buttonClassName = useMemo(
    () => (size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 px-3 text-sm'),
    [size]
  )

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)

    if (!isOpen || promptData) return

    setLoading(true)
    setError(null)

    try {
      const resolved = await resolvePromptInput(prompt)
      setPromptData(resolved)
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Unknown error loading prompt.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="sm"
        className={buttonClassName}
        onClick={() => handleOpenChange(true)}
        aria-label={`View ${label} prompt`}
        title={`View ${label} prompt`}
      >
        {triggerLabel}
      </Button>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{label} Prompt</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex-1 overflow-auto space-y-6 py-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading prompt...
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              Error loading prompt: {error}
            </div>
          ) : promptData ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  System Prompt
                </label>
                <Textarea
                  readOnly
                  value={promptData.systemPrompt}
                  className="min-h-[120px] font-mono text-sm resize-none"
                />
              </div>
              {promptData.context ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Context
                  </label>
                  <Textarea
                    readOnly
                    value={promptData.context}
                    className="min-h-[120px] font-mono text-sm resize-none"
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
