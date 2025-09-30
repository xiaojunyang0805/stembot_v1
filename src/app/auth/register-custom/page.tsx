'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CustomAuthProvider, { useCustomAuth } from '../../../providers/CustomAuthProvider'
import CustomRegisterForm from '../../../components/auth/CustomRegisterForm'

function RegisterPageContent() {
  const router = useRouter()
  const { user, loading } = useCustomAuth()

  useEffect(() => {
    document.title = 'Sign Up - StemBot Custom Auth'
  }, [])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('RegisterPage: User is already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [loading, user, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #dbeafe, #f0f9ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>
            Checking authentication...
          </div>
        </div>
      </div>
    )
  }

  // Don't render register form if user is authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #dbeafe, #f0f9ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px'
      }}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '8px'
          }}>
            StemBot
          </h1>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Join StemBot
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Start your learning journey today
          </p>
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#166534'
          }}>
            ✅ Custom Authentication - Works with ANY email provider!
          </div>
        </div>

        {/* Custom Registration Form */}
        <CustomRegisterForm />

        {/* Privacy Banner */}
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '1px solid #c4b5fd',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#581c87'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            🔒 100% Private • Local AI Processing
          </div>
        </div>

        {/* Language Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🇺🇸 English
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🇳🇱 Nederlands
          </button>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <CustomAuthProvider>
      <RegisterPageContent />
    </CustomAuthProvider>
  )
}