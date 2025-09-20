/**
 * AuthLayout Component
 *
 * Shared layout for all authentication pages with STEM-themed design.
 * Features clean sectioned layout with organized visual hierarchy.
 * Provides responsive design for mobile/desktop and dark/light theme support.
 *
 * Location: src/components/auth/AuthLayout.tsx
 */

'use client'

import * as React from 'react'

import Link from 'next/link'

import { cn } from '../../lib/utils'

import {
  Section,
  SectionHeader,
  SectionContent,
  WelcomeSection,
  InfoSection,
  CardSection
} from '../ui/Section'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showLogo?: boolean
  className?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  className
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="w-full max-w-md space-y-4">
        {/* Logo & Brand Section */}
        {showLogo && (
          <WelcomeSection variant="transparent" padding="sm" spacing="sm">
            <div className="space-y-2 text-center">
              <Link href="/" className="inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                    <span className="text-lg font-bold text-white">S</span>
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                    StemBot
                  </span>
                </div>
              </Link>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                AI-Powered STEM Learning
              </div>
            </div>
          </WelcomeSection>
        )}

        {/* Welcome Message Section */}
        <WelcomeSection padding="lg" spacing="sm">
          <SectionHeader size="lg" border="none">
            <div className="w-full text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </SectionHeader>
        </WelcomeSection>

        {/* Main Form Section */}
        <CardSection className={cn(
          "bg-white/90 shadow-xl backdrop-blur-sm dark:bg-gray-900/90",
          className
        )} padding="lg" spacing="sm">
          <SectionContent spacing="lg">
            {children}
          </SectionContent>
        </CardSection>

        {/* Privacy Notice Section */}
        <InfoSection padding="sm" spacing="sm">
          <div className="text-center">
            <div className="inline-flex items-center rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  🔒 Privacy-First • Local AI Processing
                </span>
              </div>
            </div>
          </div>
        </InfoSection>

        {/* Footer Links Section */}
        <Section variant="transparent" padding="sm" spacing="none">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/privacy" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                Privacy
              </Link>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <Link href="/terms" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                Terms
              </Link>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <Link href="/help" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                Help
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 StemBot. All rights reserved.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default AuthLayout