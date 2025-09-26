'use client'

import { useAuth } from '../../hooks/useAuth'
import type { AuthGuardProps } from '../../types/auth'

export default function AuthGuard({
  children,
  fallback = null,
  requireRoles = [],
  requireAuth = true,
  inverse = false,
}: AuthGuardProps) {
  const { isAuthenticated, canAccess, isLoading } = useAuth()

  if (isLoading) {
    return fallback
  }

  let shouldRender = true

  if (requireAuth) {
    shouldRender = isAuthenticated && (requireRoles.length === 0 || canAccess(requireRoles))
  } else {
    shouldRender = !requireAuth || isAuthenticated
  }

  if (inverse) {
    shouldRender = !shouldRender
  }

  return shouldRender ? <>{children}</> : fallback
}

export function AuthenticatedOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function UnauthenticatedOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} inverse={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function ResearcherOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} requireRoles={['researcher']} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function AdminOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} requireRoles={['admin']} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function MultiRoleOnly({
  children,
  roles,
  fallback = null,
}: {
  children: React.ReactNode
  roles: string[]
  fallback?: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} requireRoles={roles as any} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function RoleBasedRender({
  student,
  educator,
  admin,
  unauthenticated,
  loading,
}: {
  student?: React.ReactNode
  educator?: React.ReactNode
  admin?: React.ReactNode
  unauthenticated?: React.ReactNode
  loading?: React.ReactNode
}) {
  const { isAuthenticated, isResearcher, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <>{loading}</> || null
  }

  if (!isAuthenticated) {
    return <>{unauthenticated}</> || null
  }

  if (isAdmin && admin) {
    return <>{admin}</>
  }

  if (isResearcher && (student || educator)) {
    return <>{student || educator}</>
  }

  return null
}