'use client'

import * as React from 'react'

import {
  SubjectCard,
  LearningDashboard,
  EducationalHeader,
  StudyModeIndicator,
  ThemeAwareCard
} from '../components/common/ThemeAwareComponents'
import {
  SimpleThemeToggle,
  EducationalThemeToggle,
  DropdownThemeToggle,
  ThemeIndicator
} from '../components/common/ThemeToggle'
import { useTheme, useEducationalTheme } from '../hooks/useTheme'

/**
 * Example implementations of the StemBot theme system
 * These examples demonstrate real-world usage patterns
 */

// Example 1: Simple Header with Theme Toggle
export function ExampleHeader() {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">S</span>
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
        <h3 className="mb-3 font-semibold text-foreground">Learning Tools</h3>
        <div className="space-y-2">
          <button className="w-full rounded p-2 text-left text-sm hover:bg-accent">
            📚 My Lessons
          </button>
          <button className="w-full rounded p-2 text-left text-sm hover:bg-accent">
            🎯 Practice Tests
          </button>
          <button className="w-full rounded p-2 text-left text-sm hover:bg-accent">
            📊 Progress Reports
          </button>
        </div>
      </ThemeAwareCard>

      <ThemeAwareCard subject="general" className="p-4">
        <h3 className="mb-3 font-semibold text-foreground">Theme Settings</h3>
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
          <h2 className="mb-6 text-2xl font-bold text-foreground">Your Subjects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
          <h2 className="mb-6 text-2xl font-bold text-foreground">Recent Activity</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ThemeAwareCard subject="math" variant="activity">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-math-100 dark:bg-math-900/30">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-science-100 dark:bg-science-900/30">
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
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <EducationalHeader
        title="Settings"
        subtitle="Customize your learning experience"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Appearance Settings */}
        <div className="lg:col-span-2">
          <ThemeAwareCard subject="general" className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Appearance</h3>

            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">
                  Theme Preference
                </label>
                <DropdownThemeToggle includeSystem={true} size="lg" />
              </div>

              {/* Current Theme Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 font-medium text-foreground">
                  Current Theme: {resolvedTheme}
                </h4>
                <p className="mb-3 text-sm text-muted-foreground">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {optimal.map((context) => (
                    <span
                      key={context}
                      className="inline-flex items-center rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground"
                    >
                      {context.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Study Mode */}
              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">
                  Study Mode
                </label>
                <StudyModeIndicator />
                <p className="mt-2 text-xs text-muted-foreground">
                  Automatically optimizes interface for your learning environment
                </p>
              </div>
            </div>
          </ThemeAwareCard>
        </div>

        {/* Theme Preview */}
        <div>
          <ThemeAwareCard subject="general" className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Preview</h3>

            <div className="space-y-4">
              {/* Color Swatches */}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Subject Colors</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="mb-2 h-12 w-full rounded bg-math-500"></div>
                    <span className="text-xs text-muted-foreground">Math</span>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 h-12 w-full rounded bg-science-500"></div>
                    <span className="text-xs text-muted-foreground">Science</span>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 h-12 w-full rounded bg-coding-500"></div>
                    <span className="text-xs text-muted-foreground">Coding</span>
                  </div>
                </div>
              </div>

              {/* Sample Card */}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Sample Lesson Card</p>
                <div className="rounded-lg border border-math-200 bg-math-50 p-3 dark:border-math-700 dark:bg-math-900/20">
                  <h4 className="text-sm font-medium text-math-700 dark:text-math-300">
                    Algebra Basics
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Learn fundamental concepts
                  </p>
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className="h-1.5 w-3/4 rounded-full bg-math-500"></div>
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
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <span className="text-xs font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">StemBot</h1>
        </div>

        <div className="flex items-center gap-2">
          <SimpleThemeToggle size="sm" />
          <button className="rounded-lg p-2 hover:bg-accent">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-white p-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Mathematics Lesson</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Presentation Mode</span>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-math-200 bg-math-50 p-6">
            <h2 className="mb-4 text-2xl font-bold text-math-700">
              Quadratic Formula
            </h2>
            <div className="text-center">
              <div className="rounded border bg-white p-4 font-mono text-3xl text-math-800">
                x = (-b ± √(b² - 4ac)) / 2a
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-science-200 bg-science-50 p-4">
              <h3 className="mb-2 font-semibold text-science-700">Example</h3>
              <p className="text-science-600">
                Solve: 2x² + 5x - 3 = 0
              </p>
            </div>

            <div className="rounded-lg border border-coding-200 bg-coding-50 p-4">
              <h3 className="mb-2 font-semibold text-coding-700">Practice</h3>
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
          <div className="h-4 w-1/4 rounded bg-muted"></div>
          <div className="h-8 w-1/2 rounded bg-muted"></div>
          <div className="h-32 rounded bg-muted"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="mb-4 text-3xl font-bold text-foreground">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-2 font-semibold">Simple Toggle</h3>
          <SimpleThemeToggle />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Educational Toggle</h3>
          <EducationalThemeToggle showLabel={false} />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Dropdown Toggle</h3>
          <DropdownThemeToggle />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Theme Indicator</h3>
          <ThemeIndicator />
        </div>
      </div>

      {/* Color Test */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Color Adaptation Test</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ThemeAwareCard subject="math">
            <h3 className="font-semibold text-math-600 dark:text-math-400">
              Mathematics
            </h3>
            <p className="mt-2 text-muted-foreground">
              This card adapts its colors based on the current theme while maintaining
              the mathematical subject branding.
            </p>
          </ThemeAwareCard>

          <ThemeAwareCard subject="science">
            <h3 className="font-semibold text-science-600 dark:text-science-400">
              Science
            </h3>
            <p className="mt-2 text-muted-foreground">
              Science subjects maintain their green branding while adapting to
              light and dark themes seamlessly.
            </p>
          </ThemeAwareCard>

          <ThemeAwareCard subject="coding">
            <h3 className="font-semibold text-coding-600 dark:text-coding-400">
              Programming
            </h3>
            <p className="mt-2 text-muted-foreground">
              Coding sections use purple branding that works beautifully in both
              light and dark modes.
            </p>
          </ThemeAwareCard>
        </div>
      </div>
    </div>
  )
}