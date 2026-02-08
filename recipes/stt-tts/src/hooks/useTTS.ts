'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TtsSpeed, TtsVoice } from '../types'
import {
  cacheAudio,
  cacheTtsModel,
  DEFAULT_TTS_MODEL,
  getCachedAudio,
  getCachedTtsModel,
  getChildFriendlyVoice,
  isSpeechSynthesisAvailable,
  speakWithBrowser,
} from '../utils/audio'

export interface UseTtsConfig {
  apiEndpoint?: string
  voice?: TtsVoice
  speed?: TtsSpeed
  rate?: number
  pitch?: number
  volume?: number
  preferBrowser?: boolean
}

export interface SpeakOptions {
  voice?: TtsVoice
  speed?: TtsSpeed
  rate?: number
  pitch?: number
  volume?: number
  preferBrowser?: boolean
  onEnd?: () => void
}

export interface UseTtsResult {
  isPlaying: boolean
  error: string | null
  speak: (text: string, options?: SpeakOptions) => Promise<void>
  stop: () => void
  isBrowserTtsAvailable: boolean
}

export function useTTS(config: UseTtsConfig = {}): UseTtsResult {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (isSpeechSynthesisAvailable()) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }, [])

  useEffect(() => () => stop(), [stop])

  const speak = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      if (!text) return

      const voice = options.voice ?? config.voice ?? 'nova'
      const speed = options.speed ?? config.speed ?? 'normal'
      const rate = options.rate ?? config.rate ?? 0.9
      const pitch = options.pitch ?? config.pitch ?? 1.1
      const volume = options.volume ?? config.volume ?? 1
      const preferBrowser = options.preferBrowser ?? config.preferBrowser ?? false

      setError(null)
      stop()

      const handleEnd = () => {
        setIsPlaying(false)
        options.onEnd?.()
      }

      const playBrowser = () => {
        if (!isSpeechSynthesisAvailable()) {
          setError('Speech synthesis not available in this browser.')
          return
        }
        setError(null)
        setIsPlaying(true)
        speakWithBrowser(text, {
          rate,
          pitch,
          volume,
          voice: getChildFriendlyVoice(),
          onEnd: handleEnd,
        })
      }

      if (preferBrowser) {
        playBrowser()
        return
      }

      try {
        const cachedModel = getCachedTtsModel() ?? DEFAULT_TTS_MODEL
        const cachedAudio = await getCachedAudio(text, voice, speed, cachedModel)
        if (cachedAudio) {
          const url = URL.createObjectURL(cachedAudio)
          const audio = new Audio(url)
          audioRef.current = audio
          setIsPlaying(true)
          audio.onended = () => {
            URL.revokeObjectURL(url)
            audioRef.current = null
            handleEnd()
          }
          audio.onerror = () => {
            URL.revokeObjectURL(url)
            audioRef.current = null
            handleEnd()
          }
          await audio.play()
          return
        }

        const response = await fetch(config.apiEndpoint ?? '/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice, speed }),
        })

        if (!response.ok) {
          throw new Error('TTS request failed')
        }

        const modelHeader = response.headers.get('X-TTS-Model')
        if (modelHeader) {
          cacheTtsModel(modelHeader)
        }

        const modelForCache = modelHeader ?? cachedModel
        await cacheAudio(text, voice, speed, response.clone(), modelForCache)

        const audioBlob = await response.blob()
        const url = URL.createObjectURL(audioBlob)
        const audio = new Audio(url)
        audioRef.current = audio
        setIsPlaying(true)

        audio.onended = () => {
          URL.revokeObjectURL(url)
          audioRef.current = null
          handleEnd()
        }

        audio.onerror = () => {
          URL.revokeObjectURL(url)
          audioRef.current = null
          handleEnd()
        }

        await audio.play()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'TTS failed.'
        console.warn('OpenAI TTS failed, falling back to browser TTS:', err)
        setError(message)
        playBrowser()
      }
    },
    [config, stop]
  )

  return {
    isPlaying,
    error,
    speak,
    stop,
    isBrowserTtsAvailable: isSpeechSynthesisAvailable(),
  }
}
