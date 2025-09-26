'use client'

import { useCallback } from 'react'

import { useAuthContext } from '../providers/AuthProvider'
import type {
  AuthContextType,
  LoginCredentials,
  RegisterData,
  UserRole,
} from '../types/auth'

export interface UseAuthReturn extends AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  canAccess: (requiredRoles?: UserRole[]) => boolean
  isResearcher: boolean
  isAdmin: boolean
  displayName: string | null
  initials: string
}

export function useAuth(): UseAuthReturn {
  const context = useAuthContext()

  const isAuthenticated = !!context.user && !!context.session
  const isLoading = context.loading

  const hasRole = useCallback((role: UserRole): boolean => {
    return context.user?.profile?.role === role
  }, [context.user?.profile?.role])

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!context.user?.profile?.role) {
return false
}
    return roles.includes(context.user.profile.role)
  }, [context.user?.profile?.role])

  const canAccess = useCallback((requiredRoles?: UserRole[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return isAuthenticated
    }
    return hasAnyRole(requiredRoles)
  }, [isAuthenticated, hasAnyRole])

  const isResearcher = hasRole('researcher')
  const isAdmin = hasRole('admin')

  const displayName = context.user?.profile?.display_name ||
    (context.user?.profile?.first_name && context.user?.profile?.last_name
      ? `${context.user.profile.first_name} ${context.user.profile.last_name}`
      : context.user?.email?.split('@')[0]) ||
    null

  const initials = (() => {
    if (context.user?.profile?.first_name && context.user?.profile?.last_name) {
      return `${context.user.profile.first_name[0]}${context.user.profile.last_name[0]}`.toUpperCase()
    }
    if (context.user?.profile?.display_name) {
      const parts = context.user.profile.display_name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
      }
      return context.user.profile.display_name.slice(0, 2).toUpperCase()
    }
    if (context.user?.email) {
      return context.user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  })()

  return {
    ...context,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    canAccess,
    isResearcher,
    isAdmin,
    displayName,
    initials,
  }
}

export interface UseAuthFormOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
  const { signIn, signUp, signInWithGoogle, resetPassword, loading, error, clearError } = useAuth()

  const handleSignIn = useCallback(async (credentials: LoginCredentials) => {
    try {
      clearError()
      await signIn(credentials.email, credentials.password)
      options.onSuccess?.()
    } catch (error: any) {
      const message = error.message || 'Failed to sign in'
      options.onError?.(message)
      throw error
    }
  }, [signIn, clearError, options])

  const handleSignUp = useCallback(async (data: RegisterData) => {
    try {
      clearError()
      await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        institution: data.institution ?? undefined,
        fieldOfStudy: data.fieldOfStudy ?? undefined,
      })
      options.onSuccess?.()
    } catch (error: any) {
      const message = error.message || 'Failed to sign up'
      options.onError?.(message)
      throw error
    }
  }, [signUp, clearError, options])

  const handleGoogleSignIn = useCallback(async () => {
    console.log('=== USE AUTH FORM GOOGLE SIGNIN ===');
    console.log('handleGoogleSignIn called from useAuthForm');
    console.log('About to call signInWithGoogle from AuthProvider...');

    try {
      clearError()
      await signInWithGoogle()
      console.log('signInWithGoogle completed successfully');
      options.onSuccess?.()
    } catch (error: any) {
      console.error('handleGoogleSignIn error:', error);
      const message = error.message || 'Failed to sign in with Google'
      options.onError?.(message)
      throw error
    }
  }, [signInWithGoogle, clearError, options])

  const handlePasswordReset = useCallback(async (email: string) => {
    try {
      clearError()
      await resetPassword(email)
      options.onSuccess?.()
    } catch (error: any) {
      const message = error.message || 'Failed to send reset email'
      options.onError?.(message)
      throw error
    }
  }, [resetPassword, clearError, options])

  return {
    handleSignIn,
    handleSignUp,
    handleGoogleSignIn,
    handlePasswordReset,
    loading,
    error,
    clearError,
  }
}

export interface UseProfileOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useProfile(options: UseProfileOptions = {}) {
  const { user, updateProfile, loading, error, clearError } = useAuth()

  const handleUpdateProfile = useCallback(async (updates: Record<string, any>) => {
    try {
      clearError()
      await updateProfile(updates)
      options.onSuccess?.()
    } catch (error: any) {
      const message = error.message || 'Failed to update profile'
      options.onError?.(message)
      throw error
    }
  }, [updateProfile, clearError, options])

  return {
    user,
    profile: user?.profile,
    handleUpdateProfile,
    loading,
    error,
    clearError,
  }
}