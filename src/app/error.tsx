// =============================================================================
// ERROR BOUNDARY
// =============================================================================

// src/app/error.tsx
/**
 * Global error boundary component
 * Handles unexpected errors with recovery options and user feedback
 */

'use client';

import { useEffect } from 'react';

import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: Log error to monitoring service (Sentry, LogRocket, etc.)
    console.error('Global application error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50" style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div className="w-full max-w-md p-8 text-center" style={{
        width: '100%',
        maxWidth: '28rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        {/* Error Icon */}
        <div className="mb-6" style={{marginBottom: '1.5rem'}}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100" style={{
            margin: '0 auto 1rem auto',
            display: 'flex',
            height: '4rem',
            width: '4rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#fee2e2'
          }}>
            <span className="text-2xl text-red-600" style={{fontSize: '1.5rem', color: '#dc2626'}}>⚠</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900" style={{
            marginBottom: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827'
          }}>Something went wrong</h1>
        </div>
        
        <div style={{marginBottom: '1.5rem'}}>
          <p style={{marginBottom: '1rem', color: '#4b5563'}}>
            We encountered an unexpected error. Don't worry - your learning data is safe and stored locally.
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && (
            <details style={{borderRadius: '0.5rem', backgroundColor: '#f3f4f6', padding: '1rem', textAlign: 'left', fontSize: '0.875rem'}}>
              <summary style={{marginBottom: '0.5rem', cursor: 'pointer', fontWeight: '600', color: '#1f2937'}}>
                Error Details (Development)
              </summary>
              <pre style={{overflow: 'auto', fontSize: '0.75rem', color: '#374151'}}>
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        
        {/* Action buttons */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <button
            onClick={reset}
            style={{
              width: '100%',
              borderRadius: '0.5rem',
              backgroundColor: '#2563eb',
              padding: '0.75rem 1rem',
              fontWeight: '600',
              color: 'white',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
          >
            Try Again
          </button>
          
          <Link
            href="/"
            style={{
              display: 'block',
              width: '100%',
              borderRadius: '0.5rem',
              backgroundColor: '#4b5563',
              padding: '0.75rem 1rem',
              fontWeight: '600',
              color: 'white',
              transition: 'background-color 0.2s',
              textDecoration: 'none',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#374151'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#4b5563'}
          >
            Return Home
          </Link>
          
          <Link
            href="/dashboard/dashboard"
            style={{
              display: 'block',
              width: '100%',
              color: '#2563eb',
              textDecoration: 'none',
              textAlign: 'center',
              padding: '0.75rem 1rem'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
          >
            Go to Dashboard
          </Link>
        </div>
        
        {/* Privacy assurance */}
        <div style={{marginTop: '1.5rem', borderRadius: '0.5rem', border: '1px solid #ddd6fe', backgroundColor: '#f5f3ff', padding: '1rem'}}>
          <div style={{marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{marginRight: '0.5rem', color: '#7c3aed'}}>🔒</span>
            <span style={{fontWeight: '600', color: '#581c87'}}>Your Data is Safe</span>
          </div>
          <p style={{fontSize: '0.875rem', color: '#6b21a8'}}>
            All your learning conversations and progress remain stored locally on your device.
          </p>
        </div>
        
        {/* Support information */}
        <div style={{marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280'}}>
          <p>Need help? Contact us at <a href="mailto:support@stembot.nl" style={{color: '#2563eb', textDecoration: 'none'}} onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'} onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}>support@stembot.nl</a></p>
        </div>
      </div>
    </div>
  );
}