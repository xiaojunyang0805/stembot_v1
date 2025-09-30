'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers/UnifiedAuthProvider'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email: string
  password: string
  general: string
}

export function CustomLoginForm() {
  const router = useRouter()
  const { signIn, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    general: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Clear errors when user starts typing
    if (errors.general || error) {
      setErrors(prev => ({ ...prev, general: '' }))
      clearError()
    }

    if (successMessage) {
      setSuccessMessage('')
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    const hasRequiredFields = formData.email && formData.password
    const validEmail = emailRegex.test(formData.email)

    return hasRequiredFields && validEmail && !loading
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading || isSubmitting) return

    // Clear previous errors
    setErrors(prev => ({ ...prev, general: '' }))
    clearError()
    setSuccessMessage('')
    setIsSubmitting(true)

    // Validate all fields
    const newErrors: FormErrors = {
      email: !formData.email ? 'Email is required' : !emailRegex.test(formData.email) ? 'Please enter a valid email address' : '',
      password: !formData.password ? 'Password is required' : '',
      general: ''
    }

    setErrors(newErrors)

    // Check if form is valid
    const hasErrors = Object.values(newErrors).some(error => error !== '')
    if (hasErrors) {
      setIsSubmitting(false)
      return
    }

    try {
      await signIn(formData.email, formData.password)

      setSuccessMessage('Login successful! Redirecting...')

      // Clear form data on success
      setFormData({
        email: '',
        password: '',
        rememberMe: false
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      console.error('Login error:', error)
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Login failed. Please check your credentials.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>✅</span>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {(errors.general || error) && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>❌</span>
          {errors.general || error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        {/* Email Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            📧 Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.email ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          {errors.email && (
            <div style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '4px'
            }}>
              {errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            🔒 Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.password ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          {errors.password && (
            <div style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '4px'
            }}>
              {errors.password}
            </div>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#374151',
            cursor: 'pointer',
            gap: '8px'
          }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#2563eb',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            />
            Remember me
          </label>
          <a
            href="/auth/forgot-password"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={!isFormValid()}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: isFormValid() ? '#2563eb' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isFormValid() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
            opacity: isFormValid() ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>

      {/* OAuth Separator */}
      <div style={{
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <span style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Or continue with
        </span>
      </div>

      {/* Google Sign In Button */}
      <button
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: 'white',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '20px' }}>🔵</span>
        Continue with Google
      </button>

      {/* Sign Up Link */}
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        Don't have an account?{' '}
        <a
          href="/auth/register"
          style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          Sign up
        </a>
      </div>
    </div>
  )
}

export default CustomLoginForm