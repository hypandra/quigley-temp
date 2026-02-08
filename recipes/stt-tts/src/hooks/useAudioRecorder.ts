'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseAudioRecorderOptions {
  maxDurationMs?: number
  silenceDurationMs?: number
  silenceThreshold?: number
  onStart?: () => void
  onStop?: (audio: Blob) => void
  onError?: (error: string) => void
}

export interface UseAudioRecorderResult {
  isSupported: boolean
  isPreparing: boolean
  isRecording: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

const DEFAULT_MAX_DURATION_MS = 10_000
const DEFAULT_SILENCE_DURATION_MS = 1_200
const DEFAULT_SILENCE_THRESHOLD = 0.02

function getBestMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
  ]

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return undefined
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {}
): UseAudioRecorderResult {
  const [isSupported, setIsSupported] = useState(true)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const lastSoundRef = useRef<number>(0)

  useEffect(() => {
    const supported = !!(
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
    )
    setIsSupported(supported)
  }, [])

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const closeAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined)
      audioContextRef.current = null
      analyserRef.current = null
    }
  }, [])

  const cleanup = useCallback(() => {
    clearTimers()
    stopStream()
    closeAudioContext()
  }, [clearTimers, stopStream, closeAudioContext])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }, [])

  const start = useCallback(async () => {
    if (!isSupported || isPreparing || isRecording) return

    setIsPreparing(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getBestMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder
      chunksRef.current = []
      lastSoundRef.current = 0

      recorder.onstart = () => {
        setIsPreparing(false)
        setIsRecording(true)
        options.onStart?.()
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        setIsRecording(false)
        const audioBlob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        chunksRef.current = []
        cleanup()
        options.onStop?.(audioBlob)
      }

      recorder.start()

      const maxDuration = options.maxDurationMs ?? DEFAULT_MAX_DURATION_MS
      timeoutRef.current = window.setTimeout(() => {
        if (recorderRef.current?.state === 'recording') {
          recorderRef.current.stop()
        }
      }, maxDuration)

      const silenceDuration = options.silenceDurationMs ?? DEFAULT_SILENCE_DURATION_MS
      const silenceThreshold = options.silenceThreshold ?? DEFAULT_SILENCE_THRESHOLD

      if (silenceDuration > 0 && silenceThreshold > 0) {
        const AudioContextCtor =
          window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

        if (!AudioContextCtor) return

        const audioContext = new AudioContextCtor()
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        analyserRef.current = analyser
        source.connect(analyser)

        const data = new Uint8Array(analyser.fftSize)

        const checkSilence = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteTimeDomainData(data)
          let sumSquares = 0
          for (let i = 0; i < data.length; i += 1) {
            const normalized = (data[i] - 128) / 128
            sumSquares += normalized * normalized
          }
          const rms = Math.sqrt(sumSquares / data.length)

          if (rms >= silenceThreshold) {
            lastSoundRef.current = Date.now()
          } else if (lastSoundRef.current) {
            const elapsed = Date.now() - lastSoundRef.current
            if (elapsed >= silenceDuration) {
              stop()
              return
            }
          } else {
            lastSoundRef.current = Date.now()
          }

          rafRef.current = window.requestAnimationFrame(checkSilence)
        }

        rafRef.current = window.requestAnimationFrame(checkSilence)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording.'
      setError(message)
      options.onError?.(message)
      setIsPreparing(false)
      cleanup()
    }
  }, [cleanup, isPreparing, isRecording, isSupported, options, stop])

  useEffect(() => () => cleanup(), [cleanup])

  return {
    isSupported,
    isPreparing,
    isRecording,
    error,
    start,
    stop,
  }
}
