import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mock middleware for UI-only repository
// In a real implementation, this would use Supabase for authentication

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/reset-password',
    '/auth/verify-email',
    '/api/auth/callback',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/pricing',
    '/integration-test',
  ]

  if (publicRoutes.includes(pathname)) {
    return true
  }

  const publicPatterns = [
    /^\/api\/auth\//,
    /^\/auth\//,
    /^\/_next\//,
    /^\/favicon\.ico$/,
    /^\/robots\.txt$/,
    /^\/sitemap\.xml$/,
    /^\/static\//,
    /^\/images\//,
  ]

  return publicPatterns.some(pattern => pattern.test(pathname))
}

function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/auth/verify-email',
  ]

  return authRoutes.includes(pathname)
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/lessons',
    '/progress',
    '/educator',
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all routes in demo mode
  // In a real implementation, this would check authentication status
  if (isPublicRoute(pathname) || !isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // For demo purposes, allow access to all routes
  // In production, this would redirect to login for unauthenticated users
  console.log(`Mock middleware: Allowing access to protected route ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}