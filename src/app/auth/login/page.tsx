// src/app/auth/login/page.tsx
/**
 * User login page
 * Handles email/password and Google OAuth authentication
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login - StemBot',
  description: 'Sign in to your StemBot account',
};

export default function LoginPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
      <p className="text-gray-600 text-center mb-8">Ready to continue learning?</p>
      
      {/* TODO: Replace with LoginForm component */}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔒 Password
          </label>
          <input 
            type="password" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
        <button 
          type="button"
          className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Continue with Google
        </button>
      </form>
      
      {/* TODO: Add LanguageSwitcher component */}
      <div className="mt-6 text-center">
        <select className="text-sm border rounded px-2 py-1">
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
        </select>
      </div>
      
      {/* TODO: Add PrivacyBanner component */}
      <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
        <p className="text-xs text-violet-700 text-center">
          🔒 Privacy: Local AI Active • All data stays on your device
        </p>
      </div>
      
      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}