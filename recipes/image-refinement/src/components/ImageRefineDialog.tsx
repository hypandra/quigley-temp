'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import type { ImageRefineDialogProps, RefinementImage } from '../types'

function getRefinementLabel(refined: RefinementImage) {
  return refined.refinementPrompt || refined.refinement_prompt || 'Refined variation'
}

export function ImageRefineDialog({
  open,
  onOpenChange,
  image,
  refineEndpoint = '/api/images/refine',
  selectEndpoint = (imageId: string) => `/api/images/${imageId}/select`,
  onRefined,
  onSelectRefinement,
}: ImageRefineDialogProps) {
  const [instruction, setInstruction] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [refinedImages, setRefinedImages] = useState<RefinementImage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null)
  const [approvedSuggestion, setApprovedSuggestion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sourceText = useMemo(
    () => image.sourceText || image.source_text || null,
    [image.sourceText, image.source_text]
  )

  useEffect(() => {
    if (!open) {
      setInstruction('')
      setIsGenerating(false)
      setIsSelecting(false)
      setRefinedImages([])
      setSelectedId(null)
      setSuggestedPrompt(null)
      setApprovedSuggestion(false)
      setError(null)
    }
  }, [open])

  const handleGenerate = async () => {
    if (!instruction.trim()) return
    setIsGenerating(true)
    setError(null)
    setSuggestedPrompt(null)
    setApprovedSuggestion(false)

    try {
      const response = await fetch(refineEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: image.id,
          image_url: image.url,
          refinement_prompt: instruction.trim(),
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Failed to refine image')
      }

      const result = await response.json()
      const nextImages: RefinementImage[] = Array.isArray(result.images) ? result.images : []
      setRefinedImages(nextImages)
      await onRefined?.(nextImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelect = async (selectedImage: RefinementImage) => {
    setSelectedId(selectedImage.id)
    setIsSelecting(true)
    setError(null)

    try {
      if (onSelectRefinement) {
        const result = await onSelectRefinement(selectedImage)
        if (result && typeof result === 'object') {
          setSuggestedPrompt(result.suggestion ?? null)
        }
        return
      }

      const response = await fetch(selectEndpoint(selectedImage.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: true }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Failed to select refinement')
      }

      const result = await response.json()
      setSuggestedPrompt(result.suggestion || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select refinement')
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Refine image</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Refinement instruction</label>
            <Textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Describe how you want to change the image..."
              className="min-h-[90px]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleGenerate} disabled={isGenerating || !instruction.trim()}>
                {isGenerating ? 'Generating variations...' : 'Generate variations'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
            {sourceText && (
              <p className="text-xs text-muted-foreground">Source: {sourceText}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {refinedImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pick your favorite refinement:</p>
              <div className="grid gap-3 md:grid-cols-3">
                {refinedImages.map((refined) => (
                  <Card
                    key={refined.id}
                    className={`cursor-pointer overflow-hidden border transition ${
                      selectedId === refined.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelect(refined)}
                  >
                    <img src={refined.url} alt="Refined" className="w-full" />
                    <CardContent className="py-2">
                      <p className="text-xs text-muted-foreground">
                        {getRefinementLabel(refined)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {isSelecting && (
                <p className="text-xs text-muted-foreground">Analyzing your selection...</p>
              )}
            </div>
          )}

          {suggestedPrompt && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggested prompt improvement</p>
              <Textarea value={suggestedPrompt} readOnly className="min-h-[120px]" />
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setApprovedSuggestion(true)}
                  disabled={approvedSuggestion}
                >
                  {approvedSuggestion ? 'Approved' : 'Approve'}
                </Button>
                <Button variant="outline" onClick={() => setSuggestedPrompt(null)}>
                  Dismiss
                </Button>
              </div>
              {approvedSuggestion && (
                <p className="text-xs text-muted-foreground">
                  Approved. Review and apply this in your prompt settings.
                </p>
              )}
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
