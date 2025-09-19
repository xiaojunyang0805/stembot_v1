'use client'

import * as React from 'react'
import {
  SimpleThemeToggle,
  EducationalThemeToggle,
  DropdownThemeToggle,
  ThemeIndicator
} from '@/components/common/ThemeToggle'
import {
  SubjectCard,
  LearningDashboard,
  EducationalHeader,
  StudyModeIndicator,
  ThemeAwareCard
} from '@/components/common/ThemeAwareComponents'
import { useTheme, useEducationalTheme } from '@/hooks/useTheme'

/**
 * Example implementations of the StemBot theme system
 * These examples demonstrate real-world usage patterns
 */

// Example 1: Simple Header with Theme Toggle
export function ExampleHeader() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">StemBot</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeIndicator />
          <SimpleThemeToggle />
        </div>
      </div>
    </header>
  )
}

// Example 2: Educational Dashboard
export function ExampleDashboard() {
  const sidebar = (
    <div className="space-y-4">
      <ThemeAwareCard subject="general" className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Learning Tools</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 rounded hover:bg-accent text-sm">
            📚 My Lessons
          </button>
          <button className="w-full text-left p-2 rounded hover:bg-accent text-sm">
            🎯 Practice Tests
          </button>
          <button className="w-full text-left p-2 rounded hover:bg-accent text-sm">
            📊 Progress Reports
          </button>
        </div>
      </ThemeAwareCard>

      <ThemeAwareCard subject="general" className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Theme Settings</h3>
        <EducationalThemeToggle showLabel={true} />
      </ThemeAwareCard>
    </div>
  )

  return (
    <LearningDashboard
      sidebar={sidebar}
      showThemeContext={true}
    >
      <EducationalHeader
        title="Welcome back, Student!"
        subtitle="Continue your learning journey"
        showThemeIndicator={true}
      />

      <div className="mt-8 space-y-8">
        {/* Subject Grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SubjectCard
              subject="math"
              title="Algebra II"
              description="Quadratic equations, polynomials, and functions"
              progress={78}
              onClick={() => console.log('Math lesson clicked')}
            />
            <SubjectCard
              subject="science"
              title="Chemistry"
              description="Atomic structure, chemical bonds, and reactions"
              progress={62}
              onClick={() => console.log('Science lesson clicked')}
            />
            <SubjectCard
              subject="coding"
              title="Python Programming"
              description="Learn programming with Python fundamentals"
              progress={91}
              onClick={() => console.log('Coding lesson clicked')}
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeAwareCard subject="math" variant="activity">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-math-100 dark:bg-math-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-math-600 dark:text-math-400">📐</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Completed: Quadratic Formula</h4>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </ThemeAwareCard>

            <ThemeAwareCard subject="science" variant="activity">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-science-100 dark:bg-science-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-science-600 dark:text-science-400">🧪</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Lab: Chemical Reactions</h4>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </ThemeAwareCard>
          </div>
        </section>
      </div>
    </LearningDashboard>
  )
}

// Example 3: Settings Page with Theme Options
export function ExampleSettingsPage() {
  const { resolvedTheme } = useTheme()
  const { description, optimal } = useEducationalTheme()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <EducationalHeader
        title="Settings"
        subtitle="Customize your learning experience"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appearance Settings */}
        <div className="lg:col-span-2">
          <ThemeAwareCard subject="general" className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>

            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Theme Preference
                </label>
                <DropdownThemeToggle includeSystem={true} size="lg" />
              </div>

              {/* Current Theme Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Current Theme: {resolvedTheme}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {optimal.map((context) => (
                    <span
                      key={context}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent text-accent-foreground"
                    >
                      {context.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Study Mode */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Study Mode
                </label>
                <StudyModeIndicator />
                <p className="text-xs text-muted-foreground mt-2">
                  Automatically optimizes interface for your learning environment
                </p>
              </div>
            </div>
          </ThemeAwareCard>
        </div>

        {/* Theme Preview */}
        <div>
          <ThemeAwareCard subject="general" className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>

            <div className="space-y-4">
              {/* Color Swatches */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Subject Colors</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="w-full h-12 bg-math-500 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">Math</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-12 bg-science-500 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">Science</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-12 bg-coding-500 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">Coding</span>
                  </div>
                </div>
              </div>

              {/* Sample Card */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Sample Lesson Card</p>
                <div className="bg-math-50 dark:bg-math-900/20 border border-math-200 dark:border-math-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-math-700 dark:text-math-300">
                    Algebra Basics
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Learn fundamental concepts
                  </p>
                  <div className="mt-2">
                    <div className="bg-muted rounded-full h-1.5">
                      <div className="bg-math-500 h-1.5 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ThemeAwareCard>
        </div>
      </div>
    </div>
  )
}

// Example 4: Mobile-Friendly Theme Toggle
export function ExampleMobileHeader() {
  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">S</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">StemBot</h1>
        </div>

        <div className="flex items-center gap-2">
          <SimpleThemeToggle size="sm" />
          <button className="p-2 rounded-lg hover:bg-accent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

// Example 5: Classroom Presentation Mode
export function ExamplePresentationMode() {
  const { setLightTheme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    // Auto-switch to light mode for presentations
    if (resolvedTheme === 'dark') {
      setLightTheme()
    }
  }, [resolvedTheme, setLightTheme])

  return (
    <div className="bg-white text-gray-900 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Mathematics Lesson</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Presentation Mode</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-math-50 p-6 rounded-lg border border-math-200">
            <h2 className="text-2xl font-bold text-math-700 mb-4">
              Quadratic Formula
            </h2>
            <div className="text-center">
              <div className="text-3xl font-mono text-math-800 bg-white p-4 rounded border">
                x = (-b ± √(b² - 4ac)) / 2a
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-science-50 p-4 rounded-lg border border-science-200">
              <h3 className="font-semibold text-science-700 mb-2">Example</h3>
              <p className="text-science-600">
                Solve: 2x² + 5x - 3 = 0
              </p>
            </div>

            <div className="bg-coding-50 p-4 rounded-lg border border-coding-200">
              <h3 className="font-semibold text-coding-700 mb-2">Practice</h3>
              <p className="text-coding-600">
                Try solving: x² - 7x + 12 = 0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Example 6: Theme Integration Test Component
export function ExampleThemeTest() {
  const {
    resolvedTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isLoading
  } = useTheme()

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Theme System Test
        </h1>
        <p className="text-muted-foreground">
          Current theme: <strong>{resolvedTheme}</strong>
        </p>
      </div>

      {/* Theme Controls */}
      <div className="flex flex-wrap gap-4">
        <button onClick={toggleTheme} className="btn-primary">
          Toggle Theme
        </button>
        <button onClick={setLightTheme} className="btn-secondary">
          Light Mode
        </button>
        <button onClick={setDarkTheme} className="btn-secondary">
          Dark Mode
        </button>
        <button onClick={setSystemTheme} className="btn-secondary">
          System Mode
        </button>
      </div>

      {/* Theme Components Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Simple Toggle</h3>
          <SimpleThemeToggle />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Educational Toggle</h3>
          <EducationalThemeToggle showLabel={false} />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Dropdown Toggle</h3>
          <DropdownThemeToggle />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Theme Indicator</h3>
          <ThemeIndicator />
        </div>
      </div>

      {/* Color Test */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Color Adaptation Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemeAwareCard subject="math">
            <h3 className="text-math-600 dark:text-math-400 font-semibold">
              Mathematics
            </h3>
            <p className="text-muted-foreground mt-2">
              This card adapts its colors based on the current theme while maintaining
              the mathematical subject branding.
            </p>
          </ThemeAwareCard>

          <ThemeAwareCard subject="science">
            <h3 className="text-science-600 dark:text-science-400 font-semibold">
              Science
            </h3>
            <p className="text-muted-foreground mt-2">
              Science subjects maintain their green branding while adapting to
              light and dark themes seamlessly.
            </p>
          </ThemeAwareCard>

          <ThemeAwareCard subject="coding">
            <h3 className="text-coding-600 dark:text-coding-400 font-semibold">
              Programming
            </h3>
            <p className="text-muted-foreground mt-2">
              Coding sections use purple branding that works beautifully in both
              light and dark modes.
            </p>
          </ThemeAwareCard>
        </div>
      </div>
    </div>
  )
}