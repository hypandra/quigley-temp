import Link from 'next/link'

const CHANGELOG = [
  {
    date: '2026-02-21',
    title: 'Persona Expansion + Browse',
    items: [
      'Added major new historical personas across Africa, South America, Oceania, East Asia, Europe, and North America.',
      'Added direct deep links for persona chats via `/?era=...&persona=...`.',
      'Added new `/browse` page with search and persona cards.',
      'Temporarily disabled AI-generated journey thread connections.',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <main className="min-h-dvh px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Rippled Echoes</p>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="text-sm text-muted-foreground">Recent product and content updates.</p>
        </div>

        <div className="space-y-4">
          {CHANGELOG.map(entry => (
            <section key={entry.date} className="rounded-xl border bg-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{entry.date}</p>
              <h2 className="mt-1 text-xl font-semibold">{entry.title}</h2>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {entry.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="pt-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Time Machine
          </Link>
        </div>
      </div>
    </main>
  )
}
