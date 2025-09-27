'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

import { AuthUser, AuthSession, AuthContextType } from '../types/auth'

// Mock AuthProvider for UI-only components
const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock user for research environment
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

  useEffect(() => {
    // Mock initial auth check
    setTimeout(() => {
      setUser(mockUser)
      setSession(mockSession)
      setLoading(false)
    }, 1000)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      // Mock sign in
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser(mockUser)
      setSession(mockSession)
    } catch (err) {
      setError('Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    setError(null)
    try {
      // Mock sign up
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser(mockUser)
      setSession(mockSession)
    } catch (err) {
      setError('Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock Google sign in
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser(mockUser)
      setSession(mockSession)
    } catch (err) {
      setError('Google sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Mock sign out
      await new Promise(resolve => setTimeout(resolve, 500))
      setUser(null)
      setSession(null)
    } catch (err) {
      setError('Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      // Mock password reset
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      setError('Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    setLoading(true)
    setError(null)
    try {
      // Mock password update
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      setError('Password update failed')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    setLoading(true)
    setError(null)
    try {
      // Mock profile update
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (user?.profile) {
        const updatedUser = {
          ...user,
          profile: { ...user.profile, ...updates }
        }
        setUser(updatedUser)
      }
    } catch (err) {
      setError('Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    // Mock session refresh
    await new Promise(resolve => setTimeout(resolve, 500))
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider