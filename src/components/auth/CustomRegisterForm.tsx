'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers/UnifiedAuthProvider'

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  userType: 'student' | 'educator' | 'parent'
  termsAccepted: boolean
}

interface FormErrors {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  terms: string
  general: string
}

export function CustomRegisterForm() {
  const router = useRouter()
  const { signUp, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    termsAccepted: false
  })

  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
    general: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Password validation
  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    return ''
  }

  // Get password strength
  const getPasswordStrength = (password: string): string => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return 'Weak'
    if (score === 3) return 'Fair'
    if (score === 4) return 'Good'
    return 'Strong'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
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
    const hasRequiredFields = formData.fullName && formData.email && formData.password &&
                             formData.confirmPassword && formData.termsAccepted
    const passwordsMatch = formData.password === formData.confirmPassword
    const validEmail = emailRegex.test(formData.email)
    const validPassword = validatePassword(formData.password) === ''

    return hasRequiredFields && passwordsMatch && validEmail && validPassword && !loading
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
      fullName: !formData.fullName ? 'Full name is required' : '',
      email: !formData.email ? 'Email is required' : !emailRegex.test(formData.email) ? 'Please enter a valid email address' : '',
      password: validatePassword(formData.password),
      confirmPassword: !formData.confirmPassword ? 'Please confirm your password' :
                      formData.password !== formData.confirmPassword ? 'Passwords do not match' : '',
      terms: !formData.termsAccepted ? 'You must accept the terms and conditions' : '',
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
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      await signUp(
        formData.email,
        formData.password,
        {
          firstName: firstName,
          lastName: lastName,
          role: 'researcher'
        }
      )

      setSuccessMessage('Account created successfully! Redirecting...')

      // Clear form data on success
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'student',
        termsAccepted: false
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to create account. Please try again.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const strength = formData.password ? getPasswordStrength(formData.password) : ''
  const strengthColor = {
    'Weak': '#dc2626',
    'Fair': '#ca8a04',
    'Good': '#16a34a',
    'Strong': '#059669'
  }[strength] || '#9ca3af'

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
        {/* Full Name Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            👤 Full Name
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.fullName ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          {errors.fullName && (
            <div style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '4px'
            }}>
              {errors.fullName}
            </div>
          )}
        </div>

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
            placeholder="Enter your email"
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
            placeholder="Create a password"
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
          {formData.password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                fontSize: '12px',
                color: strengthColor,
                fontWeight: '500'
              }}>
                Password strength: {strength}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            🔒 Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.confirmPassword ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          {errors.confirmPassword && (
            <div style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '4px'
            }}>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* User Type Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            👤 I am a:
          </label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleInputChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              backgroundColor: loading ? '#f9fafb' : 'white',
              outline: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            <option value="student">Student</option>
            <option value="educator">Educator</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        {/* Terms and Conditions */}
        <div style={{ marginBottom: '24px' }}>
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
              name="termsAccepted"
              checked={formData.termsAccepted}
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
            <span>
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                target="_blank"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <div style={{
              fontSize: '12px',
              color: '#dc2626',
              marginTop: '4px'
            }}>
              {errors.terms}
            </div>
          )}
        </div>

        {/* Create Account Button */}
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>

      {/* Sign In Link */}
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '24px'
      }}>
        Already have an account?{' '}
        <a
          href="/auth/login"
          style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          Sign In
        </a>
      </div>
    </div>
  )
}

export default CustomRegisterForm