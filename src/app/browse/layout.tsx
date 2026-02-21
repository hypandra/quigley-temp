import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Historical Personas | Rippled Echoes',
  description: 'Explore every Rippled Echoes character by era, place, and role. Search the full cast and jump straight into a conversation with anyone from history.',
  openGraph: {
    title: 'Browse Historical Personas | Rippled Echoes',
    description: 'Explore every Rippled Echoes character by era, place, and role. Search the full cast and jump straight into a conversation with anyone from history.',
    type: 'website',
    url: 'https://rippledechoes.com/browse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Historical Personas | Rippled Echoes',
    description: 'Explore every Rippled Echoes character by era, place, and role. Search the full cast and jump straight into a conversation with anyone from history.',
  },
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
