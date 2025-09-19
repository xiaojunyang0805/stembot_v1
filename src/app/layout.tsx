// =============================================================================
// ROOT LAYOUT
// =============================================================================

// src/app/layout.tsx
/**
 * Root layout component for StemBot application
 * Provides global providers, theme, authentication, and base HTML structure
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider, ThemeErrorBoundary } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StemBot - AI-Powered STEM Learning Platform',
  description: 'Privacy-first AI tutoring for Dutch STEM education. Local processing, personalized learning paths, and collaborative features.',
  keywords: 'AI tutoring, STEM education, mathematics, science, programming, Dutch education, privacy-first learning',
  authors: [{ name: 'StemBot Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'StemBot - AI-Powered STEM Learning Platform',
    description: 'Privacy-first AI tutoring for Dutch STEM education',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'nl_NL',
    siteName: 'StemBot',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.className} h-full antialiased bg-background text-foreground`}>
        <ThemeErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
            themes={['light', 'dark', 'system']}
            storageKey="stembot-theme"
          >
            <AuthProvider>
              {/* TODO: Add ToastProvider for notifications */}
              {/* TODO: Add I18nProvider for internationalization */}

              {/* Skip to main content for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50 transition-colors duration-200"
            >
              Skip to main content
            </a>

              <div id="root" className="min-h-full">
                {children}
              </div>

              {/* TODO: Add global modals portal */}
              <div id="modal-root" />

              {/* TODO: Add toast notifications portal */}
              <div id="toast-root" />
            </AuthProvider>
          </ThemeProvider>
        </ThemeErrorBoundary>
      </body>
    </html>
  );
}