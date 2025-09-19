import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareSupabaseClient<Database>({
    req: request,
    res: response,
  })

  try {
    const { error } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware auth error:', error.message)
      return response
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export function isPublicRoute(pathname: string): boolean {
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
  ]

  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true
  }

  // Check patterns
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

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/auth/verify-email',
  ]

  return authRoutes.includes(pathname) || pathname.startsWith('/auth/')
}

export function isProtectedRoute(pathname: string): boolean {
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

export function getRedirectUrl(request: NextRequest, isAuthenticated: boolean): string | null {
  const { pathname, searchParams } = request.nextUrl

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthRoute(pathname)) {
    const callbackUrl = searchParams.get('callbackUrl')
    return callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard'
  }

  // If user is not authenticated and trying to access protected pages, redirect to login
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return loginUrl.toString()
  }

  return null
}

export async function handleAuthMiddleware(request: NextRequest) {
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return response
  }

  const supabase = createMiddlewareSupabaseClient<Database>({
    req: request,
    res: response,
  })

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session?.user

    const redirectUrl = getRedirectUrl(request, isAuthenticated)

    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return response
  } catch (error) {
    console.error('Auth middleware error:', error)

    // On error, redirect to login for protected routes
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }
}