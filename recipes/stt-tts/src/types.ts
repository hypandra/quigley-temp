export type TtsVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
export type TtsSpeed = 'slow' | 'normal' | 'fast'

export interface TtsRequestPayload {
  text: string
  voice?: TtsVoice
  speed?: TtsSpeed
}

export interface TtsResponsePayload {
  ok: boolean
  error?: string
}

export interface SttResponsePayload {
  text: string
  error?: string
}
