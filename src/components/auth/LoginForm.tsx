/**
 * LoginForm Component - BULLETPROOF VERSION
 *
 * Completely isolated styling that overrides ALL possible CSS conflicts
 * Uses aggressive CSS specificity and !important declarations
 */

'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { useAuthForm } from '../../hooks/useAuth'
import { loginSchema } from '../../lib/utils/validation'

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
    console.log('=== LOGIN FORM GOOGLE AUTH HANDLER ===');
    console.log('handleGoogleAuth called');
    console.log('About to call handleGoogleSignIn from useAuthForm...');

    try {
      setErrors({})
      clearError()
      await handleGoogleSignIn()
      console.log('handleGoogleSignIn completed successfully');
    } catch (error: any) {
      console.error('handleGoogleAuth error:', error);
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
    <>
      {/* BULLETPROOF CSS that overrides everything */}
      <style>{`
        /* Reset and override ANY conflicting styles */
        .stembot-login-form * {
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: inherit !important;
          line-height: normal !important;
          color: inherit !important;
          text-decoration: none !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          white-space: normal !important;
          vertical-align: baseline !important;
          list-style: none !important;
          border-collapse: collapse !important;
          border-spacing: 0 !important;
          position: static !important;
          top: auto !important;
          right: auto !important;
          bottom: auto !important;
          left: auto !important;
          z-index: auto !important;
          float: none !important;
          clear: none !important;
          overflow: visible !important;
          clip: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
          transition: none !important;
          content: none !important;
          quotes: none !important;
          counter-reset: none !important;
          counter-increment: none !important;
          min-width: 0 !important;
          max-width: none !important;
          min-height: 0 !important;
          max-height: none !important;
          resize: none !important;
          outline: none !important;
          outline-offset: 0 !important;
          text-shadow: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background-image: none !important;
          background-repeat: no-repeat !important;
          background-attachment: scroll !important;
          background-position: 0 0 !important;
          background-size: auto !important;
          background-origin: padding-box !important;
          background-clip: border-box !important;
        }

        /* Container */
        .stembot-login-form {
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          width: 100% !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        /* Labels */
        .stembot-login-form .field-label {
          display: block !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #374151 !important;
          margin-bottom: 6px !important;
          margin-top: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          line-height: normal !important;
        }

        /* Input fields */
        .stembot-login-form .field-input {
          width: 100% !important;
          padding: 12px 16px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 16px !important;
          background-color: white !important;
          outline: none !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
          color: #111827 !important;
          transition: border-color 0.2s ease !important;
          height: auto !important;
          min-height: 48px !important;
          max-height: none !important;
          margin: 0 !important;
          position: static !important;
          display: block !important;
          text-align: left !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          line-height: normal !important;
          white-space: normal !important;
          vertical-align: baseline !important;
          resize: none !important;
          overflow: visible !important;
          clip: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
          content: none !important;
          text-shadow: none !important;
          box-shadow: none !important;
          background-image: none !important;
          background-repeat: no-repeat !important;
          background-attachment: scroll !important;
          background-position: 0 0 !important;
          background-size: auto !important;
          background-origin: padding-box !important;
          background-clip: border-box !important;
        }

        .stembot-login-form .field-input:focus {
          border-color: #2563eb !important;
          outline: none !important;
          box-shadow: none !important;
        }

        .stembot-login-form .field-input.error {
          border-color: #ef4444 !important;
        }

        .stembot-login-form .field-input:disabled {
          background-color: #f9fafb !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
        }

        /* Button */
        .stembot-login-form .submit-button {
          width: 100% !important;
          padding: 12px !important;
          background-color: #2563eb !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
          min-height: 48px !important;
          margin: 0 !important;
          display: block !important;
          text-align: center !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          line-height: normal !important;
          white-space: normal !important;
          vertical-align: baseline !important;
          position: static !important;
          outline: none !important;
          text-shadow: none !important;
          box-shadow: none !important;
          background-image: none !important;
          background-repeat: no-repeat !important;
          background-attachment: scroll !important;
          background-position: 0 0 !important;
          background-size: auto !important;
          background-origin: padding-box !important;
          background-clip: border-box !important;
        }

        .stembot-login-form .submit-button:disabled {
          background-color: #9ca3af !important;
          cursor: not-allowed !important;
        }

        .stembot-login-form .submit-button:hover:not(:disabled) {
          background-color: #1d4ed8 !important;
        }

        /* Error text */
        .stembot-login-form .error-text {
          color: #ef4444 !important;
          font-size: 12px !important;
          margin-top: 4px !important;
          margin-bottom: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          font-family: inherit !important;
          line-height: normal !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          white-space: normal !important;
          vertical-align: baseline !important;
        }

        /* Field containers */
        .stembot-login-form .field-container {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          position: static !important;
          display: block !important;
        }

        /* Password container */
        .stembot-login-form .password-container {
          position: relative !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          display: block !important;
        }

        /* Password toggle */
        .stembot-login-form .password-toggle {
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          background: none !important;
          border: none !important;
          color: #6b7280 !important;
          cursor: pointer !important;
          font-size: 14px !important;
          padding: 4px !important;
          margin: 0 !important;
          font-family: inherit !important;
          line-height: normal !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          outline: none !important;
          text-shadow: none !important;
          box-shadow: none !important;
          text-align: center !important;
          vertical-align: baseline !important;
        }

        /* Row layouts */
        .stembot-login-form .form-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          position: static !important;
        }

        .stembot-login-form .checkbox-label {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
          color: #6b7280 !important;
          line-height: normal !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          position: static !important;
        }

        .stembot-login-form .checkbox-input {
          accent-color: #2563eb !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          max-width: none !important;
          max-height: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          color: inherit !important;
          outline: none !important;
          position: static !important;
        }

        /* Links */
        .stembot-login-form .form-link {
          font-size: 14px !important;
          color: #2563eb !important;
          text-decoration: none !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          font-family: inherit !important;
          line-height: normal !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          position: static !important;
          outline: none !important;
        }

        .stembot-login-form .form-link:hover {
          text-decoration: underline !important;
        }

        /* Divider */
        .stembot-login-form .divider-container {
          display: flex !important;
          align-items: center !important;
          text-align: center !important;
          margin: 20px 0 !important;
          width: 100% !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          position: static !important;
        }

        .stembot-login-form .divider-line {
          flex: 1 !important;
          height: 1px !important;
          background-color: #e5e7eb !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          position: static !important;
        }

        .stembot-login-form .divider-text {
          padding: 0 16px !important;
          font-size: 14px !important;
          color: #6b7280 !important;
          background-color: white !important;
          margin: 0 !important;
          border: none !important;
          font-family: inherit !important;
          line-height: normal !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          position: static !important;
        }

        /* Sign up section */
        .stembot-login-form .signup-section {
          text-align: center !important;
          padding: 16px !important;
          background-color: #f9fafb !important;
          border-radius: 8px !important;
          margin: 0 !important;
          border: none !important;
          font-family: inherit !important;
          position: static !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .stembot-login-form .signup-text {
          font-size: 14px !important;
          color: #6b7280 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: none !important;
          font-family: inherit !important;
          line-height: normal !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          position: static !important;
        }
      `}</style>

      <div className="stembot-login-form">
        {/* Error Display */}
        {getDisplayError() && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {getDisplayError()}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="field-container">
            <label className="field-label">
              📧 Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={loading}
              autoComplete="email"
              required
              className={`field-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <p className="error-text">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="field-container">
            <label className="field-label">
              🔒 Password
            </label>
            <div className="password-container">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={loading}
                autoComplete="current-password"
                required
                className={`field-input ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p className="error-text">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={loading}
                className="checkbox-input"
              />
              <span>Remember me</span>
            </label>

            <Link href="/auth/forgot-password" className="form-link">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="submit-button"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider-container">
          <div className="divider-line"></div>
          <span className="divider-text">Or continue with</span>
          <div className="divider-line"></div>
        </div>

        {/* Google Auth */}
        <GoogleAuthButton
          onSignIn={handleGoogleAuth}
          loading={loading}
          text="Continue with Google"
        />

        {/* Sign Up Link */}
        <div className="signup-section">
          <p className="signup-text">
            Don't have an account?{' '}
            <Link href="/auth/register" className="form-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default LoginForm