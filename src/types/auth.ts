import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'researcher' | 'admin'

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications?: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy?: {
    shareProjects: boolean
    showProfile: boolean
  }
}

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  role: UserRole
  institution?: string
  field_of_study?: string
  avatar_url?: string
  preferences?: UserPreferences
  last_seen_at?: string
  is_active?: boolean
  email_verified?: boolean
  created_at: string
  updated_at: string
}

export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at'>
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>

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
  institution?: string | undefined
  fieldOfStudy?: string | undefined
  preferences?: UserPreferences
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
  institution?: string
  fieldOfStudy?: string
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