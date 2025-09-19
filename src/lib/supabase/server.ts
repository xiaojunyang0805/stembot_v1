import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
// import type { NextRequest } from 'next/server'

export function createServerClient() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export function createRouteHandlerSupabaseClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}

export async function getServerSession() {
  const supabase = createServerClient()

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting server session:', error.message)
      return null
    }

    return session
  } catch (error) {
    console.error('Error in getServerSession:', error)
    return null
  }
}

export async function getServerUser() {
  const supabase = createServerClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting server user:', error.message)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getServerUser:', error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  // Simplified version - to be implemented when database is properly configured
  console.log('Getting user profile for:', userId)
  return null
}

export async function updateUserProfile(userId: string, updates: Record<string, any>) {
  // Simplified version - to be implemented when database is properly configured
  console.log('Updating user profile for:', userId, updates)
  return null
}

export async function createUserProfile(userId: string, profileData: Record<string, any>) {
  // Simplified version - to be implemented when database is properly configured
  console.log('Creating user profile for:', userId, profileData)
  return null
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session?.user) {
    throw new Error('Unauthorized: No valid session found')
  }

  return { session, user: session.user }
}

export async function requireAuthWithProfile() {
  const { session, user } = await requireAuth()
  const profile = await getUserProfile(user.id)

  if (!profile) {
    throw new Error('User profile not found')
  }

  return { session, user, profile }
}