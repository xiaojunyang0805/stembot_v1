/**
 * GoogleAuthButton Component - Isolated Styling
 *
 * Google OAuth integration button with branded styling and loading states.
 * Uses only inline styles to avoid conflicts with other components.
 * Follows Google's branding guidelines and provides accessible authentication.
 */

'use client'

import * as React from 'react'

interface GoogleAuthButtonProps {
  onSignIn: () => Promise<void>
  loading?: boolean
  disabled?: boolean
  className?: string
  text?: string
}

// Google Logo SVG Component - Isolated
const GoogleIcon = () => (
  <svg
    style={{
      width: '20px',
      height: '20px',
      marginRight: '12px'
    }}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

// Loading Spinner Component
const LoadingSpinner = () => (
  <div style={{
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid #6b7280',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '12px'
  }} />
)

export function GoogleAuthButton({
  onSignIn,
  loading = false,
  disabled = false,
  className,
  text = "Continue with Google"
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleClick = async () => {
    if (loading || disabled || isLoading) {
      return
    }

    console.log('=== GOOGLE AUTH BUTTON CLICKED ===');
    console.log('Current location:', window.location.href);
    console.log('About to trigger OAuth...');

    try {
      setIsLoading(true)
      await onSignIn()
    } catch (error) {
      // Error is handled by the parent component
      console.error('Google sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = disabled || loading || isLoading
  const showLoading = isLoading || loading

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={`${text} - Opens Google authentication in a new window`}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: isDisabled ? '#f9fafb' : 'white',
          color: isDisabled ? '#9ca3af' : '#374151',
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: 'inherit',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          boxSizing: 'border-box',
          minHeight: '48px'
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            const target = e.target as HTMLButtonElement
            target.style.setProperty('background-color', '#f9fafb')
            target.style.setProperty('border-color', '#9ca3af')
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            const target = e.target as HTMLButtonElement
            target.style.setProperty('background-color', 'white')
            target.style.setProperty('border-color', '#d1d5db')
          }
        }}
        onFocus={(e) => {
          if (!isDisabled) {
            const target = e.target as HTMLButtonElement
            target.style.setProperty('border-color', '#2563eb')
            target.style.setProperty('box-shadow', '0 0 0 3px rgba(37, 99, 235, 0.1)')
          }
        }}
        onBlur={(e) => {
          if (!isDisabled) {
            const target = e.target as HTMLButtonElement
            target.style.setProperty('border-color', '#d1d5db')
            target.style.setProperty('box-shadow', 'none')
          }
        }}
      >
        {showLoading ? <LoadingSpinner /> : <GoogleIcon />}
        {text}
      </button>
    </>
  )
}

export default GoogleAuthButton