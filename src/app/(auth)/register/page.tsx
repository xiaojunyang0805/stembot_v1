/**
 * Registration Page for Research Mentoring Platform
 *
 * Allows new researchers to create accounts and join the platform.
 * Includes comprehensive form validation and institutional verification.
 *
 * @location src/app/(auth)/register/page.tsx
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join StemBot Research
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account to access AI-powered research mentoring
          </p>
        </div>

        {/* Display error messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Display invite information */}
        {invite && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            You've been invited to join a research project. Complete registration to get started.
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          <RegisterForm
            redirectTo={redirect}
            inviteToken={invite}
          />
        </Suspense>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in here
            </a>
          </p>

          <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            By registering, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-gray-700">
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