import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/site/MobileNav'
import { cn } from '@/lib/utils'

export type NavItem = { href: string; label: string }

export function SiteHeader({
  brandName,
  navItems,
  primaryCta,
  secondaryCta,
  headerClassName,
  logoClassName,
  navLinkClassName,
  mobileNavPanelClassName,
}: {
  brandName: string
  navItems: NavItem[]
  primaryCta?: { label: string; href: string } | null
  secondaryCta?: { label: string; href: string } | null
  headerClassName?: string
  logoClassName?: string
  navLinkClassName?: string
  mobileNavPanelClassName?: string
}) {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b border-muted/60 bg-background/80 backdrop-blur",
      headerClassName
    )}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className={cn("text-lg font-semibold tracking-tight", logoClassName)}>
          {brandName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("text-muted-foreground hover:text-foreground", navLinkClassName)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {secondaryCta ? (
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          ) : null}
          {primaryCta ? (
            <Button asChild className="hidden sm:inline-flex">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          ) : null}
          <MobileNav
            navItems={navItems}
            primaryCta={primaryCta}
            secondaryCta={secondaryCta}
            panelClassName={mobileNavPanelClassName}
            navLinkClassName={navLinkClassName}
          />
        </div>
      </div>
    </header>
  )
}
