import type { TtsSpeed, TtsVoice } from '../types'

export const DEFAULT_TTS_MODEL = 'tts-1'

const CACHE_NAME = 'cb-tts-v1'
const MODEL_STORAGE_KEY = 'cb-tts-model'
const MODEL_TTL_MS = 24 * 60 * 60 * 1000

interface ModelCacheEntry {
  model: string
  updatedAt: number
}

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisAvailable()) return []
  return window.speechSynthesis.getVoices()
}

export function getChildFriendlyVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisAvailable()) return null

  const voices = getAvailableVoices()

  const femaleUSVoice = voices.find((voice) => {
    const name = voice.name.toLowerCase()
    return voice.lang.startsWith('en-US') &&
      (name.includes('female') || name.includes('samantha') || name.includes('victoria'))
  })

  if (femaleUSVoice) return femaleUSVoice

  const usVoice = voices.find((voice) => voice.lang.startsWith('en-US'))
  if (usVoice) return usVoice

  const englishVoice = voices.find((voice) => voice.lang.startsWith('en'))
  if (englishVoice) return englishVoice

  return voices[0] || null
}

export function speakWithBrowser(
  text: string,
  options: {
    rate?: number
    pitch?: number
    volume?: number
    voice?: SpeechSynthesisVoice | null
    onEnd?: () => void
  } = {}
): void {
  if (!isSpeechSynthesisAvailable()) {
    console.warn('Speech synthesis not available')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options.rate ?? 0.9
  utterance.pitch = options.pitch ?? 1.1
  utterance.volume = options.volume ?? 1
  utterance.voice = options.voice ?? getChildFriendlyVoice()

  if (options.onEnd) {
    utterance.onend = options.onEnd
  }

  window.speechSynthesis.speak(utterance)
}

function readModelCacheEntry(): ModelCacheEntry | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(MODEL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ModelCacheEntry
    if (!parsed?.model || !parsed?.updatedAt) return null
    return parsed
  } catch {
    return null
  }
}

function writeModelCacheEntry(model: string): void {
  if (typeof window === 'undefined') return
  try {
    const entry: ModelCacheEntry = { model, updatedAt: Date.now() }
    window.localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

function isModelCacheFresh(entry: ModelCacheEntry | null): boolean {
  if (!entry) return false
  return Date.now() - entry.updatedAt <= MODEL_TTL_MS
}

export function getCachedTtsModel(): string | null {
  const entry = readModelCacheEntry()
  if (!isModelCacheFresh(entry)) return null
  return entry?.model ?? null
}

export function cacheTtsModel(model: string): void {
  writeModelCacheEntry(model)
}

export function getTtsCacheKey(
  text: string,
  voice: TtsVoice,
  speed: TtsSpeed,
  model: string = DEFAULT_TTS_MODEL
): string {
  const params = new URLSearchParams({
    text: text.toLowerCase(),
    voice,
    speed,
    model,
  })
  return `/__tts_cache?${params.toString()}`
}

export async function getCachedAudio(
  text: string,
  voice: TtsVoice,
  speed: TtsSpeed,
  model: string = DEFAULT_TTS_MODEL
): Promise<Blob | null> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    const cacheKey = getTtsCacheKey(text, voice, speed, model)
    const request = new Request(cacheKey)
    const cached = await cache.match(request)

    if (cached) {
      return await cached.blob()
    }
  } catch (error) {
    console.warn('Cache API error:', error)
  }

  return null
}

export async function cacheAudio(
  text: string,
  voice: TtsVoice,
  speed: TtsSpeed,
  response: Response,
  model: string = DEFAULT_TTS_MODEL
): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    const cacheKey = getTtsCacheKey(text, voice, speed, model)
    const request = new Request(cacheKey)
    await cache.put(request, response)
  } catch (error) {
    console.warn('Cache API put error:', error)
  }
}
