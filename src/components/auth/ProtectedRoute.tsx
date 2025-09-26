'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '../../hooks/useAuth'
import type { RouteProtectionProps } from '../../types/auth'

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function DefaultUnauthorizedFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
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
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={() => window.history.back()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
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
    if (isLoading) {
return
}

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

export function ResearcherRoute({ children, ...props }: Omit<RouteProtectionProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['researcher']}>
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