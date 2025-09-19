'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import type {
  AuthContextType,
  AuthState,
  AuthEvent,
  UserSignUpData,
  AuthUser,
  AuthSession,
  UserProfileUpdate
} from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthEvent): AuthState {
  switch (action.type) {
    case 'SIGN_IN_START':
    case 'SIGN_UP_START':
    case 'SESSION_REFRESH_START':
    case 'PROFILE_UPDATE_START':
      return {
        ...state,
        loading: true,
        error: null,
      }

    case 'SIGN_IN_SUCCESS':
    case 'SESSION_REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        loading: false,
        error: null,
      }

    case 'SIGN_UP_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        loading: false,
        error: null,
      }

    case 'SIGN_OUT_START':
      return {
        ...state,
        loading: true,
        error: null,
      }

    case 'SIGN_OUT_SUCCESS':
      return {
        ...state,
        user: null,
        session: null,
        loading: false,
        error: null,
      }

    case 'SIGN_IN_ERROR':
    case 'SIGN_UP_ERROR':
    case 'SIGN_OUT_ERROR':
    case 'SESSION_REFRESH_ERROR':
    case 'PROFILE_UPDATE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      }

    case 'PROFILE_UPDATE_SUCCESS':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          profile: action.payload.profile,
        } : null,
        loading: false,
        error: null,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading,
      }

    default:
      return state
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const supabase = createClient()

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      return null
    }
  }, [supabase])

  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const profile = await loadUserProfile(session.user.id)
      const authUser: AuthUser = {
        ...session.user,
        profile,
      }
      const authSession: AuthSession = {
        ...session,
        user: authUser,
      }

      dispatch({
        type: 'SIGN_IN_SUCCESS',
        payload: { user: authUser, session: authSession },
      })
    } else if (event === 'SIGNED_OUT') {
      dispatch({ type: 'SIGN_OUT_SUCCESS' })
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      const profile = await loadUserProfile(session.user.id)
      const authUser: AuthUser = {
        ...session.user,
        profile,
      }
      const authSession: AuthSession = {
        ...session,
        user: authUser,
      }

      dispatch({
        type: 'SESSION_REFRESH_SUCCESS',
        payload: { user: authUser, session: authSession },
      })
    }
  }, [loadUserProfile])

  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { loading: true } })

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        dispatch({ type: 'SIGN_OUT_SUCCESS' })
        return
      }

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id)
        const authUser: AuthUser = {
          ...session.user,
          profile,
        }
        const authSession: AuthSession = {
          ...session,
          user: authUser,
        }

        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      } else {
        dispatch({ type: 'SIGN_OUT_SUCCESS' })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      dispatch({ type: 'SIGN_OUT_SUCCESS' })
    }
  }, [supabase, loadUserProfile])

  useEffect(() => {
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, handleAuthStateChange, initializeAuth])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SIGN_IN_START' })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user && data.session) {
        const profile = await loadUserProfile(data.user.id)
        const authUser: AuthUser = {
          ...data.user,
          profile,
        }
        const authSession: AuthSession = {
          ...data.session,
          user: authUser,
        }

        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      }
    } catch (error: any) {
      dispatch({
        type: 'SIGN_IN_ERROR',
        payload: { error: error.message || 'Failed to sign in' },
      })
      throw error
    }
  }, [supabase, loadUserProfile])

  const signUp = useCallback(async (email: string, password: string, metadata?: UserSignUpData) => {
    try {
      dispatch({ type: 'SIGN_UP_START' })

      const signUpOptions = metadata ? { options: { data: metadata } } : {}
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        ...signUpOptions,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        let profile = null
        let authSession = null

        if (data.session) {
          profile = await loadUserProfile(data.user.id)
          authSession = {
            ...data.session,
            user: { ...data.user, profile },
          }
        }

        const authUser: AuthUser = {
          ...data.user,
          profile,
        }

        dispatch({
          type: 'SIGN_UP_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      }
    } catch (error: any) {
      dispatch({
        type: 'SIGN_UP_ERROR',
        payload: { error: error.message || 'Failed to sign up' },
      })
      throw error
    }
  }, [supabase, loadUserProfile])

  const signInWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'SIGN_IN_START' })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      dispatch({
        type: 'SIGN_IN_ERROR',
        payload: { error: error.message || 'Failed to sign in with Google' },
      })
      throw error
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      dispatch({ type: 'SIGN_OUT_START' })

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      dispatch({ type: 'SIGN_OUT_SUCCESS' })
      router.push('/')
    } catch (error: any) {
      dispatch({
        type: 'SIGN_OUT_ERROR',
        payload: { error: error.message || 'Failed to sign out' },
      })
      throw error
    }
  }, [supabase, router])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email')
    }
  }, [supabase])

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update password')
    }
  }, [supabase])

  const updateProfile = useCallback(async (updates: Partial<UserProfileUpdate>) => {
    try {
      if (!state.user?.id) {
        throw new Error('No authenticated user')
      }

      dispatch({ type: 'PROFILE_UPDATE_START' })

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      dispatch({
        type: 'PROFILE_UPDATE_SUCCESS',
        payload: { profile },
      })
    } catch (error: any) {
      dispatch({
        type: 'PROFILE_UPDATE_ERROR',
        payload: { error: error.message || 'Failed to update profile' },
      })
      throw error
    }
  }, [supabase, state.user?.id])

  const refreshSession = useCallback(async () => {
    try {
      dispatch({ type: 'SESSION_REFRESH_START' })

      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id)
        const authUser: AuthUser = {
          ...session.user,
          profile,
        }
        const authSession: AuthSession = {
          ...session,
          user: authUser,
        }

        dispatch({
          type: 'SESSION_REFRESH_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      }
    } catch (error: any) {
      dispatch({
        type: 'SESSION_REFRESH_ERROR',
        payload: { error: error.message || 'Failed to refresh session' },
      })
      throw error
    }
  }, [supabase, loadUserProfile])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}