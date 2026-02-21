'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { TIME_PERIODS } from '@/lib/time-periods'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PersonaBrowseItem {
  periodId: string
  era: string
  year: number
  yearLabel: string
  continent: string
  location: string
  periodColor: string
  name: string
  role: string
  age: number
  details: string
  portrait?: string
}

function buildItems(): PersonaBrowseItem[] {
  function continentFromCoords([lng, lat]: [number, number]): string {
    if (lat <= -10 && lng >= 110) return 'Oceania'
    if (lat >= 7 && lat <= 83 && lng >= -168 && lng <= -52) return 'North America'
    if (lat <= 15 && lng >= -92 && lng <= -34) return 'South America'
    if (lat >= 35 && lng >= -25 && lng <= 45) return 'Europe'
    if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 55) return 'Africa'
    if (lat >= -10 && lng >= 95 && lng <= 180) return 'Asia'
    return 'Other'
  }

  return TIME_PERIODS.flatMap(period =>
    period.personas.map(persona => ({
      periodId: period.id,
      era: period.era,
      year: period.year,
      yearLabel: period.yearLabel,
      continent: continentFromCoords(period.coordinates),
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
  const [eraFilter, setEraFilter] = useState('all')
  const [continentFilter, setContinentFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const items = useMemo(() => buildItems(), [])
  const eras = useMemo(
    () => Array.from(new Set(items.map(item => item.era))).sort((a, b) => a.localeCompare(b)),
    [items]
  )
  const continents = useMemo(
    () => Array.from(new Set(items.map(item => item.continent))).sort((a, b) => a.localeCompare(b)),
    [items]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const filteredItems = items.filter(item => {
      const matchesQuery = !q || [
        item.name,
        item.role,
        item.era,
        item.yearLabel,
        item.location,
        item.details,
      ].join(' ').toLowerCase().includes(q)

      const matchesEra = eraFilter === 'all' || item.era === eraFilter
      const matchesContinent = continentFilter === 'all' || item.continent === continentFilter

      return matchesQuery && matchesEra && matchesContinent
    })

    return [...filteredItems].sort((a, b) => (
      sortOrder === 'asc' ? a.year - b.year : b.year - a.year
    ))
  }, [items, query, eraFilter, continentFilter, sortOrder])

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

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Era</span>
            <select
              value={eraFilter}
              onChange={e => setEraFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              aria-label="Filter by era"
            >
              <option value="all">All eras</option>
              {eras.map(era => (
                <option key={era} value={era}>{era}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Continent</span>
            <select
              value={continentFilter}
              onChange={e => setContinentFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              aria-label="Filter by continent"
            >
              <option value="all">All continents</option>
              {continents.map(continent => (
                <option key={continent} value={continent}>{continent}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Sort by time</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              aria-label="Sort by time"
            >
              <option value="asc">Oldest → Newest</option>
              <option value="desc">Newest → Oldest</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setEraFilter('all')
                setContinentFilter('all')
                setSortOrder('asc')
              }}
              className="h-10 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm hover:bg-secondary/70"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(item => (
            <Card key={`${item.periodId}-${item.name}`} className="overflow-hidden h-full flex flex-col">
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
              <CardContent className="flex flex-1 flex-col justify-between gap-3">
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
