import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { handleAuthMiddleware } from './src/lib/supabase/middleware'

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