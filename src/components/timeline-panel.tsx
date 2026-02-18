'use client'

import { useMemo, useState } from 'react'
import { Persona, TimePeriod } from '@/lib/time-periods'
import { TIMELINE_EVENTS } from '@/lib/timeline-events'
import { cn } from '@/lib/utils'

interface JourneyStop {
  period: TimePeriod
  persona: Persona
}

interface TimelinePanelProps {
  currentStop: JourneyStop
  journey: JourneyStop[]
  onClose: () => void
  onJump: () => void
}

interface TimelineItem {
  type: 'stop' | 'event'
  key: string
  year: number
  yearLabel: string
  name: string
  subtitle: string
  distance: string
  color?: string
  isCurrent: boolean
}

const MOBILE_EVENT_BUCKET_YEARS = 300

function formatYearsAgo(year: number, currentYear: number) {
  const diff = Math.max(0, currentYear - year)
  const rounded = diff >= 1000 ? Math.round(diff / 100) * 100 : diff
  const formatter = new Intl.NumberFormat('en-US')
  return diff >= 1000
    ? `~${formatter.format(rounded)} years ago`
    : `${formatter.format(diff)} years ago`
}

function TimelineRow({ item, showSolidEventBorder = false }: { item: TimelineItem; showSolidEventBorder?: boolean }) {
  return (
    <div className="flex min-h-24 gap-3 py-1.5">
      <div className="flex w-5 shrink-0 flex-col items-center">
        {item.type === 'stop' ? (
          <div
            className="mt-3 size-3 shrink-0 rounded-full border-2 border-background"
            style={{ backgroundColor: item.color }}
          />
        ) : (
          <div className="mt-3 size-2 shrink-0 rounded-full bg-muted-foreground/60" />
        )}
        <div className={cn('mt-1 w-px flex-1 min-h-3', item.type === 'stop' ? 'bg-border' : 'bg-border/50')} />
      </div>
      <div
        className={cn(
          'mb-3 flex-1 flex-none rounded-xl border px-3 py-3',
          item.type === 'event'
            ? showSolidEventBorder
              ? 'border-border/60 bg-background/30'
              : 'border-dashed border-border bg-background/40'
            : item.isCurrent
              ? 'border-primary/40 bg-primary/20'
              : 'bg-background/60'
        )}
      >
        <p
          className={cn(
            'text-balance font-semibold text-foreground',
            item.type === 'event' ? 'text-xs' : 'text-sm'
          )}
        >
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {item.yearLabel} · {item.distance}
        </p>
        <p className="text-xs text-foreground/85 text-pretty">{item.subtitle}</p>
      </div>
    </div>
  )
}

export default function TimelinePanel({ currentStop, journey, onClose, onJump }: TimelinePanelProps) {
  const [showAllMobileEvents, setShowAllMobileEvents] = useState(false)
  const currentYear = new Date().getFullYear()

  const timelineStops = useMemo(() => journey.map((stop, index) => ({
    key: `${stop.period.id}-${index}`,
    name: stop.period.era,
    year: stop.period.year,
    yearLabel: stop.period.yearLabel,
    subtitle: stop.period.location,
    color: stop.period.color,
    distance: formatYearsAgo(stop.period.year, currentYear),
    isCurrent: stop.period.year === currentStop.period.year,
    type: 'stop' as const,
  })), [currentStop.period.year, currentYear, journey])

  const oldestStop = useMemo(() => timelineStops.reduce<typeof timelineStops[number] | null>((oldest, stop) => {
    if (!oldest) return stop
    return stop.year < oldest.year ? stop : oldest
  }, null), [timelineStops])

  const mergedTimeline = useMemo<TimelineItem[]>(() => {
    const events: TimelineItem[] = TIMELINE_EVENTS.map((event) => ({
      type: 'event',
      key: event.id,
      year: event.year,
      yearLabel: event.yearLabel,
      name: event.label,
      subtitle: event.description,
      distance: formatYearsAgo(event.year, currentYear),
      isCurrent: false,
    }))
    return [...timelineStops, ...events].sort((a, b) => b.year - a.year)
  }, [currentYear, timelineStops])

  const condensedMobileTimeline = useMemo(() => {
    const seenBuckets = new Set<number>()
    const items: TimelineItem[] = []
    let hiddenEventsCount = 0

    for (const item of mergedTimeline) {
      if (item.type === 'stop') {
        items.push(item)
        continue
      }

      const bucket = Math.floor(item.year / MOBILE_EVENT_BUCKET_YEARS)
      if (seenBuckets.has(bucket)) {
        hiddenEventsCount += 1
        continue
      }
      seenBuckets.add(bucket)
      items.push(item)
    }

    return { items, hiddenEventsCount }
  }, [mergedTimeline])

  const mobileItems = showAllMobileEvents ? mergedTimeline : condensedMobileTimeline.items

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background/95">
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-balance sm:text-base">Your Timeline</h3>
            <p className="text-xs text-muted-foreground text-pretty">
              See how far back you have traveled so far.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/80"
          >
            Back to Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {journey.length === 0 ? (
            <div className="space-y-3 rounded-2xl border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground text-pretty">
                Your timeline is waiting. Jump to an era to start exploring history.
              </p>
              <button
                onClick={onJump}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Jump to First Era
              </button>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border bg-card p-4 md:p-6">
              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <span className="tabular-nums">Now · {currentYear} CE</span>
                <span className="tabular-nums">Oldest · {oldestStop?.yearLabel ?? 'Unknown'}</span>
              </div>

              <div className="md:hidden">
                {mobileItems.map((item) => (
                  <TimelineRow key={`mobile-${item.key}`} item={item} showSolidEventBorder />
                ))}
                {condensedMobileTimeline.hiddenEventsCount > 0 && (
                  <button
                    onClick={() => setShowAllMobileEvents(prev => !prev)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/50"
                  >
                    {showAllMobileEvents
                      ? 'Show fewer timeline events'
                      : `Show ${condensedMobileTimeline.hiddenEventsCount} more timeline events`}
                  </button>
                )}
              </div>

              <div className="hidden md:block">
                {mergedTimeline.map((item) => (
                  <TimelineRow key={`desktop-${item.key}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
