'use client'

import * as React from 'react'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

interface StemBotThemeProviderProps extends Omit<ThemeProviderProps, 'children'> {
  children: React.ReactNode
}

/**
 * Theme provider wrapper for StemBot v1 educational platform
 *
 * Features:
 * - Hydration-safe theme switching
 * - System preference detection
 * - Smooth transitions between themes
 * - Educational context optimization
 * - localStorage persistence
 */
export function ThemeProvider({
  children,
  ...props
}: StemBotThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent flash of wrong theme during SSR
  if (!mounted) {
    return (
      <div className="bg-background text-foreground">
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      themes={['light', 'dark', 'system']}
      storageKey="stembot-theme"
      {...props}
    >
      <ThemeTransitionWrapper>
        {children}
      </ThemeTransitionWrapper>
    </NextThemesProvider>
  )
}

/**
 * Wrapper component to handle smooth theme transitions
 * Prevents jarring color changes during theme switches
 */
function ThemeTransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-colors duration-300 ease-in-out">
      {children}
    </div>
  )
}

/**
 * Error boundary specifically for theme-related errors
 * Fallback to light theme if theme system fails
 */
interface ThemeErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ThemeErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ThemeErrorBoundary extends React.Component<
  ThemeErrorBoundaryProps,
  ThemeErrorBoundaryState
> {
  constructor(props: ThemeErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ThemeErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Theme system error:', error, errorInfo)

    // Reset theme to light mode as fallback
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('stembot-theme', 'light')
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      } catch (e) {
        console.error('Failed to reset theme:', e)
      }
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-white text-gray-900">
            {this.props.children}
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * Hook to get theme loading state
 * Useful for showing loading indicators during theme initialization
 */
export function useThemeLoading() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Small delay to ensure theme is properly applied
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return isLoading
}

/**
 * Educational theme utilities
 * Optimized for classroom and learning environments
 */
export const educationalThemeConfig = {
  // Classroom-friendly: reduces eye strain during long study sessions
  transitionDuration: '300ms',

  // Better for focus and concentration
  reducedMotion: {
    attribute: 'data-reduced-motion',
    values: ['reduce', 'no-preference']
  },

  // Learning environment considerations
  themes: {
    light: {
      name: 'Light Mode',
      description: 'Bright theme perfect for daytime learning',
      icon: 'sun',
      optimal: ['morning', 'afternoon', 'bright-room']
    },
    dark: {
      name: 'Dark Mode',
      description: 'Easy on the eyes for evening study sessions',
      icon: 'moon',
      optimal: ['evening', 'night', 'dim-room']
    },
    system: {
      name: 'Auto',
      description: 'Matches your device settings',
      icon: 'monitor',
      optimal: ['adaptive', 'energy-saving']
    }
  }
} as const

export type EducationalTheme = keyof typeof educationalThemeConfig.themes