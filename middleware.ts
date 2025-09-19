import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'

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

  return authRoutes.includes(pathname) || pathname.startsWith('/auth/')
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

function getRedirectUrl(request: NextRequest, isAuthenticated: boolean): string | null {
  const { pathname, searchParams } = request.nextUrl

  if (isAuthenticated && isAuthRoute(pathname)) {
    const callbackUrl = searchParams.get('callbackUrl')
    return callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard'
  }

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return loginUrl.toString()
  }

  return null
}

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareSupabaseClient({
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

async function handleAuthMiddleware(request: NextRequest) {
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return response
  }

  const supabase = createMiddlewareSupabaseClient({
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

    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }
}

export async function middleware(request: NextRequest) {
  try {
    return await handleAuthMiddleware(request)
  } catch (error) {
    console.error('Middleware error:', error)

    // In case of middleware errors, allow the request to continue
    // but log the error for debugging
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     * - static folder
     * - images folder
     * - api/auth/callback (Supabase auth callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|static/|images/|api/auth/callback).*)',
  ],
}