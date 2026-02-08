'use client'

import { themes, themeNames, type ThemeName } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  currentTheme: ThemeName
  onThemeChange: (theme: ThemeName) => void
  className?: string
}

export function ThemeSwitcher({ currentTheme, onThemeChange, className }: ThemeSwitcherProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs font-medium text-muted-foreground mr-2">Theme:</span>
      {themeNames.map((themeName) => {
        const theme = themes[themeName]
        const isActive = currentTheme === themeName
        return (
          <button
            key={themeName}
            onClick={() => onThemeChange(themeName)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all',
              isActive
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            )}
          >
            {theme.name}
          </button>
        )
      })}
    </div>
  )
}
