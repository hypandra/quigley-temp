export type ChangeTermKind = 'internal' | 'tool' | 'practice'

export interface ChangeTerm {
  key: string
  label: string
  description: string
  kind: ChangeTermKind
  note?: string
}

export interface ChangeEntry {
  id: string
  title: string
  summary: string
  devNote?: string
  publishedAt: string
  tags?: string[]
  terms?: ChangeTerm[]
}

export const UPDATES: ChangeEntry[] = [
  {
    id: '2026-02-21-browse-personas',
    title: 'Browse all personas',
    summary:
      'A new [/browse](/browse) page lets you see every persona at once — search by name, filter by era or region, and jump straight into a conversation. Each card shows the portrait, era, and a short description.',
    devNote:
      '[/browse](/browse) page with client-side search and filter. Deep links via /?era=...&persona=... persist across refresh. Browse filters refined across two follow-up commits for sizing and metadata display.',
    publishedAt: '2026-02-21',
    tags: ['Navigation', 'Browse'],
    terms: [
      {
        key: 'deep-link',
        label: 'Deep link',
        description:
          'A URL that takes you directly to a specific persona and era — like [rippledechoes.com/?era=medieval-west-africa&persona=Aminata&view=arrive](/?era=medieval-west-africa&persona=Aminata&view=arrive). You can bookmark it or share it with someone.',
        kind: 'practice',
      },
    ],
  },
  {
    id: '2026-02-21-72-personas',
    title: '72 personas across six continents',
    summary:
      'The world got much bigger. New personas span Africa, South America, Oceania, East Asia, Europe, and North America — from a young Inca messenger to a Polynesian navigator. Every new persona has an illustrated portrait in the same children\'s book style. See them all on the [/browse](/browse) page.',
    devNote:
      '58 new portraits generated via Gemini 2.5 Flash. Total: 72 personas. Portraits wired via time-periods.ts. Browse page added with search and filter by era/region.',
    publishedAt: '2026-02-21',
    tags: ['Content', 'Personas', 'Art'],
  },
  {
    id: '2026-02-12-mobile-fixes',
    title: 'Mobile layout fixes',
    summary:
      'Thanks to a bug report from a user: the timeline no longer overlaps on small screens — entries stack in reading order instead of floating at percentage offsets. The chat input no longer triggers iOS auto-zoom, and the curiosity badge hides when your keyboard is open.',
    devNote:
      'Replaced absolute positioning with vertical document flow for timeline. Set text-base on mobile inputs and skip auto-focus on small screens to prevent iOS zoom. CSS media query hides badge when virtual keyboard is active.',
    publishedAt: '2026-02-12',
    tags: ['Mobile', 'UX'],
    terms: [
      {
        key: 'ios-auto-zoom',
        label: 'iOS auto-zoom',
        description:
          'iPhones zoom into any input field with font smaller than 16px. Setting text-base (16px) on mobile prevents it.',
        kind: 'practice',
      },
    ],
  },
  {
    id: '2026-02-06-globe',
    title: 'Interactive globe showing your journey',
    summary:
      'A spinning globe now shows where in the world your conversations have taken you. Great-circle arcs connect your stops, and each era gets its own color marker. No API key needed — the map data is bundled with the app.',
    devNote:
      'MapLibre GL JS with globe projection. Self-contained: Natural Earth land GeoJSON bundled, no external tile server. Auto-spin pauses on interaction. Era-colored markers with great-circle arc lines between journey stops.',
    publishedAt: '2026-02-06',
    tags: ['Globe', 'Visualization'],
    terms: [
      {
        key: 'maplibre-gl',
        label: 'MapLibre GL',
        description:
          'An open-source map library that renders the interactive globe. See [maplibre.org](https://maplibre.org/).',
        kind: 'tool',
        note: 'We chose it; we could swap later.',
      },
      {
        key: 'great-circle-arc',
        label: 'Great-circle arc',
        description:
          'The shortest path between two points on a sphere — the curved lines connecting your journey stops on the globe.',
        kind: 'practice',
      },
    ],
  },
  {
    id: '2026-02-05-portraits',
    title: 'Illustrated persona portraits',
    summary:
      'Every persona now has a portrait — illustrated in a children\'s book style. You\'ll see them as circular avatars when you arrive in an era and in the chat header while you\'re talking.',
    devNote:
      'Generated via Gemini 2.5 Flash Image through OpenRouter. Bun script (scripts/generate-portraits.ts) with retry logic and idempotent re-runs (--only, --force flags). 12 initial portraits stored as static PNGs in public/portraits/. Fallback chain: portrait > emoji > first letter.',
    publishedAt: '2026-02-05',
    tags: ['Art', 'Personas'],
    terms: [
      {
        key: 'gemini-flash-image',
        label: 'Gemini 2.5 Flash Image',
        description:
          'Google\'s image generation model. We use it through [OpenRouter](https://openrouter.ai/) to create the portrait illustrations.',
        kind: 'tool',
        note: 'We chose it; we could swap models later.',
      },
    ],
  },
  {
    id: '2026-02-04-here-and-now',
    title: '"Here & Now" navigation and journey threads',
    summary:
      'The home screen now frames your starting point: "You are here and now." When you jump between eras, you see connection cards — AI-generated threads explaining how one era\'s ideas rippled into another. Your journey panel shows these connections above the static history effects.',
    devNote:
      'New /api/connections endpoint generates LLM-powered threads on era-to-era jumps. "RE" logo replaced with "Here & Now" button. Arriving interstitial shows "Leaving [era]..." with connection context. Ripples panel restructured: dynamic journey threads above static effect cards.',
    publishedAt: '2026-02-04',
    tags: ['Navigation', 'AI', 'UX'],
    terms: [
      {
        key: 'journey-threads',
        label: 'Journey threads',
        description:
          'AI-generated explanations of how ideas from one era connect to another. They appear when you travel between time periods.',
        kind: 'internal',
        note: 'Our name — these are experimental.',
      },
      {
        key: 'ripples',
        label: 'Ripples',
        description:
          'The panel showing how a time period\'s ideas spread through history.',
        kind: 'internal',
      },
    ],
  },
  {
    id: '2026-02-03-launch',
    title: 'First working version: time-travel conversations with historical personas',
    summary:
      'The core experience is live — pick a time period, meet a persona from that era, and have a conversation. Six eras span medieval West Africa to Han Dynasty China. Each persona speaks in kid-friendly language and can mention real historical people and events with Wikipedia links.',
    devNote:
      'Stripped the CB template (auth, image generation, demos) and built the chat interface from scratch. LLM chat uses OpenRouter with a system prompt tuned for young audiences. Initial eras: 6, with 2 personas each.',
    publishedAt: '2026-02-03',
    tags: ['Launch', 'Chat', 'Content'],
    terms: [
      {
        key: 'persona',
        label: 'Persona',
        description:
          'A fictional character grounded in a real time and place. You chat with them as if visiting their world.',
        kind: 'internal',
        note: 'Our name — we could rename it later.',
      },
      {
        key: 'era',
        label: 'Era',
        description:
          'A time period and region the app lets you visit — like "Medieval West Africa" or "Han Dynasty China."',
        kind: 'internal',
        note: 'Our name for the groupings.',
      },
      {
        key: 'openrouter',
        label: 'OpenRouter',
        description:
          'The service that connects us to AI language models. See [openrouter.ai](https://openrouter.ai/).',
        kind: 'tool',
        note: 'We chose it; we could swap providers later.',
      },
    ],
  },
]
