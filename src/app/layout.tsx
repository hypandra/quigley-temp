import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rippled Echoes — Time Machine for Curious Kids',
  description: 'Travel through time, meet people from history, and discover how the past connects to today.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Script
          src="https://hypandra.com/embed/curiosity-badge.js"
          strategy="lazyOnload"
          type="module"
        />
        {/* @ts-expect-error - Custom element from external script */}
        <curiosity-badge project="rippledechoes" />
      </body>
    </html>
  )
}
