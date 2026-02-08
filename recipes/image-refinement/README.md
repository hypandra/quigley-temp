# Image Refinement Recipe

Reusable image generation + refinement pattern extracted from `wbzero`.

## Includes

- OpenRouter + Gemini image generation utilities
- Prompt variation generator
- Generic refinement dialog component
- Example API routes for generate/refine
- Optional BunnyCDN upload with graceful base64 fallback

## Files

```
src/
  components/ImageRefineDialog.tsx
  utils/image-generation.ts
  utils/variations.ts
  types.ts
example/
  api/images/generate/route.ts
  api/images/refine/route.ts
```

## Setup

1. Enable image features in `src/lib/config.ts`:
   - `features.aiImages = true`
   - `features.fileUploads = true` (optional, for Bunny uploads)
2. Set env vars:
   - `OPENROUTER_API_KEY` (required)
   - `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME` (optional)
   - `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_API_KEY`, `NEXT_PUBLIC_BUNNY_CDN_URL` (optional)

## Usage

- **Generate image (server)**
  ```ts
  import { generateImage } from '@/recipes/image-refinement/src/utils/image-generation'

  const buffer = await generateImage({ prompt: 'A neon city at dusk' })
  ```

- **Refine image (server)**
  ```ts
  import { refineImage } from '@/recipes/image-refinement/src/utils/image-generation'

  const refined = await refineImage({ imageBuffer, prompt: 'Make the lighting softer' })
  ```

- **Prompt variations (server)**
  ```ts
  import { generatePromptVariations } from '@/recipes/image-refinement/src/utils/variations'

  const variations = await generatePromptVariations('Make the background brighter')
  ```

- **Refine dialog (client)**
  ```tsx
  import { ImageRefineDialog } from '@/recipes/image-refinement/src/components/ImageRefineDialog'

  <ImageRefineDialog
    open={open}
    onOpenChange={setOpen}
    image={{ id, url, sourceText }}
    onRefined={(images) => setRefined(images)}
  />
  ```

## Notes

- The example routes in `example/api/...` return Bunny URLs when configured; otherwise they return data URLs.
- The dialog posts `image_id`, `image_url`, and `refinement_prompt` by default. Adjust `refineEndpoint` or provide `onSelectRefinement` if your API differs.
