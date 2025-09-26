'use client'

import * as React from 'react'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '../../lib/utils'

/**
 * Educational Theme Toggle Component
 *
 * Features:
 * - Smooth animations optimized for learning environments
 * - Accessible design with ARIA labels and keyboard navigation
 * - Educational-friendly icons and tooltips
 * - Multiple variants for different UI contexts
 */

interface BaseThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  disabled?: boolean
}

// Base button component with consistent styling
const ThemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'educational' | 'minimal'
  }
>(({ className, size = 'md', variant = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'bg-background border-border hover:bg-accent hover:text-accent-foreground',
    educational: 'bg-gradient-to-r from-math-50 to-science-50 dark:from-math-900 dark:to-science-900 border-math-200 dark:border-math-700 hover:from-math-100 hover:to-science-100 dark:hover:from-math-800 dark:hover:to-science-800',
    minimal: 'bg-transparent hover:bg-accent/50'
  }

  return (
    <button
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
ThemeButton.displayName = 'ThemeButton'

/**
 * Simple toggle between light and dark modes
 * Perfect for header navigation or quick access
 */
export function SimpleThemeToggle({
  className,
  size = 'md',
  disabled = false
}: BaseThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20
  }

  if (!mounted) {
    return (
      <ThemeButton
        size={size}
        className={className}
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="animate-pulse">
          <div className="h-4 w-4 rounded bg-muted" />
        </div>
      </ThemeButton>
    )
  }

  return (
    <ThemeButton
      size={size}
      className={className}
      onClick={toggleTheme}
      disabled={disabled}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Currently in ${theme} mode. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
    >
      <div className="relative">
        <Sun
          size={iconSize[size]}
          className={cn(
            'absolute text-math-600 transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
        <Moon
          size={iconSize[size]}
          className={cn(
            'text-privacy-600 transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
    </ThemeButton>
  )
}

/**
 * Educational theme toggle with context-aware styling
 * Shows current theme state and includes educational messaging
 */
export function EducationalThemeToggle({
  className,
  size = 'md',
  showLabel = true,
  disabled = false
}: BaseThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const getThemeInfo = () => {
    switch (theme) {
      case 'dark':
        return {
          label: 'Dark Mode',
          description: 'Easy on the eyes for evening study',
          icon: Moon,
          nextTheme: 'light',
          color: 'text-privacy-600 dark:text-privacy-400'
        }
      case 'light':
        return {
          label: 'Light Mode',
          description: 'Bright theme for daytime learning',
          icon: Sun,
          nextTheme: 'dark',
          color: 'text-math-600 dark:text-math-400'
        }
      default:
        return {
          label: 'Auto Mode',
          description: 'Follows your system settings',
          icon: Monitor,
          nextTheme: 'light',
          color: 'text-science-600 dark:text-science-400'
        }
    }
  }

  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <ThemeButton
          size={size}
          variant="educational"
          disabled
          aria-label="Loading theme toggle"
        >
          <div className="animate-pulse">
            <div className="h-4 w-4 rounded bg-muted" />
          </div>
        </ThemeButton>
        {showLabel && (
          <div className="animate-pulse">
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
        )}
      </div>
    )
  }

  const themeInfo = getThemeInfo()
  const Icon = themeInfo.icon

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ThemeButton
        size={size}
        variant="educational"
        onClick={toggleTheme}
        disabled={disabled}
        aria-label={`Switch to ${themeInfo.nextTheme} mode`}
        title={themeInfo.description}
      >
        <Icon
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          className={cn(
            'transition-all duration-300 ease-in-out',
            themeInfo.color
          )}
        />
      </ThemeButton>

      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {themeInfo.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {themeInfo.description}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Dropdown theme selector with all theme options
 * Includes system preference option for adaptive theming
 */
interface DropdownThemeToggleProps extends BaseThemeToggleProps {
  includeSystem?: boolean
}

export function DropdownThemeToggle({
  className,
  size = 'md',
  includeSystem = true,
  disabled = false
}: DropdownThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themes = [
    {
      value: 'light',
      label: 'Light Mode',
      icon: Sun,
      description: 'Perfect for daytime study sessions',
      color: 'text-math-600'
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      icon: Moon,
      description: 'Easy on the eyes for evening learning',
      color: 'text-privacy-600'
    },
    ...(includeSystem ? [{
      value: 'system',
      label: 'Auto Mode',
      icon: Monitor,
      description: 'Matches your device preference',
      color: 'text-science-600'
    }] : [])
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  if (!mounted || !currentTheme) {
    return (
      <ThemeButton
        size={size}
        className={className}
        disabled
        aria-label="Loading theme selector"
      >
        <div className="animate-pulse">
          <div className="h-4 w-4 rounded bg-muted" />
        </div>
      </ThemeButton>
    )
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <ThemeButton
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Open theme selector"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <currentTheme.icon
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          className={cn('transition-colors duration-200', currentTheme.color)}
        />
      </ThemeButton>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[240px] rounded-lg border border-border bg-popover py-1 shadow-lg">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            const isSelected = theme === themeOption.value

            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                  isSelected && 'bg-accent/50'
                )}
                role="menuitem"
              >
                <Icon
                  size={18}
                  className={cn(
                    'transition-colors duration-200',
                    themeOption.color,
                    isSelected && 'opacity-100',
                    !isSelected && 'opacity-70'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {themeOption.label}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-primary">✓</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {themeOption.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Compact theme indicator for status bars or minimal UI contexts
 * Shows current theme without taking up much space
 */
export function ThemeIndicator({
  className
}: Pick<BaseThemeToggleProps, 'className'>) {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="h-3 w-3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon size={12} className="text-privacy-600" />
      case 'light':
        return <Sun size={12} className="text-math-600" />
      default:
        return <Monitor size={12} className="text-science-600" />
    }
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {getThemeIcon()}
      <span className="text-xs capitalize text-muted-foreground">
        {theme}
      </span>
    </div>
  )
}