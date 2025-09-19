import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

let supabaseClient: ReturnType<typeof createBrowserSupabaseClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserSupabaseClient()
  }
  return supabaseClient
}

export const supabase = createClient()

export type SupabaseClient = typeof supabase

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
  const signUpOptions = metadata ? { options: { data: metadata } } : {}
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    ...signUpOptions,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return user
}