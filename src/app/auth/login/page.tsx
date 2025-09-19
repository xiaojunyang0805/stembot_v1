// src/app/auth/login/page.tsx
/**
 * User login page
 * Production-ready login page with email/password and Google OAuth authentication
 * Integrates with existing WP1 authentication infrastructure
 */

import { Suspense } from 'react';

import type { Metadata } from 'next';

import AuthLayout from '../../../components/auth/AuthLayout';
import LoginForm from '../../../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In - StemBot',
  description: 'Sign in to your StemBot account and continue your STEM learning journey.',
  openGraph: {
    title: 'Sign In - StemBot',
    description: 'Sign in to your StemBot account and continue your STEM learning journey.',
  },
};

// Loading component for Suspense
function LoginFormFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Ready to continue learning?"
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}