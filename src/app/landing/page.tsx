'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { config } from '@/lib/config'
import { themes, type ThemeName } from '@/lib/themes'
import { Sparkles, Upload, Zap, Shield, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Zap,
    title: 'Fast setup',
    description: 'Authentication, database, and file storage ready out of the box.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    description: 'BetterAuth handles sessions, SSL connections to Supabase.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered',
    description: 'Generate images with Gemini AI, stored on BunnyCDN.',
  },
  {
    icon: Upload,
    title: 'File uploads',
    description: 'Upload and serve files from a global CDN.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up with email and password in seconds.',
  },
  {
    number: '02',
    title: 'Start building',
    description: 'Use the dashboard to explore features and APIs.',
  },
  {
    number: '03',
    title: 'Ship it',
    description: 'Deploy to Vercel with a single command.',
  },
]

export default function LandingPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default')
  const t = themes[currentTheme]

  return (
    <div className={cn('min-h-screen', t.container)}>
      {/* Background gradient */}
      <div className={cn('absolute inset-0 -z-10', t.background)} />
      <div className={cn('absolute -top-40 right-0 h-80 w-80', t.backgroundAccents)} />
      <div className={cn('absolute top-1/2 left-0 h-64 w-64', t.backgroundAccents)} />

      {/* Header */}
      <header className={cn('max-w-6xl mx-auto px-6 py-8 flex items-center justify-between', t.header)}>
        <div className="flex items-center gap-3">
          <span className={cn(t.headingFont, t.logo)}>
            {config.name}
          </span>
        </div>
        <nav className={cn('hidden md:flex items-center gap-6 text-sm', t.bodyFont)}>
          <Link href="#features" className={t.navLink}>
            Features
          </Link>
          <Link href="#how" className={t.navLink}>
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className={t.buttonGhost}>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild className={t.buttonPrimary}>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Theme Switcher - Fixed position */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {/* Hero */}
        <section className={cn('lg:py-32', t.sectionSpacing)}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className={cn(t.bodyFont, t.sectionSubtitle)}>
              Built with Next.js, Supabase & BunnyCDN
            </p>
            <h1 className={cn(t.headingFont, t.heroTitle)}>
              Your next project,
              <span className={cn('block', currentTheme === 'playful' ? '' : 'text-primary')}>
                ready to ship.
              </span>
            </h1>
            <p className={cn(t.bodyFont, t.heroSubtitle, 'max-w-xl mx-auto')}>
              {config.name} gives you authentication, database, file storage, and AI
              features out of the box. Focus on what makes your app unique.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button size="lg" asChild className={t.buttonPrimary}>
                <Link href="/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className={t.buttonSecondary}>
                <Link href="#features">See features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className={cn(t.sectionSpacing, t.section)}>
          <div className="text-center mb-12">
            <p className={cn(t.bodyFont, t.sectionSubtitle, 'mb-3')}>
              Features
            </p>
            <h2 className={cn(t.headingFont, t.sectionTitle)}>Everything you need to build</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className={t.card}>
                <CardContent className={t.cardContent}>
                  <feature.icon className={cn(t.icon, 'mb-4')} />
                  <h3 className={cn(t.headingFont, 'font-semibold mb-2')}>{feature.title}</h3>
                  <p className={cn(t.bodyFont, t.bodyText)}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className={cn(t.sectionSpacing, t.section)}>
          <div className="text-center mb-12">
            <p className={cn(t.bodyFont, t.sectionSubtitle, 'mb-3')}>
              How it works
            </p>
            <h2 className={cn(t.headingFont, t.sectionTitle)}>Get started in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className={cn(t.headingFont, t.stepNumber, 'mb-4')}>{step.number}</div>
                <h3 className={cn(t.headingFont, 'font-semibold mb-2')}>{step.title}</h3>
                <p className={cn(t.bodyFont, t.bodyText)}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={t.sectionSpacing}>
          <Card className={t.ctaCard}>
            <CardContent className="py-12 text-center">
              <h2 className={cn(t.headingFont, t.ctaTitle, 'mb-4')}>
                Ready to get started?
              </h2>
              <p className={cn(t.bodyFont, t.ctaText, 'mb-6 max-w-md mx-auto')}>
                Create your account and start building in less than a minute.
              </p>
              <Button size="lg" variant="secondary" asChild className={t.ctaButton}>
                <Link href="/signup">
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className={t.footer}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={cn(t.bodyFont, t.bodyText)}>
            © {new Date().getFullYear()} {config.name}. All rights reserved.
          </p>
          <div className={cn('flex items-center gap-6', t.bodyFont)}>
            <Link href="/login" className={t.navLink}>
              Sign in
            </Link>
            <Link href="/signup" className={t.navLink}>
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
