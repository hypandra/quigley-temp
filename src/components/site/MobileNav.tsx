'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NavItem } from './SiteHeader'

export function MobileNav({
  navItems,
  primaryCta,
  secondaryCta,
  panelClassName,
  navLinkClassName,
}: {
  navItems: NavItem[]
  primaryCta?: { label: string; href: string } | null
  secondaryCta?: { label: string; href: string } | null
  panelClassName?: string
  navLinkClassName?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Modal overlay + drawer - rendered via portal to escape stacking contexts */}
      {isOpen && isMounted
        ? createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-[9998] bg-black/50"
                onClick={() => setIsOpen(false)}
              />

              {/* Drawer panel */}
              <div className={cn(
                "fixed top-4 right-4 z-[9999] w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl",
                panelClassName
              )}>
                {/* Close button */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Close menu"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Nav links */}
                <nav className="mb-8 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        navLinkClassName
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* CTAs */}
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-6">
                  {secondaryCta && (
                    <Button variant="outline" asChild className="w-full">
                      <Link href={secondaryCta.href} onClick={() => setIsOpen(false)}>
                        {secondaryCta.label}
                      </Link>
                    </Button>
                  )}
                  {primaryCta && (
                    <Button asChild className="w-full">
                      <Link href={primaryCta.href} onClick={() => setIsOpen(false)}>
                        {primaryCta.label}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  )
}
