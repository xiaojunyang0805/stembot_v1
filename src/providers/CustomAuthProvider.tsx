'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CustomUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  emailVerified: boolean
  createdAt: string
}

export interface CustomAuthContextType {
  user: CustomUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>
  signOut: () => void
  clearError: () => void
}

const CustomAuthContext = createContext<CustomAuthContextType | null>(null)

interface CustomAuthProviderProps {
  children: ReactNode
}

export function CustomAuthProvider({ children }: CustomAuthProviderProps) {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Invalid token, remove it
        localStorage.removeItem('authToken')
      }
    } catch (err) {
      console.error('Auth check error:', err)
      localStorage.removeItem('authToken')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token)
      setUser(data.user)

    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: string = 'researcher') => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token)
      setUser(data.user)

    } catch (err: any) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const value: CustomAuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError
  }

  return (
    <CustomAuthContext.Provider value={value}>
      {children}
    </CustomAuthContext.Provider>
  )
}

export function useCustomAuth() {
  const context = useContext(CustomAuthContext)
  if (!context) {
    throw new Error('useCustomAuth must be used within a CustomAuthProvider')
  }
  return context
}

export default CustomAuthProvider