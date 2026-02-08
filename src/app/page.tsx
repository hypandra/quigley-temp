'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { TimePeriod, Persona, getRandomPeriod, getRandomPersona } from '@/lib/time-periods'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function useTTS() {
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null)

  const speak = useCallback((text: string, idx: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1

    // Pick a good voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel')
    ) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

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

  return { speakingIdx, speak, stop }
}

interface JourneyStop {
  period: TimePeriod
  persona: Persona
}

type AppState = 'home' | 'arriving' | 'chatting' | 'effects'

export default function Home() {
  const [state, setState] = useState<AppState>('home')
  const [journey, setJourney] = useState<JourneyStop[]>([])
  const [currentStop, setCurrentStop] = useState<JourneyStop | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const tts = useTTS()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  function jump() {
    const lastId = currentStop?.period.id
    const period = getRandomPeriod(lastId)
    const persona = getRandomPersona(period)
    const nextStop = { period, persona }

    tts.stop()
    setCurrentStop(nextStop)
    setJourney(prev => [...prev, nextStop])
    setMessages([])
    setShowEffects(false)
    setState('arriving')

    setTimeout(() => setState('chatting'), 2000)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming || !currentStop) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          persona: currentStop.persona,
          era: currentStop.period.era,
          year: currentStop.period.yearLabel,
          location: currentStop.period.location,
        }),
      })

      if (!response.ok) throw new Error('Chat request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantContent = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
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
    setState('effects')
  }

  // HOME SCREEN
  if (state === 'home') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight text-primary">Rippled Echoes</h1>
            <p className="text-lg text-muted-foreground">A time machine for curious kids</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Jump to a random moment in history. Meet someone who lived there.
            Ask them anything about their life. Then see how their world shaped yours.
          </p>

          <button
            onClick={jump}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
          >
            Enter the Time Machine
          </button>

          {journey.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {journey.length} {journey.length === 1 ? 'era' : 'eras'} visited
            </p>
          )}
        </div>
      </div>
    )
  }

  // ARRIVING SCREEN
  if (state === 'arriving' && currentStop) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="max-w-md space-y-6">
          <div
            className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: currentStop.period.color + '22', border: `2px solid ${currentStop.period.color}` }}
          >
            ⏳
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Traveling to...</p>
            <h2 className="text-3xl font-bold" style={{ color: currentStop.period.color }}>
              {currentStop.period.era}
            </h2>
            <p className="text-muted-foreground">
              {currentStop.period.location} &middot; {currentStop.period.yearLabel}
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStop.period.description}
          </p>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              You&apos;ll meet <strong className="text-foreground">{currentStop.persona.name}</strong>, a {currentStop.persona.age}-year-old {currentStop.persona.role}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // CHAT + EFFECTS SCREEN
  if ((state === 'chatting' || state === 'effects') && currentStop) {
    return (
      <div className="flex flex-col h-dvh">
        {/* Header */}
        <div className="shrink-0 border-b px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: currentStop.period.color + '22', color: currentStop.period.color }}
              >
                {currentStop.persona.name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{currentStop.persona.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentStop.persona.role} &middot; {currentStop.period.yearLabel}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={viewEffects}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Effects
              </button>
              <button
                onClick={jump}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Jump ⚡
              </button>
            </div>
          </div>
        </div>

        {/* Effects panel (overlay) */}
        {showEffects && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
            <div className="shrink-0 border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">How {currentStop.period.era} Changed the World</h3>
              <button
                onClick={() => { setShowEffects(false); setState('chatting') }}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Back to Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-md mx-auto space-y-4">
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
                          <p className="text-sm" style={{ color: currentStop.period.color }}>{effect.cause}</p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>↓</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now</p>
                          <p className="text-sm text-foreground">{effect.effect}</p>
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
                          className="text-xs px-2 py-1 rounded-md"
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-3 animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  You&apos;ve arrived in <strong style={{ color: currentStop.period.color }}>{currentStop.period.location}</strong>, {currentStop.period.yearLabel}
                </p>
                <p className="text-sm text-muted-foreground">
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
                      onClick={() => setInput(q)}
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] ${msg.role === 'assistant' ? 'group' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border rounded-bl-md'
                    }`}
                  >
                    {msg.content || (isStreaming ? '...' : '')}
                  </div>
                  {msg.role === 'assistant' && msg.content && !isStreaming && (
                    <button
                      onClick={() => tts.speakingIdx === i ? tts.stop() : tts.speak(msg.content, i)}
                      className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      {tts.speakingIdx === i ? '■ Stop' : '▶ Listen'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t p-4">
          <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-2">
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
