import type { User, Session } from '@supabase/supabase-js'
import type { AuthUser, UserRole, UserProfile, AuthError } from '@/types/auth'

export function createAuthError(message: string, code?: string, status?: number): AuthError {
  const error = new Error(message) as AuthError
  if (code !== undefined) error.code = code
  if (status !== undefined) error.status = status
  return error
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
  isValid: boolean
} {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  return {
    score,
    feedback,
    isValid: score >= 4,
  }
}

export function sanitizeUserData(user: User): Partial<User> {
  const {
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    user_metadata,
  } = user

  return {
    id,
    email: email ?? undefined,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    user_metadata,
  } as Partial<User>
}

export function sanitizeUserProfile(profile: UserProfile): Partial<UserProfile> {
  const {
    id,
    email,
    first_name,
    last_name,
    display_name,
    avatar_url,
    role,
    grade,
    school,
    created_at,
    updated_at,
    last_seen_at,
    is_active,
    email_verified,
  } = profile

  return {
    id,
    email,
    first_name,
    last_name,
    display_name,
    avatar_url,
    role,
    grade,
    school,
    created_at,
    updated_at,
    last_seen_at,
    is_active,
    email_verified,
  }
}

export function extractUserDisplayName(user: AuthUser): string {
  if (user.profile?.display_name) {
    return user.profile.display_name
  }

  if (user.profile?.first_name && user.profile?.last_name) {
    return `${user.profile.first_name} ${user.profile.last_name}`
  }

  if (user.profile?.first_name) {
    return user.profile.first_name
  }

  if (user.email) {
    return user.email.split('@')[0] ?? 'User'
  }

  return 'User'
}

export function extractUserInitials(user: AuthUser): string {
  if (user.profile?.first_name && user.profile?.last_name) {
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
  }

  if (user.profile?.display_name) {
    const parts = user.profile.display_name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
    }
    return user.profile.display_name.slice(0, 2).toUpperCase()
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase()
  }

  return 'U'
}

export function hasRole(user: AuthUser, role: UserRole): boolean {
  return user.profile?.role === role
}

export function hasAnyRole(user: AuthUser, roles: UserRole[]): boolean {
  if (!user.profile?.role) return false
  return roles.includes(user.profile.role)
}

export function canAccessResource(
  user: AuthUser,
  requiredRoles?: UserRole[],
  ownerId?: string
): boolean {
  if (!user || !user.id) return false

  if (ownerId && user.id === ownerId) {
    return true
  }

  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }

  return hasAnyRole(user, requiredRoles)
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false

  const now = new Date()
  const expiresAt = new Date((session.expires_at || 0) * 1000)

  return expiresAt > now
}

export function isSessionExpiringSoon(session: Session | null, thresholdMinutes = 5): boolean {
  if (!session || !isSessionValid(session)) return false

  const now = new Date()
  const expiresAt = new Date((session.expires_at || 0) * 1000)
  const thresholdMs = thresholdMinutes * 60 * 1000
  const timeDiff = expiresAt.getTime() - now.getTime()

  return timeDiff <= thresholdMs
}

export function formatAuthError(error: any): string {
  if (typeof error === 'string') return error

  if (error?.message) {
    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.'
    }

    if (message.includes('email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.'
    }

    if (message.includes('signup is disabled')) {
      return 'New account registration is currently disabled. Please contact support.'
    }

    if (message.includes('email already registered')) {
      return 'An account with this email already exists. Please sign in instead.'
    }

    if (message.includes('password should be at least')) {
      return 'Password must be at least 6 characters long.'
    }

    if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.'
    }

    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

export function getAuthRedirectUrl(
  currentPath: string,
  isAuthenticated: boolean,
  userRole?: UserRole
): string | null {
  const authPaths = ['/auth/login', '/auth/register', '/auth/reset-password']
  const protectedPaths = ['/dashboard', '/profile', '/settings', '/lessons', '/progress']

  if (isAuthenticated && authPaths.includes(currentPath)) {
    if (userRole === 'educator') return '/educator'
    if (userRole === 'admin') return '/admin'
    return '/dashboard'
  }

  if (!isAuthenticated && protectedPaths.some(path => currentPath.startsWith(path))) {
    return '/auth/login'
  }

  return null
}

export function createProfileFromUser(user: User, additionalData?: Record<string, any>): Partial<UserProfile> {
  return {
    id: user.id,
    email: user.email ?? '',
    first_name: user.user_metadata?.first_name || additionalData?.firstName || null,
    last_name: user.user_metadata?.last_name || additionalData?.lastName || null,
    display_name: user.user_metadata?.display_name || additionalData?.displayName || null,
    avatar_url: user.user_metadata?.avatar_url || additionalData?.avatarUrl || null,
    role: (additionalData?.role as UserRole) || 'student',
    grade: additionalData?.grade || null,
    school: additionalData?.school || null,
    is_active: true,
    email_verified: !!user.email_confirmed_at,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Partial<UserProfile>
}

export function mergeUserWithProfile(user: User, profile: UserProfile | null): AuthUser {
  return {
    ...user,
    profile,
  }
}

export const AUTH_STORAGE_KEYS = {
  SESSION: 'sb-session',
  USER: 'sb-user',
  REMEMBER_ME: 'sb-remember-me',
} as const

export function clearAuthStorage(): void {
  if (typeof window !== 'undefined') {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  }
}