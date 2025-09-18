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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            We encountered an unexpected error. Don't worry - your learning data is safe and stored locally.
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-gray-100 p-4 rounded-lg text-sm">
              <summary className="cursor-pointer font-semibold text-gray-800 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-gray-700 text-xs overflow-auto">
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
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
        <div className="mt-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
          <div className="flex items-center justify-center mb-2">
            <span className="text-violet-600 mr-2">🔒</span>
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