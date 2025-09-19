import type { User, Session } from '@supabase/supabase-js'
import type { Database } from './supabase'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export interface AuthUser extends User {
  profile?: UserProfile | null
}

export interface AuthSession extends Session {
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: UserSignUpData) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfileUpdate>) => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

export interface UserSignUpData {
  firstName?: string
  lastName?: string
  role?: UserRole
  grade?: string | undefined
  school?: string | undefined
  preferences?: UserPreferences
}

export type UserRole = 'student' | 'educator' | 'admin'

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications?: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy?: {
    shareProgress: boolean
    showProfile: boolean
  }
}

export interface AuthError extends Error {
  code?: string
  status?: number
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData extends LoginCredentials {
  firstName: string
  lastName: string
  role: UserRole
  grade?: string
  school?: string
  acceptTerms: boolean
  acceptPrivacy: boolean
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
  confirmPassword: string
}

export interface AuthFormState {
  loading: boolean
  error: string | null
  success: string | null
}

export type AuthEvent =
  | { type: 'SIGN_IN_START' }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: AuthUser; session: AuthSession } }
  | { type: 'SIGN_IN_ERROR'; payload: { error: string } }
  | { type: 'SIGN_OUT_START' }
  | { type: 'SIGN_OUT_SUCCESS' }
  | { type: 'SIGN_OUT_ERROR'; payload: { error: string } }
  | { type: 'SIGN_UP_START' }
  | { type: 'SIGN_UP_SUCCESS'; payload: { user: AuthUser; session: AuthSession | null } }
  | { type: 'SIGN_UP_ERROR'; payload: { error: string } }
  | { type: 'SESSION_REFRESH_START' }
  | { type: 'SESSION_REFRESH_SUCCESS'; payload: { user: AuthUser; session: AuthSession } }
  | { type: 'SESSION_REFRESH_ERROR'; payload: { error: string } }
  | { type: 'PROFILE_UPDATE_START' }
  | { type: 'PROFILE_UPDATE_SUCCESS'; payload: { profile: UserProfile } }
  | { type: 'PROFILE_UPDATE_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }

export interface RouteProtectionProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireRoles?: UserRole[]
  requireAuth?: boolean
  inverse?: boolean
}