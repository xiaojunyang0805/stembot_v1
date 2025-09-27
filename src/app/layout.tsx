// =============================================================================
// ROOT LAYOUT
// =============================================================================

// src/app/layout.tsx
/**
 * Root layout component for StemBot application
 * Provides global providers, theme, authentication, and base HTML structure
 */

import { Inter } from 'next/font/google';

import type { Metadata } from 'next';

import './globals.css';
import { AuthProvider } from '../providers/AuthProvider';
import { ThemeProvider, ThemeErrorBoundary } from '../providers/ThemeProvider';
import { VersionSync, VersionDisplay } from '../components/common/VersionSync';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StemBot - AI Research Mentor Platform',
  description: 'Memory-driven AI research mentor for university students. Continuous project support, methodology guidance, and academic writing assistance.',
  keywords: 'AI research mentor, university research, academic writing, methodology design, literature review, research assistant',
  authors: [{ name: 'StemBot Team' }],
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" style={{height: '100%'}} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="cache-bust" content={`f940f53-${Date.now()}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body style={{height: '100%', backgroundColor: '#ffffff', color: '#0f172a', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', fontFamily: inter.style.fontFamily}}>
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
              style={{
                position: 'absolute',
                left: '-10000px',
                top: 'auto',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                zIndex: 50,
                borderRadius: '0.5rem',
                backgroundColor: '#2563eb',
                padding: '0.5rem 1rem',
                color: 'white'
              }}
            >
              Skip to main content
            </a>

              <div id="root" style={{minHeight: '100%'}}>
                {children}
              </div>

              {/* Version synchronization for deployment consistency */}
              <VersionSync />
              <VersionDisplay />

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