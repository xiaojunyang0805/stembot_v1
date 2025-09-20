/**
 * LoginForm Component
 *
 * Complete login form with email/password authentication, real-time validation,
 * Google OAuth integration, and comprehensive error handling.
 *
 * Location: src/components/auth/LoginForm.tsx
 */

'use client'

import * as React from 'react'
import { useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { cn } from '../../lib/utils'

import { useAuthForm } from '../../hooks/useAuth'
import { loginSchema } from '../../lib/utils/validation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  Section,
  SectionContent,
  SectionDivider
} from '../ui/Section'


import GoogleAuthButton from './GoogleAuthButton'

interface LoginFormProps {
  className?: string
  redirectTo?: string
}

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm({ className, redirectTo }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || redirectTo || '/dashboard'

  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Auth hook
  const {
    handleSignIn,
    handleGoogleSignIn,
    loading,
    error: authError,
    clearError
  } = useAuthForm({
    onSuccess: () => {
      router.push(callbackUrl)
    },
    onError: (error) => {
      setErrors(prev => ({ ...prev, general: error }))
    }
  })

  // Real-time validation
  const validateField = (name: string, value: string) => {
    try {
      if (name === 'email') {
        loginSchema.shape.email.parse(value)
        setErrors(prev => ({ ...prev, email: undefined }))
      } else if (name === 'password') {
        loginSchema.shape.password.parse(value)
        setErrors(prev => ({ ...prev, password: undefined }))
      }
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid input'
      setErrors(prev => ({ ...prev, [name]: errorMessage }))
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))

    // Clear general error when user starts typing
    if (errors.general || authError) {
      setErrors(prev => ({ ...prev, general: undefined }))
      clearError()
    }

    // Real-time validation for touched fields
    if (touched[name] && typeof fieldValue === 'string') {
      validateField(name, fieldValue)
    }
  }

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    if (typeof value === 'string') {
      validateField(name, value)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})
    clearError()

    // Validate all fields
    try {
      const validatedData = loginSchema.parse(formData)

      await handleSignIn({
        email: validatedData.email,
        password: validatedData.password
      })
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: FormErrors = {}
        error.errors.forEach((err: any) => {
          const field = err.path[0]
          fieldErrors[field as keyof FormErrors] = err.message
        })
        setErrors(fieldErrors)
      }
    }
  }

  // Handle Google Sign In
  const handleGoogleAuth = async () => {
    try {
      setErrors({})
      clearError()
      await handleGoogleSignIn()
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to sign in with Google'
      }))
    }
  }

  // Get display error (prioritize field errors over auth errors)
  const getDisplayError = () => {
    return errors.general || authError || null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error Display Section */}
      {getDisplayError() && (
        <Section
          variant="warning"
          padding="default"
          spacing="sm"
          className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
        >
          <div className="flex" role="alert" aria-live="polite">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                {getDisplayError()}
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Main Form Section */}
      <Section variant="transparent" padding="none" spacing="sm">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          errorText={errors.email}
          disabled={loading}
          autoComplete="email"
          required
          aria-describedby="email-error"
          inputSize="lg"
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Password Field */}
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          errorText={errors.password}
          disabled={loading}
          autoComplete="current-password"
          required
          aria-describedby="password-error"
          inputSize="lg"
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L18.5 18.5M21 12c-1.274 4.057-5.065 7-9.542 7m0 0L9.878 9.878" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </Link>
        </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            disabled={loading || !formData.email || !formData.password}
            className="w-full bg-blue-600 font-medium text-white transition-all duration-200 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </form>
      </Section>

      {/* Divider Section */}
      <Section variant="transparent" padding="none" spacing="sm">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
      </Section>

      {/* Google Auth Section */}
      <Section variant="transparent" padding="none" spacing="sm">
        <GoogleAuthButton
          onSignIn={handleGoogleAuth}
          loading={loading}
          text="Continue with Google"
        />
      </Section>

      {/* Sign Up Link Section */}
      <Section variant="light" padding="default" spacing="none" className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </Section>
    </div>
  )
}

export default LoginForm