# STT + TTS Recipe

Patterns extracted from Pronouncle and SpellBetterNow for:
- MediaRecorder with silence-based auto-stop
- OpenAI Whisper STT route
- OpenAI TTS route with optional Bunny cache
- Browser TTS fallback + Cache API

## Contents

```
cb-oss-template/recipes/stt-tts/
  src/
    hooks/
      useAudioRecorder.ts
      useTTS.ts
    utils/
      audio.ts
    types.ts
  example/
    api/
      stt/route.ts
      tts/route.ts
```

## Quick Start

1) Copy `src/` into your app (or import directly).
2) Add the API routes from `example/api` into your Next.js app router.
3) Configure env vars:

```
OPENAI_API_KEY=...
OPENAI_TTS_MODEL=tts-1              # optional
BUNNY_STORAGE_ZONE=...              # optional
BUNNY_STORAGE_API_KEY=...           # optional
NEXT_PUBLIC_BUNNY_CDN_URL=...       # optional
```

No auth is required for the example routes.

## useAudioRecorder

```tsx
'use client'

import { useAudioRecorder } from './hooks/useAudioRecorder'

export function RecorderButton() {
  const { isSupported, isPreparing, isRecording, start, stop } = useAudioRecorder({
    maxDurationMs: 10_000,
    silenceDurationMs: 1_200,
    silenceThreshold: 0.02,
    onStop: async (audio) => {
      const formData = new FormData()
      formData.append('audio', audio, 'recording.webm')
      await fetch('/api/stt', { method: 'POST', body: formData })
    },
  })

  if (!isSupported) return <p>Recording not supported.</p>

  return (
    <button onClick={isRecording ? stop : start} disabled={isPreparing}>
      {isRecording ? 'Stop' : 'Record'}
    </button>
  )
}
```

## useTTS

```tsx
'use client'

import { useTTS } from './hooks/useTTS'

export function SpeakButton() {
  const { speak, isPlaying } = useTTS({
    voice: 'nova',
    speed: 'normal',
  })

  return (
    <button onClick={() => speak('Hello there')}> 
      {isPlaying ? 'Playing...' : 'Speak'}
    </button>
  )
}
```

The hook uses `/api/tts` by default, caches audio responses in the browser Cache API,
then falls back to `speechSynthesis` if OpenAI TTS fails.

## Browser Compatibility Notes

- MediaRecorder is supported in modern Chromium browsers and Safari 14+; Firefox
  supports it but codecs vary. The hook picks the best available audio MIME type.
- iOS Safari requires a user gesture to start audio capture or playback.
- SpeechSynthesis is widely supported, but available voices vary by OS/browser.
- Cache API is supported in modern browsers; if unavailable the hook skips caching.

## API Routes

- `POST /api/stt` expects multipart form data with `audio`.
- `POST /api/tts` expects JSON: `{ "text": string, "voice": "nova", "speed": "normal" }`.

Both routes are server-only and require `OPENAI_API_KEY`.
