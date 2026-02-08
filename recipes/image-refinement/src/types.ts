export interface RefinementImage {
  id: string
  url: string
  refinementPrompt?: string | null
  refinement_prompt?: string | null
  parentId?: string | null
  parent_id?: string | null
  sourceText?: string | null
  source_text?: string | null
}

export interface ImageRefineDialogImage {
  id: string
  url: string
  sourceText?: string | null
  source_text?: string | null
}

export interface ImageRefineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: ImageRefineDialogImage
  refineEndpoint?: string
  selectEndpoint?: (imageId: string) => string
  onRefined?: (images: RefinementImage[]) => void | Promise<void>
  onSelectRefinement?: (image: RefinementImage) => Promise<{ suggestion?: string | null } | void>
}
