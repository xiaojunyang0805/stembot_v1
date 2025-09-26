/**
 * Login Page for Research Mentoring Platform
 *
 * Provides secure authentication for researchers and administrators.
 * Includes form validation, error handling, and redirect management.
 *
 * @location src/app/(auth)/login/page.tsx
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '../../../components/auth/LoginForm';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Login | StemBot Research Mentor',
  description: 'Sign in to access your research projects and AI mentoring platform.',
};

interface LoginPageProps {
  searchParams: {
    redirect?: string;
    error?: string;
    message?: string;
  };
}

/**
 * Login page component for researcher authentication
 *
 * Features:
 * - Secure login form with validation
 * - Redirect handling after successful authentication
 * - Error message display for failed attempts
 * - Integration with Supabase Auth
 *
 * @param searchParams - URL search parameters for redirect and error handling
 * @returns JSX element containing the login interface
 */
export default function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, error, message } = searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue your research journey
          </p>
        </div>

        {/* Display error or success messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          <LoginForm redirectTo={redirect} />
        </Suspense>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * TODO: Implementation checklist
 *
 * 1. Security Features:
 *    - Implement rate limiting for login attempts
 *    - Add CAPTCHA for suspicious activity
 *    - Session timeout management
 *
 * 2. User Experience:
 *    - Remember me functionality
 *    - Social login options (Google, ORCID)
 *    - Password strength indicator
 *
 * 3. Analytics & Monitoring:
 *    - Track login success/failure rates
 *    - Monitor authentication patterns
 *    - Log security events
 *
 * 4. Accessibility:
 *    - Screen reader optimization
 *    - Keyboard navigation support
 *    - High contrast mode
 */