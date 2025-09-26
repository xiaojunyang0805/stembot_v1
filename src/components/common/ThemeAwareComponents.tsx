'use client'

import * as React from 'react'

import { Book, Users, Code, Lightbulb, Target, Award } from 'lucide-react'

import { useTheme, useThemeStyles, useEducationalTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/utils'

/**
 * Educational Theme-Aware Components
 *
 * These components automatically adapt to the current theme
 * while maintaining educational context and accessibility
 */

interface ThemeAwareCardProps {
  children: React.ReactNode
  className?: string
  subject?: 'math' | 'science' | 'coding' | 'general'
  variant?: 'lesson' | 'activity' | 'achievement' | 'info'
}

/**
 * Theme-aware card component optimized for educational content
 * Automatically adjusts colors and contrast based on current theme
 */
export function ThemeAwareCard({
  children,
  className,
  subject = 'general',
  variant = 'lesson'
}: ThemeAwareCardProps) {
  const { getThemeClasses } = useThemeStyles()

  const getSubjectClasses = () => {
    const subjectStyles = {
      math: {
        light: 'border-math-200 bg-math-50 hover:bg-math-100',
        dark: 'border-math-700 bg-math-900/20 hover:bg-math-800/30'
      },
      science: {
        light: 'border-science-200 bg-science-50 hover:bg-science-100',
        dark: 'border-science-700 bg-science-900/20 hover:bg-science-800/30'
      },
      coding: {
        light: 'border-coding-200 bg-coding-50 hover:bg-coding-100',
        dark: 'border-coding-700 bg-coding-900/20 hover:bg-coding-800/30'
      },
      general: {
        light: 'border-border bg-card hover:bg-accent/50',
        dark: 'border-border bg-card hover:bg-accent/50'
      }
    }

    return getThemeClasses(
      subjectStyles[subject].light,
      subjectStyles[subject].dark
    )
  }

  const getVariantClasses = () => {
    const variantStyles = {
      lesson: 'p-6 rounded-lg',
      activity: 'p-4 rounded-md',
      achievement: 'p-4 rounded-full',
      info: 'p-3 rounded border-l-4'
    }

    return variantStyles[variant]
  }

  return (
    <div
      className={cn(
        'border transition-all duration-200 ease-in-out',
        getVariantClasses(),
        getSubjectClasses(),
        className
      )}
    >
      {children}
    </div>
  )
}

interface EducationalHeaderProps {
  title: string
  subtitle?: string
  className?: string
  showThemeIndicator?: boolean
}

/**
 * Educational header component with theme awareness
 * Displays contextual information about current theme for learning environments
 */
export function EducationalHeader({
  title,
  subtitle,
  className,
  showThemeIndicator = false
}: EducationalHeaderProps) {
  const { resolvedTheme } = useTheme()
  const { description } = useEducationalTheme()

  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {showThemeIndicator && (
          <ThemeContextIndicator />
        )}
      </div>

      {showThemeIndicator && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Current theme:</strong> {resolvedTheme} mode
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      )}
    </header>
  )
}

/**
 * Theme context indicator for educational environments
 * Shows optimal usage context for current theme
 */
export function ThemeContextIndicator() {
  const { resolvedTheme } = useTheme()
  const { icon, description } = useEducationalTheme()

  const getIcon = () => {
    switch (icon) {
      case 'sun':
        return <Lightbulb className="h-4 w-4 text-math-600" />
      case 'moon':
        return <Target className="h-4 w-4 text-privacy-600" />
      default:
        return <Users className="h-4 w-4 text-science-600" />
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
      {getIcon()}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium capitalize text-foreground">
          {resolvedTheme} Mode Active
        </p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

interface SubjectCardProps {
  subject: 'math' | 'science' | 'coding'
  title: string
  description: string
  progress?: number
  className?: string
  onClick?: () => void
}

/**
 * Subject-specific card component with theme-aware styling
 * Maintains subject branding while adapting to theme
 */
export function SubjectCard({
  subject,
  title,
  description,
  progress,
  className,
  onClick
}: SubjectCardProps) {

  const subjectConfig = {
    math: {
      icon: Book,
      colorClass: 'text-math-600 dark:text-math-400',
      bgClass: 'bg-math-50 dark:bg-math-900/10',
      borderClass: 'border-math-200 dark:border-math-700',
      progressClass: 'bg-math-500'
    },
    science: {
      icon: Award,
      colorClass: 'text-science-600 dark:text-science-400',
      bgClass: 'bg-science-50 dark:bg-science-900/10',
      borderClass: 'border-science-200 dark:border-science-700',
      progressClass: 'bg-science-500'
    },
    coding: {
      icon: Code,
      colorClass: 'text-coding-600 dark:text-coding-400',
      bgClass: 'bg-coding-50 dark:bg-coding-900/10',
      borderClass: 'border-coding-200 dark:border-coding-700',
      progressClass: 'bg-coding-500'
    }
  }

  const config = subjectConfig[subject]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-lg border transition-all duration-200',
        'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md',
        config.bgClass,
        config.borderClass,
        className
      )}
      onClick={onClick}
    >
      {/* Gradient overlay for enhanced visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className={cn('rounded-lg p-3', config.bgClass)}>
            <Icon className={cn('h-6 w-6', config.colorClass)} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className={cn('text-lg font-semibold', config.colorClass)}>
              {title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>

            {progress !== undefined && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn('h-2 rounded-full transition-all duration-300', config.progressClass)}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StudyModeIndicatorProps {
  className?: string
}

/**
 * Study mode indicator that shows theme optimization for learning
 * Provides contextual feedback about current theme's learning benefits
 */
export function StudyModeIndicator({ className }: StudyModeIndicatorProps) {
  const { resolvedTheme } = useTheme()

  const getStudyModeInfo = () => {
    switch (resolvedTheme) {
      case 'dark':
        return {
          mode: 'Focus Mode',
          benefit: 'Reduced eye strain',
          icon: Target,
          color: 'text-privacy-600 dark:text-privacy-400'
        }
      case 'light':
        return {
          mode: 'Active Mode',
          benefit: 'Enhanced readability',
          icon: Lightbulb,
          color: 'text-math-600 dark:text-math-400'
        }
      default:
        return {
          mode: 'Adaptive Mode',
          benefit: 'Automatic optimization',
          icon: Users,
          color: 'text-science-600 dark:text-science-400'
        }
    }
  }

  const studyMode = getStudyModeInfo()
  const Icon = studyMode.icon

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Icon className={cn('h-4 w-4', studyMode.color)} />
      <div>
        <span className="font-medium text-foreground">{studyMode.mode}</span>
        <span className="ml-2 text-muted-foreground">• {studyMode.benefit}</span>
      </div>
    </div>
  )
}

/**
 * Theme-aware learning dashboard layout
 * Adapts spacing and colors for optimal learning experience
 */
interface LearningDashboardProps {
  children: React.ReactNode
  className?: string
  sidebar?: React.ReactNode
  showThemeContext?: boolean
}

export function LearningDashboard({
  children,
  className,
  sidebar,
  showThemeContext = false
}: LearningDashboardProps) {
  const { getThemeClasses } = useThemeStyles()

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        getThemeClasses(
          'bg-gradient-to-br from-gray-50 to-blue-50',
          'bg-gradient-to-br from-gray-900 to-gray-800'
        ),
        className
      )}
    >
      <div className="container mx-auto px-4 py-8">
        {showThemeContext && (
          <div className="mb-6">
            <StudyModeIndicator />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {sidebar && (
            <aside className="lg:col-span-3">
              <div className="sticky top-8">
                {sidebar}
              </div>
            </aside>
          )}

          <main className={cn(sidebar ? 'lg:col-span-9' : 'lg:col-span-12')}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}