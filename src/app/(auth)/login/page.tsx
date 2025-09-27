/**
 * Login Page for Research Mentoring Platform
 *
 * Provides secure authentication for researchers and administrators.
 * Includes form validation, error handling, and redirect management.
 *
 * @location src/app/(auth)/login/page.tsx
 */

import { Suspense } from 'react';

import type { Metadata } from 'next';

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
    <div style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'}}>
      <div style={{width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem'}}>
        <div style={{textAlign: 'center'}}>
          <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#111827'}}>
            Welcome Back
          </h1>
          <p style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563'}}>
            Sign in to continue your research journey
          </p>
        </div>

        {/* Display error or success messages */}
        {error && (
          <div style={{borderRadius: '0.375rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', padding: '0.75rem 1rem', color: '#b91c1c'}}>
            {error}
          </div>
        )}

        {message && (
          <div style={{borderRadius: '0.375rem', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: '0.75rem 1rem', color: '#15803d'}}>
            {message}
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          <LoginForm redirectTo={redirect} />
        </Suspense>

        <div style={{textAlign: 'center'}}>
          <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
            Don't have an account?{' '}
            <a
              href="/register"
              style={{
                fontWeight: '500',
                color: '#2563eb',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#2563eb';
              }}
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