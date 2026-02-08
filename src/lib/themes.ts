/**
 * Theme definitions for the landing page
 * Each theme significantly changes the visual style, not just colors
 */

export type ThemeName = 'default' | 'brutalist' | 'glass' | 'editorial' | 'playful'

export interface ThemeConfig {
  name: string
  description: string
  // Container/page styles
  container: string
  // Background treatment
  background: string
  backgroundAccents: string
  // Typography
  headingFont: string
  bodyFont: string
  heroTitle: string
  heroSubtitle: string
  sectionTitle: string
  sectionSubtitle: string
  bodyText: string
  // Cards
  card: string
  cardContent: string
  // Buttons
  buttonPrimary: string
  buttonSecondary: string
  buttonGhost: string
  // Sections
  section: string
  sectionSpacing: string
  // Feature icons
  icon: string
  // Step numbers
  stepNumber: string
  // CTA section
  ctaCard: string
  ctaTitle: string
  ctaText: string
  ctaButton: string
  // Header
  header: string
  logo: string
  navLink: string
  // Footer
  footer: string
}

export const themes: Record<ThemeName, ThemeConfig> = {
  default: {
    name: 'Default',
    description: 'Clean and minimal',
    container: '',
    background: 'bg-gradient-to-b from-muted/50 via-background to-background',
    backgroundAccents: 'bg-primary/5 blur-3xl rounded-full',
    headingFont: 'font-sans',
    bodyFont: 'font-sans',
    heroTitle: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
    heroSubtitle: 'text-lg text-muted-foreground',
    sectionTitle: 'text-3xl font-bold',
    sectionSubtitle: 'text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground',
    bodyText: 'text-sm text-muted-foreground',
    card: 'border-border/50 bg-card',
    cardContent: 'pt-6',
    buttonPrimary: '',
    buttonSecondary: '',
    buttonGhost: '',
    section: '',
    sectionSpacing: 'py-20',
    icon: 'h-10 w-10 text-primary',
    stepNumber: 'text-6xl font-bold text-muted/30',
    ctaCard: 'bg-primary text-primary-foreground',
    ctaTitle: 'text-2xl md:text-3xl font-bold',
    ctaText: 'text-primary-foreground/80',
    ctaButton: '',
    header: '',
    logo: 'text-sm font-semibold uppercase tracking-widest text-muted-foreground',
    navLink: 'hover:text-foreground transition-colors text-muted-foreground',
    footer: 'border-t',
  },

  brutalist: {
    name: 'Brutalist',
    description: 'Bold and raw',
    container: 'bg-gray-100',
    background: 'bg-gradient-to-br from-gray-100 to-gray-200',
    backgroundAccents: 'hidden',
    headingFont: 'font-mono',
    bodyFont: 'font-sans',
    heroTitle: 'text-4xl md:text-6xl lg:text-7xl font-black leading-none uppercase tracking-tight',
    heroSubtitle: 'text-lg font-medium',
    sectionTitle: 'text-3xl font-black uppercase tracking-tight',
    sectionSubtitle: 'text-xs font-bold uppercase tracking-widest border-b-4 border-black inline-block pb-1',
    bodyText: 'text-sm',
    card: 'border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all',
    cardContent: 'pt-6',
    buttonPrimary: 'bg-cyan-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none font-black uppercase tracking-wider',
    buttonSecondary: 'bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white rounded-none font-bold uppercase',
    buttonGhost: 'border-2 border-black rounded-none font-bold uppercase hover:bg-black hover:text-white',
    section: '',
    sectionSpacing: 'py-16',
    icon: 'h-12 w-12 text-black',
    stepNumber: 'text-7xl font-black text-black/20',
    ctaCard: 'bg-black text-white border-4 border-black rounded-none',
    ctaTitle: 'text-2xl md:text-4xl font-black uppercase',
    ctaText: 'text-gray-300',
    ctaButton: 'bg-cyan-400 text-black border-2 border-white hover:bg-white font-black uppercase',
    header: 'border-b-4 border-black',
    logo: 'text-sm font-black uppercase tracking-widest',
    navLink: 'hover:underline underline-offset-4 decoration-2 font-bold uppercase text-sm',
    footer: 'border-t-4 border-black bg-black text-white',
  },

  glass: {
    name: 'Glass',
    description: 'Soft and ethereal',
    container: '',
    background: 'bg-gradient-to-br from-sky-100 via-white to-emerald-100',
    backgroundAccents: 'bg-gradient-to-r from-sky-300/30 to-emerald-300/30 blur-3xl rounded-full',
    headingFont: 'font-serif',
    bodyFont: 'font-sans',
    heroTitle: 'text-4xl md:text-5xl lg:text-7xl font-semibold leading-tight',
    heroSubtitle: 'text-xl text-gray-600',
    sectionTitle: 'text-4xl font-semibold',
    sectionSubtitle: 'text-sm font-medium tracking-wider text-gray-500',
    bodyText: 'text-base text-gray-600',
    card: 'bg-white/40 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-sky-200/20',
    cardContent: 'p-8',
    buttonPrimary: 'rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 text-white shadow-lg hover:shadow-emerald-200/60 hover:scale-105 transition-all border-0',
    buttonSecondary: 'rounded-full bg-white/60 backdrop-blur border border-white/40 hover:bg-white/80 shadow-lg',
    buttonGhost: 'rounded-full hover:bg-white/40',
    section: '',
    sectionSpacing: 'py-24',
    icon: 'h-10 w-10 text-sky-500',
    stepNumber: 'text-6xl font-light text-sky-200',
    ctaCard: 'bg-gradient-to-r from-sky-500 to-emerald-400 text-white rounded-3xl shadow-2xl shadow-sky-300/30',
    ctaTitle: 'text-2xl md:text-4xl font-semibold',
    ctaText: 'text-white/90',
    ctaButton: 'bg-white text-gray-900 hover:bg-white/90 rounded-full shadow-lg',
    header: 'backdrop-blur-xl bg-white/30',
    logo: 'text-sm font-semibold tracking-wider text-gray-700',
    navLink: 'hover:text-sky-600 transition-colors text-gray-600',
    footer: 'border-t border-white/30 backdrop-blur-xl bg-white/30',
  },

  editorial: {
    name: 'Editorial',
    description: 'Magazine elegance',
    container: 'bg-stone-50',
    background: 'bg-stone-50',
    backgroundAccents: 'hidden',
    headingFont: 'font-serif',
    bodyFont: 'font-serif',
    heroTitle: 'text-5xl md:text-6xl lg:text-8xl font-light leading-[0.9] tracking-tight',
    heroSubtitle: 'text-xl font-light text-stone-600 leading-relaxed',
    sectionTitle: 'text-4xl font-light tracking-tight',
    sectionSubtitle: 'text-[10px] font-medium uppercase tracking-[0.4em] text-stone-400 border-b border-stone-300 pb-2',
    bodyText: 'text-base text-stone-600 leading-relaxed',
    card: 'border-0 bg-transparent shadow-none',
    cardContent: 'pt-8 border-t border-stone-200',
    buttonPrimary: 'bg-stone-900 text-stone-50 rounded-none px-8 py-3 text-sm tracking-wider hover:bg-stone-800',
    buttonSecondary: 'bg-transparent text-stone-900 border border-stone-900 rounded-none px-8 py-3 text-sm tracking-wider hover:bg-stone-900 hover:text-white',
    buttonGhost: 'rounded-none text-stone-600 hover:text-stone-900 underline underline-offset-4',
    section: 'border-b border-stone-200 last:border-0',
    sectionSpacing: 'py-24 lg:py-32',
    icon: 'h-8 w-8 text-stone-400',
    stepNumber: 'text-8xl font-extralight text-stone-200',
    ctaCard: 'bg-stone-900 text-stone-50 rounded-none',
    ctaTitle: 'text-3xl md:text-4xl font-light',
    ctaText: 'text-stone-400 font-light',
    ctaButton: 'bg-stone-50 text-stone-900 hover:bg-white rounded-none tracking-wider',
    header: 'border-b border-stone-200',
    logo: 'text-xs font-medium uppercase tracking-[0.3em] text-stone-900',
    navLink: 'hover:text-stone-900 transition-colors text-stone-500 text-sm tracking-wide',
    footer: 'border-t border-stone-200',
  },

  playful: {
    name: 'Playful',
    description: 'Fun and colorful',
    container: 'bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50',
    background: 'bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50',
    backgroundAccents: 'bg-gradient-to-r from-violet-300/40 to-pink-300/40 blur-3xl rounded-full animate-pulse',
    headingFont: 'font-sans',
    bodyFont: 'font-sans',
    heroTitle: 'text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent',
    heroSubtitle: 'text-lg text-gray-600',
    sectionTitle: 'text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent',
    sectionSubtitle: 'text-xs font-bold uppercase tracking-widest text-pink-500',
    bodyText: 'text-sm text-gray-600',
    card: 'bg-white rounded-3xl shadow-xl shadow-violet-100 border-2 border-violet-100 hover:border-violet-300 hover:shadow-violet-200 hover:-translate-y-1 transition-all',
    cardContent: 'p-6',
    buttonPrimary: 'rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-105 transition-all font-bold',
    buttonSecondary: 'rounded-full bg-white border-2 border-violet-200 text-violet-600 hover:border-violet-400 hover:bg-violet-50 font-semibold',
    buttonGhost: 'rounded-full hover:bg-violet-100 text-violet-600',
    section: '',
    sectionSpacing: 'py-16',
    icon: 'h-12 w-12 text-violet-500',
    stepNumber: 'text-6xl font-extrabold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent',
    ctaCard: 'bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 text-white rounded-3xl shadow-2xl shadow-violet-200',
    ctaTitle: 'text-2xl md:text-3xl font-bold',
    ctaText: 'text-white/90',
    ctaButton: 'bg-white text-violet-600 hover:bg-violet-50 rounded-full font-bold shadow-lg',
    header: 'bg-white/80 backdrop-blur-sm shadow-sm',
    logo: 'text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent',
    navLink: 'hover:text-violet-600 transition-colors text-gray-600 font-medium',
    footer: 'bg-white/80 border-t border-violet-100',
  },
}

export const themeNames: ThemeName[] = ['default', 'brutalist', 'glass', 'editorial', 'playful']
