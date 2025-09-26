'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { createBrowserClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'

// Create a single global Supabase client to avoid recreation issues
let globalSupabaseClient: any = null

function getSupabaseClient() {
  if (!globalSupabaseClient) {
    console.log('Creating Supabase browser client with config:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    globalSupabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          debug: true, // Enable auth debugging
          persistSession: true, // Ensure session persistence
          detectSessionInUrl: true, // Auto detect session from URL
          flowType: 'pkce', // Use PKCE flow
          autoRefreshToken: true, // Auto refresh tokens
        },
        cookieOptions: {
          name: 'sb-kutpbtpdgptcmrlabekq-auth-token',
          domain: undefined, // auto-detect
          path: '/',
          sameSite: 'lax',
        }
      }
    )
  }
  return globalSupabaseClient
}
import type {
  AuthContextType,
  AuthState,
  AuthEvent,
  UserSignUpData,
  AuthUser,
  AuthSession,
  UserProfile,
  UserProfileUpdate
} from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true, // Start with loading true since we need to check for existing session
  error: null,
}

function authReducer(state: AuthState, action: AuthEvent): AuthState {
  console.log('AuthReducer received action:', action.type, 'Current loading state:', state.loading)

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
      console.log('AuthReducer: Setting loading to false, user:', action.payload.user?.id)
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
      console.log('AuthReducer: Setting loading to:', action.payload.loading)
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

  // Use the global supabase client
  const supabase = getSupabaseClient()

  console.log('AuthProvider render - current state:', {
    loading: state.loading,
    hasUser: !!state.user,
    userId: state.user?.id,
    renderTimestamp: Date.now()
  })

  // Helper function to clear old/conflicting auth cookies
  const clearOldAuthCookies = useCallback(() => {
    if (typeof window === 'undefined') {
return
}

    console.log('Checking for old/conflicting auth cookies...')
    const currentProjectId = 'kutpbtpdgptcmrlabekq'

    document.cookie.split(";").forEach(function(c) {
      const cookieName = c.split("=")[0].trim()
      if (cookieName.startsWith('sb-') && !cookieName.includes(currentProjectId)) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        console.log('Cleared old project cookie:', cookieName)
      }
    })
  }, [])

  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('loadUserProfile: Skipping client-side profile load due to RLS issues')
    console.log('loadUserProfile: Profile will be created server-side via /api/projects')

    // Skip client-side profile loading to avoid RLS timeout issues
    // The server-side API (/api/projects) will handle profile creation with service role
    return null
  }, [supabase])

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('handleAuthStateChange called with:', {
      event,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id
    })

    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
      console.log(`Processing ${event} event for user:`, session.user.id)

      try {
        console.log('About to load user profile for user:', session.user.id)
        const profile = await loadUserProfile(session.user.id)
        console.log('Profile loaded successfully:', { hasProfile: !!profile, profileId: profile?.id })

        // Note: Profile creation will be handled server-side by /api/projects
        // when user first accesses the dashboard

        const authUser: AuthUser = {
          ...session.user,
          profile,
        }
        const authSession: AuthSession = {
          ...session,
          user: authUser,
        }

        console.log('Dispatching SIGN_IN_SUCCESS from handleAuthStateChange with user:', {
          id: authUser.id,
          email: authUser.email,
          hasProfile: !!authUser.profile
        })
        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      } catch (profileError) {
        console.error('Error loading profile in handleAuthStateChange:', profileError)

        // Continue with auth even if profile loading fails
        const authUser: AuthUser = {
          ...session.user,
          profile: null,
        }
        const authSession: AuthSession = {
          ...session,
          user: authUser,
        }

        console.log('Dispatching SIGN_IN_SUCCESS (fallback) from handleAuthStateChange')
        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('Processing SIGNED_OUT event')
      dispatch({ type: 'SIGN_OUT_SUCCESS' })
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      try {
        const profile = await loadUserProfile(session.user.id)

        const authUser: AuthUser = {
          ...session.user,
          profile,
        }
        const authSession: AuthSession = {
          ...session,
          user: authUser,
        }

        console.log('Dispatching SESSION_REFRESH_SUCCESS from handleAuthStateChange')
        dispatch({
          type: 'SESSION_REFRESH_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      } catch (profileError) {
        console.error('Error loading profile during token refresh:', profileError)

        // Continue with auth even if profile loading fails
        const authUser: AuthUser = {
          ...session.user,
          profile: null,
        }
        const authSession: AuthSession = {
          ...session,
          user: authUser,
        }

        console.log('Dispatching SESSION_REFRESH_SUCCESS (fallback) from handleAuthStateChange')
        dispatch({
          type: 'SESSION_REFRESH_SUCCESS',
          payload: { user: authUser, session: authSession },
        })
      }
    } else {
      console.log('handleAuthStateChange: No action taken for event:', event, 'Session:', !!session)
    }
  }, [loadUserProfile])

  const initializeAuth = useCallback(async () => {
    try {
      console.log('=== AUTH PROVIDER INIT START ===')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      // Clear any old/conflicting auth cookies first
      clearOldAuthCookies()

      // Check what cookies are available
      if (typeof window !== 'undefined') {
        console.log('Available cookies:', document.cookie)
        const supabaseCookies = document.cookie.split(';').filter(cookie => cookie.includes('sb-'))
        console.log('Supabase cookies:', supabaseCookies)
      }

      console.log('Auth init: Trusting auth listener for session detection')
      console.log('Setting loading to false - auth state changes will be handled by listener')

      // Trust the auth listener to handle session detection
      // The auth listener is more reliable than manual session checks
      dispatch({ type: 'SET_LOADING', payload: { loading: false } })

      console.log('=== AUTH PROVIDER INIT END ===')
    } catch (error) {
      console.error('Error initializing auth:', error)
      dispatch({ type: 'SET_LOADING', payload: { loading: false } })
    }
  }, [clearOldAuthCookies])

  useEffect(() => {
    console.log('AuthProvider useEffect triggered - setting up auth listener and initialization')

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    // Initialize auth
    initializeAuth()

    return () => {
      console.log('AuthProvider cleanup triggered')
      subscription.unsubscribe()
    }
  }, []) // Empty dependencies since supabase is global and functions are stable

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
    console.log('=== AUTH PROVIDER SIGN IN WITH GOOGLE ===');
    console.log('signInWithGoogle called in AuthProvider');

    try {
      dispatch({ type: 'SIGN_IN_START' })

      // More robust redirect URL calculation
      const getRedirectUrl = () => {
        if (typeof window === 'undefined') {
return '';
}

        // In production, prefer explicit production URL
        if (window.location.hostname === 'stembotv1.vercel.app') {
          return 'https://stembotv1.vercel.app/auth/callback';
        }

        // For localhost or other development environments
        if (process.env.NEXT_PUBLIC_APP_URL) {
          return `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
        }

        // Fallback to current origin
        return `${window.location.origin}/auth/callback`;
      };

      const redirectTo = getRedirectUrl();

      console.log('=== OAUTH DEBUG START ===');
      console.log('window.location.hostname:', window.location.hostname);
      console.log('window.location.origin:', window.location.origin);
      console.log('process.env.NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
      console.log('Final redirectTo:', redirectTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      console.log('=== OAUTH DEBUG END ===');

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
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/reset-password`,
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
        .from('users')
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