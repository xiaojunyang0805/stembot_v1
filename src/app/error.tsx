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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl text-red-600">⚠</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>
        </div>
        
        <div className="mb-6">
          <p className="mb-4 text-gray-600">
            We encountered an unexpected error. Don't worry - your learning data is safe and stored locally.
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-lg bg-gray-100 p-4 text-left text-sm">
              <summary className="mb-2 cursor-pointer font-semibold text-gray-800">
                Error Details (Development)
              </summary>
              <pre className="overflow-auto text-xs text-gray-700">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="block w-full rounded-lg bg-gray-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
          >
            Return Home
          </Link>
          
          <Link
            href="/dashboard/dashboard"
            className="block w-full text-blue-600 hover:underline"
          >
            Go to Dashboard
          </Link>
        </div>
        
        {/* Privacy assurance */}
        <div className="mt-6 rounded-lg border border-violet-200 bg-violet-50 p-4">
          <div className="mb-2 flex items-center justify-center">
            <span className="mr-2 text-violet-600">🔒</span>
            <span className="font-semibold text-violet-900">Your Data is Safe</span>
          </div>
          <p className="text-sm text-violet-800">
            All your learning conversations and progress remain stored locally on your device.
          </p>
        </div>
        
        {/* Support information */}
        <div className="mt-4 text-sm text-gray-500">
          <p>Need help? Contact us at <a href="mailto:support@stembot.nl" className="text-blue-600 hover:underline">support@stembot.nl</a></p>
        </div>
      </div>
    </div>
  );
}