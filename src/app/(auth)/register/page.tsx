/**
 * Registration Page for Research Mentoring Platform
 *
 * Allows new researchers to create accounts and join the platform.
 * Includes comprehensive form validation and institutional verification.
 *
 * @location src/app/(auth)/register/page.tsx
 */

import { Suspense } from 'react';

import type { Metadata } from 'next';

import { RegisterForm } from '../../../components/auth/RegisterForm';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Register | StemBot Research Mentor',
  description: 'Join the research mentoring platform and start your academic journey with AI-powered guidance.',
};

interface RegisterPageProps {
  searchParams: {
    redirect?: string;
    invite?: string;
    error?: string;
  };
}

/**
 * Registration page component for new researcher onboarding
 *
 * Features:
 * - Multi-step registration form
 * - Institutional email verification
 * - Research field selection
 * - Terms and privacy acceptance
 * - Integration with Supabase Auth
 *
 * @param searchParams - URL search parameters for invites and redirects
 * @returns JSX element containing the registration interface
 */
export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect, invite, error } = searchParams;

  return (
    <div style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'}}>
      <div style={{width: '100%', maxWidth: '42rem', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem'}}>
        <div style={{textAlign: 'center'}}>
          <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#111827'}}>
            Join StemBot Research
          </h1>
          <p style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563'}}>
            Create your account to access AI-powered research mentoring
          </p>
        </div>

        {/* Display error messages */}
        {error && (
          <div style={{borderRadius: '0.375rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', padding: '0.75rem 1rem', color: '#b91c1c'}}>
            {error}
          </div>
        )}

        {/* Display invite information */}
        {invite && (
          <div style={{borderRadius: '0.375rem', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', padding: '0.75rem 1rem', color: '#1d4ed8'}}>
            You've been invited to join a research project. Complete registration to get started.
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          <RegisterForm
            redirectTo={redirect}
            inviteToken={invite}
          />
        </Suspense>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center'}}>
          <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
            Already have an account?{' '}
            <a
              href="/login"
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
              Sign in here
            </a>
          </p>

          <div style={{margin: '0 auto', maxWidth: '28rem', fontSize: '0.75rem', color: '#6b7280'}}>
            By registering, you agree to our{' '}
            <a href="/terms" style={{
              textDecoration: 'underline',
              color: '#6b7280',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.color = '#6b7280';
            }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" style={{
              textDecoration: 'underline',
              color: '#6b7280',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.color = '#6b7280';
            }}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Registration form interface
 */
export interface RegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Academic Information
  institution: string;
  fieldOfStudy: string;
  academicLevel: 'undergraduate' | 'graduate' | 'postdoc' | 'faculty' | 'researcher';
  orcidId?: string;

  // Account Settings
  role: 'researcher';
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  emailUpdates: boolean;

  // Optional
  inviteToken?: string;
  referralSource?: string;
}

/**
 * TODO: Implementation checklist
 *
 * 1. Validation & Security:
 *    - Email verification flow
 *    - Password strength requirements
 *    - Institutional email domain validation
 *    - ORCID integration for researcher verification
 *
 * 2. Onboarding Experience:
 *    - Multi-step form with progress indicator
 *    - Field auto-completion and suggestions
 *    - Institutional affiliation verification
 *    - Research interest selection
 *
 * 3. Data Collection:
 *    - GDPR compliance for EU researchers
 *    - Research ethics training completion
 *    - Institutional IRB information
 *    - Publication preferences
 *
 * 4. Integration Features:
 *    - Import existing research profiles
 *    - Connect with academic databases
 *    - Institutional SSO support
 *    - Team invitation system
 */