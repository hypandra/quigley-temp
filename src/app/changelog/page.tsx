'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { UPDATES, type ChangeEntry, type ChangeTerm } from './changes'

/** Parse markdown-style [text](url) links within plain text */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (match) {
          const [, label, href] = match
          const isExternal = href.startsWith('http')
          if (isExternal) {
            return (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {label}
              </a>
            )
          }
          return (
            <Link key={i} href={href} className="underline hover:text-foreground">
              {label}
            </Link>
          )
        }
        return part
      })}
    </>
  )
}

function TermBadge({ kind }: { kind: ChangeTerm['kind'] }) {
  const styles = {
    internal: 'bg-violet-100 text-violet-700',
    tool: 'bg-sky-100 text-sky-700',
    practice: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`ml-2 inline-block rounded px-1.5 py-0.5 text-xs ${styles[kind]}`}>
      {kind}
    </span>
  )
}

function EntryCard({ entry }: { entry: ChangeEntry }) {
  return (
    <article id={entry.id} className="rounded-xl border bg-card p-5 space-y-3 scroll-mt-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{entry.publishedAt}</p>
        <a href={`#${entry.id}`} className="no-underline hover:underline">
          <h2 className="mt-1 text-xl font-semibold">{entry.title}</h2>
        </a>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map(tag => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm leading-relaxed text-muted-foreground"><Linkify text={entry.summary} /></p>

      {entry.devNote && (
        <div className="border-l-2 border-muted pl-4">
          <p className="text-xs font-medium">Builder note</p>
          <p className="mt-1 text-sm text-muted-foreground"><Linkify text={entry.devNote} /></p>
        </div>
      )}

      {entry.terms && entry.terms.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
            Terms we used
          </summary>
          <dl className="mt-3 space-y-3">
            {entry.terms.map(term => (
              <div key={term.key} className="border-l-2 border-muted pl-4">
                <dt className="text-sm font-medium">
                  {term.label}
                  <TermBadge kind={term.kind} />
                </dt>
                <dd className="mt-0.5 text-sm text-muted-foreground">
                  <Linkify text={term.description} />
                  {term.note && (
                    <span className="ml-1 italic opacity-70">{term.note}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </article>
  )
}

export default function ChangelogPage() {
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest')

  const entries = useMemo(() => {
    const sorted = [...UPDATES]
    if (sortOrder === 'oldest') sorted.reverse()
    return sorted
  }, [sortOrder])

  return (
    <main className="min-h-dvh px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Rippled Echoes</p>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="text-sm text-muted-foreground">What we built and why it matters.</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {UPDATES.length} update{UPDATES.length !== 1 ? 's' : ''}
          </span>
          <div className="flex overflow-hidden rounded-lg border">
            <button
              onClick={() => setSortOrder('latest')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                sortOrder === 'latest'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Latest first
            </button>
            <button
              onClick={() => setSortOrder('oldest')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                sortOrder === 'oldest'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Oldest first
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Something you want explained? Something we should build next? We&apos;re curious too — <a href="mailto:support@hypandra.com" className="underline hover:text-foreground">support@hypandra.com</a>.
        </p>

        <div className="pt-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Time Machine
          </Link>
        </div>
      </div>
    </main>
  )
}
