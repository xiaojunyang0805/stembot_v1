'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import type { RouteProtectionProps } from '@/types/auth'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  )
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}

function DefaultUnauthorizedFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo,
  fallback,
}: RouteProtectionProps) {
  const { isAuthenticated, canAccess, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !isAuthenticated) {
      const loginUrl = redirectTo || '/auth/login'
      const currentPath = window.location.pathname

      if (currentPath !== loginUrl) {
        const url = new URL(loginUrl, window.location.origin)
        url.searchParams.set('callbackUrl', currentPath)
        router.push(url.toString())
      }
      return
    }

    if (requireAuth && isAuthenticated && allowedRoles.length > 0 && !canAccess(allowedRoles)) {
      const dashboardUrl = redirectTo || '/dashboard'
      router.push(dashboardUrl)
      return
    }
  }, [isAuthenticated, canAccess, allowedRoles, requireAuth, redirectTo, router, isLoading])

  if (isLoading) {
    return fallback || <DefaultLoadingFallback />
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || <DefaultLoadingFallback />
  }

  if (requireAuth && isAuthenticated && allowedRoles.length > 0 && !canAccess(allowedRoles)) {
    return fallback || <DefaultUnauthorizedFallback />
  }

  return <>{children}</>
}

export function StudentRoute({ children, ...props }: Omit<RouteProtectionProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['student']}>
      {children}
    </ProtectedRoute>
  )
}

export function EducatorRoute({ children, ...props }: Omit<RouteProtectionProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['educator']}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children, ...props }: Omit<RouteProtectionProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  )
}

export function MultiRoleRoute({
  children,
  roles,
  ...props
}: Omit<RouteProtectionProps, 'allowedRoles'> & { roles: string[] }) {
  return (
    <ProtectedRoute {...props} allowedRoles={roles as any}>
      {children}
    </ProtectedRoute>
  )
}