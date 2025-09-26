'use client'

import { useEffect, useState, useCallback } from 'react'

import { useTheme as useNextTheme } from 'next-themes'

/**
 * TypeScript interfaces for theme management
 */
export interface ThemeConfig {
  theme: string | undefined
  themes: string[]
  setTheme: (theme: string) => void
  resolvedTheme: string | undefined
  systemTheme: string | undefined
}

export interface EducationalThemeState {
  currentTheme: 'light' | 'dark' | 'system' | undefined
  resolvedTheme: 'light' | 'dark' | undefined
  isSystemTheme: boolean
  isDarkMode: boolean
  isLightMode: boolean
  isLoading: boolean
}

export interface ThemeUtilities {
  toggleTheme: () => void
  setLightTheme: () => void
  setDarkTheme: () => void
  setSystemTheme: () => void
  getThemePreference: () => 'light' | 'dark' | 'system'
  isThemeLoaded: () => boolean
}

export interface EducationalThemeContext {
  optimal: string[]
  description: string
  icon: 'sun' | 'moon' | 'monitor'
  accessibility: {
    contrastRatio: 'high' | 'normal'
    reducedMotion: boolean
  }
}

/**
 * Enhanced theme hook for StemBot educational platform
 *
 * Provides:
 * - Type-safe theme management
 * - Educational context awareness
 * - Accessibility helpers
 * - Performance optimizations
 */
export function useTheme(): ThemeConfig & EducationalThemeState & ThemeUtilities {
  const {
    theme,
    themes,
    setTheme: nextSetTheme,
    resolvedTheme,
    systemTheme
  } = useNextTheme()

  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Hydration safety
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Theme utilities
  const toggleTheme = useCallback(() => {
    if (theme === 'dark') {
      nextSetTheme('light')
    } else if (theme === 'light') {
      nextSetTheme('dark')
    } else {
      // If system theme, toggle to the opposite of current resolved theme
      nextSetTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }
  }, [theme, resolvedTheme, nextSetTheme])

  const setLightTheme = useCallback(() => {
    nextSetTheme('light')
  }, [nextSetTheme])

  const setDarkTheme = useCallback(() => {
    nextSetTheme('dark')
  }, [nextSetTheme])

  const setSystemTheme = useCallback(() => {
    nextSetTheme('system')
  }, [nextSetTheme])

  const getThemePreference = useCallback((): 'light' | 'dark' | 'system' => {
    return (theme as 'light' | 'dark' | 'system') || 'system'
  }, [theme])

  const isThemeLoaded = useCallback((): boolean => {
    return mounted && !isLoading && !!resolvedTheme
  }, [mounted, isLoading, resolvedTheme])

  // Educational theme state
  const currentTheme = theme as 'light' | 'dark' | 'system' | undefined
  const currentResolvedTheme = resolvedTheme as 'light' | 'dark' | undefined
  const isSystemTheme = theme === 'system'
  const isDarkMode = currentResolvedTheme === 'dark'
  const isLightMode = currentResolvedTheme === 'light'

  return {
    // Base theme config
    theme,
    themes,
    setTheme: nextSetTheme,
    resolvedTheme: currentResolvedTheme,
    systemTheme,

    // Educational theme state
    currentTheme,
    isSystemTheme,
    isDarkMode,
    isLightMode,
    isLoading: isLoading || !mounted,

    // Theme utilities
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    getThemePreference,
    isThemeLoaded
  }
}

/**
 * Hook for theme-aware styling
 * Returns CSS classes and values based on current theme
 */
export function useThemeStyles() {
  const { resolvedTheme, isLoading } = useTheme()

  const getThemeClasses = useCallback((lightClass: string, darkClass: string) => {
    if (isLoading) {
return ''
}
    return resolvedTheme === 'dark' ? darkClass : lightClass
  }, [resolvedTheme, isLoading])

  const getThemeValue = useCallback(<T>(lightValue: T, darkValue: T): T => {
    if (isLoading) {
return lightValue
}
    return resolvedTheme === 'dark' ? darkValue : lightValue
  }, [resolvedTheme, isLoading])

  return {
    getThemeClasses,
    getThemeValue,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light'
  }
}

/**
 * Hook for educational theme context
 * Provides theme information optimized for learning environments
 */
export function useEducationalTheme(): EducationalThemeContext {
  const { resolvedTheme } = useTheme()

  const getEducationalContext = useCallback((): EducationalThemeContext => {
    switch (resolvedTheme) {
      case 'dark':
        return {
          optimal: ['evening', 'night', 'dim-room', 'eye-strain-reduction'],
          description: 'Dark mode reduces eye strain during evening study sessions and low-light environments',
          icon: 'moon',
          accessibility: {
            contrastRatio: 'high',
            reducedMotion: false
          }
        }
      case 'light':
        return {
          optimal: ['morning', 'afternoon', 'bright-room', 'focus-enhancement'],
          description: 'Light mode provides excellent readability for daytime learning and well-lit environments',
          icon: 'sun',
          accessibility: {
            contrastRatio: 'normal',
            reducedMotion: false
          }
        }
      default:
        return {
          optimal: ['adaptive', 'energy-saving', 'automatic-adjustment'],
          description: 'System mode automatically adapts to your device settings and environment',
          icon: 'monitor',
          accessibility: {
            contrastRatio: 'normal',
            reducedMotion: false
          }
        }
    }
  }, [resolvedTheme])

  return getEducationalContext()
}

/**
 * Hook for theme accessibility features
 * Manages accessibility-related theme preferences
 */
export function useThemeAccessibility() {
  const { resolvedTheme } = useTheme()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    motionQuery.addEventListener('change', handleMotionChange)

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(contrastQuery.matches)

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    contrastQuery.addEventListener('change', handleContrastChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  const getAccessibilityProps = useCallback(() => {
    return {
      'data-theme': resolvedTheme,
      'data-reduced-motion': prefersReducedMotion,
      'data-high-contrast': prefersHighContrast,
      'aria-label': `Current theme: ${resolvedTheme || 'loading'}`
    }
  }, [resolvedTheme, prefersReducedMotion, prefersHighContrast])

  return {
    prefersReducedMotion,
    prefersHighContrast,
    getAccessibilityProps,
    shouldReduceMotion: prefersReducedMotion,
    shouldIncreaseContrast: prefersHighContrast
  }
}

/**
 * Hook for theme persistence and sync across tabs
 * Ensures theme changes are synchronized across browser tabs
 */
export function useThemeSync() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'stembot-theme' && e.newValue && e.newValue !== theme) {
        setTheme(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [theme, setTheme])

  const broadcastThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme)
    // Manually trigger storage event for same-tab updates
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'stembot-theme',
        newValue: newTheme,
        storageArea: localStorage
      })
    )
  }, [setTheme])

  return {
    broadcastThemeChange
  }
}

/**
 * Theme constants for TypeScript autocomplete and validation
 */
export const THEME_VALUES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export type ThemeValue = typeof THEME_VALUES[keyof typeof THEME_VALUES]

/**
 * Educational theme presets for different learning contexts
 */
export const EDUCATIONAL_THEMES = {
  FOCUS: {
    light: 'light',
    dark: 'dark',
    description: 'Optimized for deep focus and concentration'
  },
  PRESENTATION: {
    light: 'light',
    dark: 'light', // Force light mode for presentations
    description: 'High contrast for classroom presentations'
  },
  ACCESSIBILITY: {
    light: 'light',
    dark: 'dark',
    description: 'Enhanced accessibility features'
  }
} as const