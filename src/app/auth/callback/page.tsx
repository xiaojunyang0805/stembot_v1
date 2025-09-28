'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Processing auth callback...')

        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Auth callback error:', error)
          router.push('/auth/login?error=auth_callback_failed')
          return
        }

        if (data.session) {
          console.log('✅ Auth callback successful:', data.session.user.email)
          router.push('/dashboard')
        } else {
          console.log('ℹ️ No session found in callback')
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err)
        router.push('/auth/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Completing Sign In...
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '1rem'
        }}>
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  )
}