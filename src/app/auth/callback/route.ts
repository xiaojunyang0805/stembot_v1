import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    console.error('No code provided in auth callback')
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    })

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    if (data.session && data.user) {
      // User profile creation is handled by database trigger
      console.log('User signed in successfully:', data.user.id)

      // Redirect to the next URL or dashboard
      const redirectUrl = next.startsWith('/') ? next : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // If we get here, something went wrong
    return NextResponse.redirect(
      new URL('/auth/login?error=authentication_failed', request.url)
    )
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_error', request.url)
    )
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests (for some OAuth providers that use POST)
  return GET(request)
}