'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TimePeriod, Persona, TIME_PERIODS, getRandomPeriod, getRandomPersona } from '@/lib/time-periods'


import { TIMELINE_EVENTS } from '@/lib/timeline-events'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface LookupEntity {
  id: string
  label: string
  description: string
  wiki: string
}

function parseBrackets(text: string): Array<{ type: 'text' | 'term'; value: string }> {
  const segments: Array<{ type: 'text' | 'term'; value: string }> = []
  const regex = /\[\[(.+?)\]\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    segments.push({ type: 'term', value: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) segments.push({ type: 'text', value: text.slice(lastIndex) })
  return segments
}

// iOS audio unlock: tiny silent MP3 played synchronously in gesture to unlock audio context
// See: cb/docs/ios-mobile-audio-unlock.md, DEV-1548
const SILENT_MP3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAHAAGf9AAAIgAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMQbAAADSAAAAAAAAANIAAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'

// Voice preferences by gender and origin for SpeechSynthesis
// Prioritized: specific accent match > same-gender English > any English
function pickVoice(voices: SpeechSynthesisVoice[], gender: 'male' | 'female', origin: string): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null

  // macOS/iOS voice names by gender
  const femaleNames = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Martha', 'Veena']
  const maleNames = ['Daniel', 'Alex', 'Oliver', 'Fred', 'Tom', 'Rishi']
  const preferredNames = gender === 'female' ? femaleNames : maleNames

  // Try origin-matched voice first (e.g. 'en-GB' for British personas)
  if (origin.startsWith('en-')) {
    const originMatch = voices.find(v =>
      v.lang === origin && preferredNames.some(n => v.name.includes(n))
    )
    if (originMatch) return originMatch
  }

  // Try any voice with matching gender name
  const genderMatch = voices.find(v =>
    v.lang.startsWith('en') && preferredNames.some(n => v.name.includes(n))
  )
  if (genderMatch) return genderMatch

  // Fallback: any English voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0]
}

function useTTS() {
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const unlockedRef = useRef(false)

  // Load voices async — Safari fires voiceschanged, Chrome populates immediately
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const speak = useCallback((text: string, idx: number, persona?: Persona) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    // iOS unlock: play silent audio in gesture context first
    if (!unlockedRef.current) {
      try {
        const audio = new Audio(SILENT_MP3)
        audio.volume = 0
        audio.play().catch(() => {})
        unlockedRef.current = true
      } catch {
        // Silent unlock failed, continue anyway
      }
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = persona?.gender === 'female' ? 1.15 : 0.95

    const voice = pickVoice(
      voicesRef.current,
      persona?.gender ?? 'male',
      persona?.origin ?? 'en-US'
    )
    if (voice) utterance.voice = voice

    utterance.onend = () => setSpeakingIdx(null)
    utterance.onerror = () => setSpeakingIdx(null)
    setSpeakingIdx(idx)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSpeakingIdx(null)
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { speakingIdx, speak, stop }
}

interface JourneyStop {
  period: TimePeriod
  persona: Persona
}

interface Connection {
  emoji: string
  from: string
  to: string
  thread: string
}

type AppState = 'home' | 'arriving' | 'chatting' | 'effects' | 'timeline'

function formatYearsAgo(year: number, currentYear: number) {
  const diff = Math.max(0, currentYear - year)
  const rounded = diff >= 1000 ? Math.round(diff / 100) * 100 : diff
  const formatter = new Intl.NumberFormat('en-US')
  return diff >= 1000
    ? `~${formatter.format(rounded)} years ago`
    : `${formatter.format(diff)} years ago`
}

function syncUrlParams(period: TimePeriod | null, persona: Persona | null) {
  const url = new URL(window.location.href)
  if (period && persona) {
    url.searchParams.set('era', period.id)
    url.searchParams.set('persona', persona.name)
  } else {
    url.searchParams.delete('era')
    url.searchParams.delete('persona')
  }
  window.history.replaceState({}, '', url.toString())
}

export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  )
}

function Home() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<AppState>('home')
  const [journey, setJourney] = useState<JourneyStop[]>([])
  const [currentStop, setCurrentStop] = useState<JourneyStop | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<LookupEntity | null>(null)
  const [showMarks, setShowMarks] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [arrivalStep, setArrivalStep] = useState(0)
  const [previousStop, setPreviousStop] = useState<JourneyStop | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const tts = useTTS()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const connectionsAbortRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef<string>(crypto.randomUUID())
  const defineAbortRef = useRef<AbortController | null>(null)
  const currentStopRef = useRef(currentStop)
  currentStopRef.current = currentStop

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      connectionsAbortRef.current?.abort()
      defineAbortRef.current?.abort()
    }
  }, [])

  async function lookupTerm(term: string) {
    const stop = currentStopRef.current
    if (!stop) return

    setSelectedEntity({
      id: `lookup-${Date.now()}`,
      label: term,
      description: '',
      wiki: `https://simple.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`,
    })

    defineAbortRef.current?.abort()
    const controller = new AbortController()
    defineAbortRef.current = controller

    try {
      const res = await fetch('/api/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term,
          era: stop.period.era,
          year: stop.period.yearLabel,
          location: stop.period.location,
        }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error()
      const { definition } = await res.json()
      setSelectedEntity(prev => prev?.label === term ? { ...prev, description: definition } : prev)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setSelectedEntity(prev => prev?.label === term ? { ...prev, description: '' } : prev)
    }
  }

  // Text selection detection — select text in assistant messages to look it up
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    function onSelChange() {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) return
        const text = sel.toString().trim()
        if (text.length < 2 || text.length > 100) return
        const range = sel.getRangeAt(0)
        const node = range.commonAncestorContainer
        const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element
        if (!el?.closest('[data-assistant-msg]')) return
        lookupTerm(text)
      }, 500)
    }
    document.addEventListener('selectionchange', onSelChange)
    return () => { document.removeEventListener('selectionchange', onSelChange); clearTimeout(timeout) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Restore location from URL params on mount
  useEffect(() => {
    const eraId = searchParams.get('era')
    const personaName = searchParams.get('persona')
    if (!eraId || !personaName) return

    const period = TIME_PERIODS.find(p => p.id === eraId)
    if (!period) return

    const persona = period.personas.find(p => p.name === personaName)
    if (!persona) return

    const stop = { period, persona }
    setCurrentStop(stop)
    setJourney([stop])
    setState('chatting')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (state === 'chatting') {
      inputRef.current?.focus()
    }
  }, [state])

  // Progressive disclosure: advance steps on a timer while arriving
  // Steps: 0=icon, 1=era name, 2=location/year, 3=description, 4=persona, 5=button
  useEffect(() => {
    if (state !== 'arriving') return
    if (arrivalStep >= 5) return

    const delay = arrivalStep === 0 ? 400 : 700
    const timer = setTimeout(() => setArrivalStep(prev => prev + 1), delay)
    return () => clearTimeout(timer)
  }, [state, arrivalStep])

  function jump() {
    const lastId = currentStop?.period.id
    const period = getRandomPeriod(lastId)
    const persona = getRandomPersona(period)
    const nextStop = { period, persona }

    const prevStop = currentStop
    setPreviousStop(prevStop)

    abortRef.current?.abort()
    connectionsAbortRef.current?.abort()
    tts.stop()
    setCurrentStop(nextStop)
    setJourney(prev => [...prev, nextStop])
    setMessages([])
    setShowEffects(false)
    setShowTimeline(false)
    setSelectedEntity(null)
    setArrivalStep(0)
    setConnections([])
    setConnectionsLoading(false)
    setState('arriving')
    syncUrlParams(period, persona)

    if (prevStop) {
      setConnectionsLoading(true)
      const connController = new AbortController()
      connectionsAbortRef.current = connController
      fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: connController.signal,
        body: JSON.stringify({
          fromEra: prevStop.period.era,
          fromYear: prevStop.period.yearLabel,
          fromLocation: prevStop.period.location,
          fromDescription: prevStop.period.description,
          toEra: period.era,
          toYear: period.yearLabel,
          toLocation: period.location,
          toDescription: period.description,
        }),
      })
        .then(res => res.json())
        .then(data => setConnections(data.connections ?? []))
        .catch(() => setConnections([]))
        .finally(() => setConnectionsLoading(false))
    }
  }

  async function sendText(text: string) {
    if (!text.trim() || isStreaming || !currentStop) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    try {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages,
          persona: currentStop.persona,
          era: currentStop.period.era,
          eraId: currentStop.period.id,
          year: currentStop.period.yearLabel,
          location: currentStop.period.location,
          sessionId: sessionIdRef.current,
        }),
      })

      if (!response.ok) throw new Error('Chat request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.replace(/\r$/, '')
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                assistantContent += delta
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                  return updated
                })
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      console.error('Chat error:', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Hmm, the time machine seems to be glitching... Try asking again!' },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  function viewEffects() {
    setShowEffects(true)
    setShowTimeline(false)
    setState('effects')
  }

  function viewTimeline() {
    setShowTimeline(true)
    setShowEffects(false)
    setState('timeline')
  }

  const currentYear = new Date().getFullYear()
  const timelineYears = journey.map(stop => stop.period.year)
  const timelineEventYears = TIMELINE_EVENTS.map(event => event.year)
  const timelineMinYear = Math.min(
    ...timelineYears,
    ...timelineEventYears,
    currentYear
  )
  const timelineMaxYear = currentYear
  const timelineRange = Math.max(1, timelineMaxYear - timelineMinYear)

  const timelineStops = journey.map((stop, index) => ({
    key: `${stop.period.id}-${index}`,
    name: stop.period.era,
    year: stop.period.year,
    yearLabel: stop.period.yearLabel,
    location: stop.period.location,
    color: stop.period.color,
    distance: formatYearsAgo(stop.period.year, currentYear),
  }))
  const oldestStop = timelineStops.reduce<typeof timelineStops[number] | null>((oldest, stop) => {
    if (!oldest) return stop
    return stop.year < oldest.year ? stop : oldest
  }, null)

  // HOME SCREEN
  if (state === 'home') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight text-primary text-balance">Rippled Echoes</h1>
            <p className="text-lg text-muted-foreground text-pretty">You are here and now. Where will you go?</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            Jump to a random moment in history. Meet someone who lived there.
            Ask them anything about their life. Then see how their world shaped yours.
          </p>

          <button
            onClick={jump}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
          >
            Jump into the Past
          </button>

          {journey.length > 0 && (
            <p className="text-xs text-muted-foreground text-pretty tabular-nums">
              {journey.length} {journey.length === 1 ? 'era' : 'eras'} visited
            </p>
          )}
        </div>
      </div>
    )
  }

  // ARRIVING SCREEN — progressive disclosure
  // arrivalStep: 0=icon, 1=era name, 2=location/year, 3=description, 4=persona, 5=button
  if (state === 'arriving' && currentStop) {
    const stepClass = (step: number) =>
      cn(
        'transition-all duration-500',
        arrivalStep >= step ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      )

    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className={stepClass(0)}>
            {currentStop.persona.portrait ? (
              <img
                src={currentStop.persona.portrait}
                alt={currentStop.persona.name}
                className="mx-auto h-[200px] w-[200px] rounded-full object-cover shadow-lg"
              />
            ) : (
              <div
                className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
                style={{ backgroundColor: currentStop.period.color + '22' }}
              >
                ⏳
              </div>
            )}
          </div>
          <div className={cn('space-y-2', stepClass(1))}>
            {previousStop && (
              <p className="text-sm text-muted-foreground text-pretty mb-1">
                Leaving <span style={{ color: previousStop.period.color }}>{previousStop.period.era}</span>...
              </p>
            )}
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Traveling to...</p>
            <h2 className="text-3xl font-bold text-balance" style={{ color: currentStop.period.color }}>
              {currentStop.period.era}
            </h2>
          </div>
          <p className={cn('text-muted-foreground text-pretty tabular-nums', stepClass(2))}>
            {currentStop.period.location} &middot; {currentStop.period.yearLabel}
          </p>
          <p className={cn('text-sm text-muted-foreground leading-relaxed text-pretty', stepClass(3))}>
            {currentStop.period.description}
          </p>
          {previousStop && arrivalStep >= 3 && (
            <div className="space-y-3 transition-all duration-500 opacity-100 translate-y-0">
              {connectionsLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Finding the threads between eras...
                </p>
              ) : connections.length > 0 ? (
                <div className="space-y-2">
                  {connections.map((conn, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-card/50 px-3 py-2 text-left animate-fade-in"
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <p className="text-xs">
                        <span className="mr-1">{conn.emoji}</span>
                        <span className="text-muted-foreground">{conn.from}</span>
                        <span className="mx-1 text-muted-foreground">→</span>
                        <span className="text-foreground">{conn.to}</span>
                      </p>
                      <p className="text-xs text-muted-foreground italic mt-0.5">{conn.thread}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          <div className={cn('pt-2', stepClass(4))}>
            <p className="text-xl text-muted-foreground text-pretty tabular-nums">
              You&apos;ll meet <strong className="text-foreground">{currentStop.persona.name}</strong>, a {currentStop.persona.age}-year-old {currentStop.persona.role}
            </p>
          </div>
          <div className={stepClass(5)}>
            <button
              onClick={() => setState('chatting')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 active:scale-95"
            >
              Go talk to them
            </button>
          </div>
        </div>
      </div>
    )
  }

  // CHAT + EFFECTS SCREEN
  if ((state === 'chatting' || state === 'effects' || state === 'timeline') && currentStop) {
    return (
      <div className="flex flex-col h-dvh">
        {/* Header */}
        <div className="shrink-0 border-b px-4 py-3">
          <div className="max-w-2xl mx-auto space-y-1.5">
            {/* Row 1: Globe home + action buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { tts.stop(); setState('home'); setCurrentStop(null); syncUrlParams(null, null) }}
                className="h-9 w-9 rounded-xl flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shrink-0"
                title="Back to home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={viewEffects}
                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Ripples
                </button>
                <button
                  onClick={viewTimeline}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary/60 transition-colors"
                >
                  Timeline
                </button>
                <button
                  onClick={jump}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Jump ⚡
                </button>
              </div>
            </div>
            {/* Row 2: Persona avatar + info */}
            <div className="flex items-center gap-2">
              {currentStop.persona.portrait ? (
                <img
                  src={currentStop.persona.portrait}
                  alt={currentStop.persona.name}
                  className="h-12 w-12 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: currentStop.period.color + '22', color: currentStop.period.color }}
                >
                  {currentStop.persona.name[0]}
                </div>
              )}
              <p className="text-sm truncate">
                <span className="font-semibold">{currentStop.persona.name}</span>
                <span className="text-muted-foreground"> &middot; {currentStop.persona.role} &middot; {currentStop.period.yearLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Effects panel (overlay) */}
        {showEffects && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
            <div className="shrink-0 border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-balance">Ripples from {currentStop.period.era}</h3>
              <button
                onClick={() => { setShowEffects(false); setState('chatting') }}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Back to Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-md mx-auto space-y-4">
                {connections.length > 0 && (
                  <div className="space-y-3 pb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your journey thread</p>
                    {connections.map((conn, i) => (
                      <div
                        key={i}
                        className="rounded-xl border bg-card p-4 space-y-2 animate-fade-in"
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{conn.emoji}</span>
                          <div className="space-y-1">
                            <p className="text-sm text-pretty" style={{ color: previousStop?.period.color }}>{conn.from}</p>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <span>↓</span>
                              <span className="text-xs italic">{conn.thread}</span>
                            </div>
                            <p className="text-sm text-foreground text-pretty">{conn.to}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {currentStop.period.effects.map((effect, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-card p-4 space-y-3 animate-fade-in"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{effect.emoji}</span>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Then</p>
                          <p className="text-sm text-pretty" style={{ color: currentStop.period.color }}>{effect.cause}</p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>↓</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now</p>
                          <p className="text-sm text-foreground text-pretty">{effect.effect}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {journey.length > 1 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Your Journey</p>
                    <div className="flex flex-wrap gap-2">
                      {journey.map((stop, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-md tabular-nums"
                          style={{
                            backgroundColor: stop.period.color + '22',
                            color: stop.period.color,
                            border: stop === currentStop ? `1px solid ${stop.period.color}` : 'none',
                          }}
                        >
                          {stop.period.yearLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={jump}
                  className="w-full mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Jump to Next Era ⚡
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline panel (overlay) */}
        {showTimeline && (
          <div className="absolute inset-0 z-50 bg-background/95 flex flex-col">
            <div className="shrink-0 border-b px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-balance">Your Timeline</h3>
                <p className="text-xs text-muted-foreground text-pretty">
                  See how far back you have traveled so far.
                </p>
              </div>
              <button
                onClick={() => { setShowTimeline(false); setState('chatting') }}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Back to Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-6">
                {journey.length === 0 ? (
                  <div className="rounded-2xl border bg-card p-6 text-center space-y-3">
                    <p className="text-sm text-muted-foreground text-pretty">
                      Your timeline is waiting. Jump to an era to start exploring history.
                    </p>
                    <button
                      onClick={jump}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Jump to First Era
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-card p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="tabular-nums">Now · {currentYear} CE</span>
                      <span className="tabular-nums">
                        Oldest · {oldestStop?.yearLabel ?? 'Unknown'}
                      </span>
                    </div>
                    <div className="relative h-96">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                      {TIMELINE_EVENTS.map(event => {
                        const position = ((timelineMaxYear - event.year) / timelineRange) * 100
                        return (
                          <div
                            key={event.id}
                            className="absolute left-0 right-0 pl-10 pr-4"
                            style={{ top: `${position}%` }}
                          >
                            <div className="absolute left-3 top-1 size-2 rounded-full bg-muted-foreground" />
                            <div className="rounded-xl border border-dashed border-border bg-background/40 px-3 py-2">
                              <p className="text-xs font-semibold text-balance">{event.label}</p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {event.yearLabel} · {formatYearsAgo(event.year, currentYear)}
                              </p>
                              <p className="text-xs text-muted-foreground text-pretty">{event.description}</p>
                            </div>
                          </div>
                        )
                      })}

                      {timelineStops.map(stop => {
                        const position = ((timelineMaxYear - stop.year) / timelineRange) * 100
                        const isCurrent = stop.year === currentStop.period.year
                        return (
                          <div
                            key={stop.key}
                            className="absolute left-0 right-0 pl-10 pr-4"
                            style={{ top: `${position}%` }}
                          >
                            <div
                              className="absolute left-3.5 top-1 size-3 rounded-full border-2 border-background"
                              style={{ backgroundColor: stop.color }}
                            />
                            <div className={cn(
                              'rounded-xl border px-3 py-2',
                              isCurrent ? 'bg-primary/20 border-primary/40' : 'bg-background/60'
                            )}>
                              <p className="text-sm font-semibold text-balance">{stop.name}</p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {stop.yearLabel} · {stop.distance}
                              </p>
                              <p className="text-xs text-muted-foreground text-pretty">{stop.location}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                {messages.length === 0 && (
                  <div className="text-center py-8 space-y-3 animate-fade-in">
                    <p className="text-sm text-muted-foreground text-pretty tabular-nums">
                      You&apos;ve arrived in <strong style={{ color: currentStop.period.color }}>{currentStop.period.location}</strong>, {currentStop.period.yearLabel}
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      <strong className="text-foreground">{currentStop.persona.name}</strong> is here — {currentStop.persona.details.toLowerCase()}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {[
                        `What's your typical day like?`,
                        `What do you eat for breakfast?`,
                        `What do you do for fun?`,
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => sendText(q)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn('flex animate-fade-in', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn('max-w-[85%]', msg.role === 'assistant' && 'group')}>
                      <div
                        data-assistant-msg={msg.role === 'assistant' ? '' : undefined}
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-pretty',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-card border rounded-bl-md'
                        )}
                      >
                        {msg.role === 'assistant' && msg.content
                          ? (showMarks
                              ? parseBrackets(msg.content).map((seg, j) =>
                                  seg.type === 'term'
                                    ? <button key={j} onClick={() => lookupTerm(seg.value)} className="text-foreground border-b border-dotted border-primary/50 hover:border-primary">{seg.value}</button>
                                    : <span key={j}>{seg.value}</span>
                                )
                              : msg.content.replace(/\[\[(.+?)\]\]/g, '$1'))
                          : (msg.content || (isStreaming ? '...' : ''))}
                      </div>
                      {msg.role === 'assistant' && msg.content && !isStreaming && (
                        <button
                          onClick={() => tts.speakingIdx === i ? tts.stop() : tts.speak(msg.content.replace(/\[\[(.+?)\]\]/g, '$1'), i, currentStop?.persona)}
                          className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          {tts.speakingIdx === i ? '■ Stop' : '▶ Listen'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="md:hidden space-y-2">
                  {messages.length > 0 && (
                    <form onSubmit={(e) => { e.preventDefault(); const v = searchInput.trim(); if (v) lookupTerm(v); setSearchInput('') }}>
                      <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Look up anything..."
                        className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </form>
                  )}
                  {selectedEntity && (
                    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-balance">{selectedEntity.label}</p>
                          {selectedEntity.description ? (
                            <p className="text-xs text-muted-foreground text-pretty">{selectedEntity.description}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground animate-pulse">Looking it up...</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedEntity(null)}
                          className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                          Close
                        </button>
                      </div>
                      <a
                        href={selectedEntity.wiki}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-primary underline underline-offset-2"
                      >
                        Simple English Wikipedia
                      </a>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              <aside className="hidden md:block md:col-span-1">
                <div className="sticky top-4 space-y-3">
                  {messages.length > 0 && (
                    <div className="rounded-2xl border bg-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-balance">Explorer Notes</p>
                          <p className="text-xs text-muted-foreground text-pretty">
                            Select text or search to explore.
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setShowMarks(p => !p)}
                            className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          >
                            {showMarks ? 'Hide' : 'Show'} marks
                          </button>
                          {selectedEntity && (
                            <button
                              type="button"
                              onClick={() => setSelectedEntity(null)}
                              className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); const v = searchInput.trim(); if (v) lookupTerm(v); setSearchInput('') }}>
                        <input
                          value={searchInput}
                          onChange={e => setSearchInput(e.target.value)}
                          placeholder="Look up anything..."
                          className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </form>

                      {selectedEntity ? (
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold text-balance">{selectedEntity.label}</p>
                            {selectedEntity.description ? (
                              <p className="text-xs text-muted-foreground text-pretty">{selectedEntity.description}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground animate-pulse">Looking it up...</p>
                            )}
                          </div>
                          <a
                            href={selectedEntity.wiki}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-primary underline underline-offset-2"
                          >
                            Simple English Wikipedia
                          </a>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground text-pretty">
                          Select text in the chat, tap a marked term, or search for anything.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-2xl border bg-card p-4 space-y-2">
                    <p className="text-sm font-semibold text-balance">Timeline Quick Look</p>
                    <p className="text-xs text-muted-foreground text-pretty tabular-nums">
                      {journey.length} {journey.length === 1 ? 'stop' : 'stops'} so far.
                    </p>
                    <button
                      onClick={viewTimeline}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      Open Timeline
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); sendText(input) }} className="max-w-2xl mx-auto flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${currentStop.persona.name} a question...`}
              disabled={isStreaming}
              className="flex-1 rounded-xl border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}
