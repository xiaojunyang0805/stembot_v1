'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { AuthUser, AuthSession, AuthContextType } from '../types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// Mock user for fallback
const mockUser: AuthUser = {
  id: 'research-user-id',
  email: 'researcher@stembot.app',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  profile: {
    id: 'research-user-id',
    email: 'researcher@stembot.app',
    first_name: 'Research',
    last_name: 'User',
    display_name: 'Research User',
    role: 'researcher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

const mockSession: AuthSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockAuth, setUsingMockAuth] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        console.log('🔐 Initializing authentication...')

        // Check if we should force mock mode
        const forceMock = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

        if (forceMock) {
          console.log('🎭 Forced mock mode enabled')
          setUsingMockAuth(true)
          if (mounted) setLoading(false)
          return
        }

        console.log('🔍 Checking for real Supabase authentication...')

        // Try to get current session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Supabase session error:', sessionError)

          // Check if we should fallback to mock
          if (process.env.NEXT_PUBLIC_FALLBACK_TO_MOCKS === 'true') {
            console.log('🎭 Falling back to mock authentication')
            setUsingMockAuth(true)
            if (mounted) setLoading(false)
            return
          }

          throw sessionError
        }

        if (mounted) {
          if (session?.user) {
            console.log('✅ Found real Supabase session:', session.user.email)
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
            setUsingMockAuth(false)
          } else {
            console.log('ℹ️ No active session found')
          }
          setLoading(false)
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state change:', event, session?.user?.email)

            if (mounted && !usingMockAuth) {
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

        // Fallback to mock if enabled
        if (process.env.NEXT_PUBLIC_FALLBACK_TO_MOCKS === 'true') {
          console.log('🎭 Falling back to mock authentication due to error')
          setUsingMockAuth(true)
        } else {
          if (mounted) setError('Authentication initialization failed')
        }

        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock sign in')
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUser(mockUser)
        setSession(mockSession)
        return
      }

      console.log('🔐 Real Supabase sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Supabase sign in error:', error)

        // Provide helpful error messages for common issues
        if (error.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else if (error.message.includes('Invalid API key')) {
          setError('Authentication service is temporarily unavailable. Please try again later.')
        } else {
          setError(`Sign in failed: ${error.message}`)
        }
        throw error
      }

      if (data.user) {
        console.log('✅ Sign in successful for:', data.user.email)
      }
    } catch (err: any) {
      console.error('❌ Sign in exception:', err)
      setError(err.message || 'Sign in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    setError(null)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock sign up')
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUser(mockUser)
        setSession(mockSession)
        return
      }

      console.log('🔐 Real Supabase sign up for:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('❌ Supabase sign up error:', error)

        // Provide helpful error messages for common configuration issues
        if (error.message.includes('Email signups are disabled')) {
          setError('Email registration is currently disabled. Please contact support or try signing in with Google.')
        } else if (error.message.includes('Invalid API key')) {
          setError('Authentication service is temporarily unavailable. Please try again later or contact support.')
        } else {
          setError(`Registration failed: ${error.message}`)
        }
        throw error
      }

      if (data.user) {
        console.log('✅ Sign up successful for:', data.user.email)
        if (!data.user.email_confirmed_at) {
          console.log('📧 Email confirmation required')
          setError('Please check your email and click the confirmation link to complete registration.')
        }
      }
    } catch (err: any) {
      console.error('❌ Sign up exception:', err)
      setError(err.message || 'Sign up failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock Google sign in')
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUser(mockUser)
        setSession(mockSession)
        return
      }

      console.log('🔐 Real Google OAuth sign in')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock sign out')
        await new Promise(resolve => setTimeout(resolve, 500))
        setUser(null)
        setSession(null)
        return
      }

      console.log('🔐 Real Supabase sign out')
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (err: any) {
      setError(err.message || 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock password reset')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return
      }

      console.log('🔐 Real password reset')
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    setLoading(true)
    setError(null)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock password update')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return
      }

      console.log('🔐 Real password update')
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || 'Password update failed')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    setLoading(true)
    setError(null)

    try {
      if (usingMockAuth) {
        console.log('🎭 Mock profile update')
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (user?.profile) {
          const updatedUser = {
            ...user,
            profile: { ...user.profile, ...updates }
          }
          setUser(updatedUser)
        }
        return
      }

      console.log('🔐 Real profile update')
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      if (usingMockAuth) {
        console.log('🎭 Mock session refresh')
        await new Promise(resolve => setTimeout(resolve, 500))
        return
      }

      console.log('🔐 Real session refresh')
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Re-export unified auth for backward compatibility
export { useAuth } from './UnifiedAuthProvider'

export default AuthProvider