import { NextRequest, NextResponse } from 'next/server'

import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  console.log('=== AUTH CALLBACK DEBUG ===');
  console.log('Request URL:', requestUrl.toString());
  console.log('Code received:', code ? 'YES' : 'NO');
  console.log('Next parameter:', next);
  console.log('Origin:', requestUrl.origin);

  if (code === null) {
    console.error('No code provided in auth callback')
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  // Create the redirect response first
  const redirectUrl = new URL(next.startsWith('/') ? next : '/dashboard', request.url)
  const response = NextResponse.redirect(redirectUrl)

  try {
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = {
                ...options,
                httpOnly: false,
                secure: requestUrl.protocol === 'https:',
                sameSite: 'lax' as const,
                path: '/'
              }
              response.cookies.set(name, value, cookieOptions)
              console.log(`Setting cookie: ${name} = ${value.substring(0, 20)}...`);
            })
          },
        },
      }
    )

    console.log('Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error !== null) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    if (data.session && data.user) {
      console.log('User signed in successfully:', data.user.id)
      console.log('Session expires at:', data.session.expires_at);
      console.log('Access token length:', data.session.access_token?.length);
      console.log('Refresh token length:', data.session.refresh_token?.length);

      // The exchangeCodeForSession should have already set the cookies via the setAll callback
      console.log('Session cookies should now be set on response');
      console.log('Redirecting to:', redirectUrl.toString());

      return response
    }

    // If we get here, something went wrong
    console.error('No session or user data received');
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