'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { AuthUser, AuthSession, AuthContextType } from '../types/auth'

const UnifiedAuthContext = createContext<AuthContextType | null>(null)

interface UnifiedAuthProviderProps {
  children: ReactNode
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        console.log('🔐 Initializing unified authentication...')

        // First, check for custom JWT token
        const customToken = localStorage.getItem('authToken')
        if (customToken) {
          console.log('🎯 Found custom auth token, verifying...')

          try {
            const response = await fetch('/api/auth/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: customToken })
            })

            if (response.ok) {
              const data = await response.json()
              console.log('✅ Custom auth verified:', data.user.email)

              if (mounted) {
                // Convert custom user to AuthUser format
                const authUser: AuthUser = {
                  id: data.user.id,
                  email: data.user.email,
                  email_confirmed_at: data.user.createdAt,
                  created_at: data.user.createdAt,
                  updated_at: data.user.createdAt,
                  profile: {
                    id: data.user.id,
                    email: data.user.email,
                    first_name: data.user.firstName,
                    last_name: data.user.lastName,
                    display_name: `${data.user.firstName} ${data.user.lastName}`.trim(),
                    role: data.user.role,
                    created_at: data.user.createdAt,
                    updated_at: data.user.createdAt
                  }
                }

                setUser(authUser)
                setSession({
                  access_token: customToken,
                  refresh_token: '',
                  expires_in: 7 * 24 * 60 * 60, // 7 days
                  token_type: 'bearer',
                  user: authUser
                })
                setLoading(false)
                return
              }
            } else {
              console.log('❌ Custom token invalid, removing...')
              localStorage.removeItem('authToken')
            }
          } catch (err) {
            console.error('❌ Custom token verification failed:', err)
            localStorage.removeItem('authToken')
          }
        }

        // If no custom token or verification failed, check Supabase Auth
        console.log('🔍 Checking for Supabase authentication...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Supabase session error:', sessionError)
          if (mounted) setLoading(false)
          return
        }

        if (mounted) {
          if (session?.user) {
            console.log('✅ Found Supabase session:', session.user.email)
            // Convert Supabase user to AuthUser format
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              email_confirmed_at: session.user.email_confirmed_at || '',
              created_at: session.user.created_at || '',
              updated_at: session.user.updated_at || '',
              profile: {
                id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.name?.split(' ')[0] || '',
                last_name: session.user.user_metadata?.last_name || session.user.user_metadata?.name?.split(' ')[1] || '',
                display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || '',
                role: 'researcher',
                created_at: session.user.created_at || '',
                updated_at: session.user.updated_at || ''
              }
            }

            setUser(authUser)
            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token || '',
              expires_in: session.expires_in || 3600,
              token_type: session.token_type || 'bearer',
              user: authUser
            })
          } else {
            console.log('ℹ️ No active session found')
          }
          setLoading(false)
        }

        // Listen for Supabase auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Supabase auth state change:', event, session?.user?.email)

            if (mounted) {
              if (session?.user) {
                const authUser: AuthUser = {
                  id: session.user.id,
                  email: session.user.email || '',
                  email_confirmed_at: session.user.email_confirmed_at || '',
                  created_at: session.user.created_at || '',
                  updated_at: session.user.updated_at || '',
                  profile: {
                    id: session.user.id,
                    email: session.user.email || '',
                    first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.name?.split(' ')[0] || '',
                    last_name: session.user.user_metadata?.last_name || session.user.user_metadata?.name?.split(' ')[1] || '',
                    display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || '',
                    role: 'researcher',
                    created_at: session.user.created_at || '',
                    updated_at: session.user.updated_at || ''
                  }
                }

                setUser(authUser)
                setSession({
                  access_token: session.access_token,
                  refresh_token: session.refresh_token || '',
                  expires_in: session.expires_in || 3600,
                  token_type: session.token_type || 'bearer',
                  user: authUser
                })
              } else {
                // Also clear custom token if Supabase session ends
                localStorage.removeItem('authToken')
                setUser(null)
                setSession(null)
              }
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }

      } catch (err) {
        console.error('❌ Auth initialization error:', err)
        if (mounted) {
          setError('Authentication initialization failed')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Custom authentication sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Custom sign in for:', email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store custom token
      localStorage.setItem('authToken', data.token)

      // Convert to AuthUser format
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.createdAt,
        created_at: data.user.createdAt,
        updated_at: data.user.createdAt,
        profile: {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.firstName,
          last_name: data.user.lastName,
          display_name: `${data.user.firstName} ${data.user.lastName}`.trim(),
          role: data.user.role,
          created_at: data.user.createdAt,
          updated_at: data.user.createdAt
        }
      }

      setUser(authUser)
      setSession({
        access_token: data.token,
        refresh_token: '',
        expires_in: 7 * 24 * 60 * 60, // 7 days
        token_type: 'bearer',
        user: authUser
      })

      console.log('✅ Custom sign in successful')

    } catch (err: any) {
      console.error('❌ Custom sign in error:', err)
      setError(err.message || 'Sign in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Custom authentication sign up
  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Custom sign up for:', email)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: metadata?.firstName || '',
          lastName: metadata?.lastName || '',
          role: metadata?.role || 'researcher'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store custom token
      localStorage.setItem('authToken', data.token)

      // Convert to AuthUser format
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.createdAt,
        created_at: data.user.createdAt,
        updated_at: data.user.createdAt,
        profile: {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.firstName,
          last_name: data.user.lastName,
          display_name: `${data.user.firstName} ${data.user.lastName}`.trim(),
          role: data.user.role,
          created_at: data.user.createdAt,
          updated_at: data.user.createdAt
        }
      }

      setUser(authUser)
      setSession({
        access_token: data.token,
        refresh_token: '',
        expires_in: 7 * 24 * 60 * 60, // 7 days
        token_type: 'bearer',
        user: authUser
      })

      console.log('✅ Custom sign up successful')

    } catch (err: any) {
      console.error('❌ Custom sign up error:', err)
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth sign in (Supabase)
  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Google OAuth sign in')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (err: any) {
      console.error('❌ Google sign in error:', err)
      setError(err.message || 'Google sign in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Unified sign out
  const signOut = async () => {
    setLoading(true)

    try {
      console.log('🔐 Unified sign out')

      // Clear custom token
      localStorage.removeItem('authToken')

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      }

      // Clear state
      setUser(null)
      setSession(null)

    } catch (err: any) {
      console.error('❌ Sign out error:', err)
      setError(err.message || 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  // Other methods use Supabase for compatibility
  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Password reset for:', email)
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Password reset failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Password update')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Password update failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Profile update')

      // For custom auth users, we'd need to implement a profile update API
      // For now, use Supabase for Google OAuth users
      const { error } = await supabase.auth.updateUser({ data: updates })
      if (error) throw error

      // Update local state
      if (user?.profile) {
        const updatedUser = {
          ...user,
          profile: { ...user.profile, ...updates }
        }
        setUser(updatedUser)
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      console.log('🔐 Session refresh')
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh error:', error)
      }
    } catch (err) {
      console.error('Session refresh error:', err)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    clearError
  }

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider')
  }
  return context
}

// Alias for backward compatibility
export const useAuth = useUnifiedAuth

export default UnifiedAuthProvider