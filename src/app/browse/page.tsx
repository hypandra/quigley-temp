'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { TIME_PERIODS } from '@/lib/time-periods'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PersonaBrowseItem {
  periodId: string
  era: string
  yearLabel: string
  location: string
  periodColor: string
  name: string
  role: string
  age: number
  details: string
  portrait?: string
}

function buildItems(): PersonaBrowseItem[] {
  return TIME_PERIODS.flatMap(period =>
    period.personas.map(persona => ({
      periodId: period.id,
      era: period.era,
      yearLabel: period.yearLabel,
      location: period.location,
      periodColor: period.color,
      name: persona.name,
      role: persona.role,
      age: persona.age,
      details: persona.details,
      portrait: persona.portrait,
    }))
  )
}

export default function BrowsePage() {
  const [query, setQuery] = useState('')
  const items = useMemo(() => buildItems(), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(item =>
      [
        item.name,
        item.role,
        item.era,
        item.yearLabel,
        item.location,
        item.details,
      ].join(' ').toLowerCase().includes(q)
    )
  }, [items, query])

  return (
    <main className="min-h-dvh px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Rippled Echoes</p>
          <h1 className="text-3xl font-bold">Browse Personas</h1>
          <p className="text-sm text-muted-foreground">
            Search by name, era, location, or role. Pick anyone to jump directly into chat.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search personas, eras, places..."
            aria-label="Search personas"
            className="h-10"
          />
          <p className="text-sm text-muted-foreground">{filtered.length} match{filtered.length === 1 ? '' : 'es'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(item => (
            <Card key={`${item.periodId}-${item.name}`} className="overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  {item.portrait ? (
                    <img
                      src={item.portrait}
                      alt={item.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-semibold"
                      style={{ backgroundColor: item.periodColor + '22', color: item.periodColor }}
                    >
                      {item.name[0]}
                    </div>
                  )}
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.age} · {item.role}</p>
                  </div>
                </div>
                <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: item.periodColor + '22' }}>
                  <p style={{ color: item.periodColor }} className="font-medium">{item.era}</p>
                  <p className="text-muted-foreground">{item.location} · {item.yearLabel}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-4">{item.details}</p>
                <Link
                  href={`/?era=${encodeURIComponent(item.periodId)}&persona=${encodeURIComponent(item.name)}`}
                  className="inline-flex rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Talk to {item.name}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No matches found. Try a broader term like a region (`Africa`), era (`Industrial`), or role (`apprentice`).
          </div>
        )}

        <div className="pt-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Time Machine
          </Link>
        </div>
      </div>
    </main>
  )
}
