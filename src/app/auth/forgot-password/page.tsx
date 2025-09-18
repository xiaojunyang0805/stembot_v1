// src/app/auth/forgot-password/page.tsx
/**
 * Password reset page
 * Handles password reset email sending
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forgot Password - StemBot',
  description: 'Reset your StemBot password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      <p className="text-gray-600 text-center mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>
      
      {/* TODO: Replace with PasswordResetForm component */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📧 Email
          </label>
          <input 
            type="email" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send Reset Link
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}