import { supabase } from '../supabase'
import type { User, UserInsert, UserUpdate } from '../../types/database'

// Create or update user profile
export async function upsertUserProfile(userData: {
  email: string
  university?: string
  academic_level?: string
  research_interests?: string[]
}): Promise<{ data: User | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const userProfile: UserInsert = {
      id: user.id,
      email: userData.email,
      university: userData.university || null,
      academic_level: userData.academic_level as any || null,
      research_interests: userData.research_interests || null,
      subscription_tier: 'free',
      profile_data: {
        name: user.user_metadata?.name || userData.email.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      },
      settings: {
        notifications: true,
        email_updates: true,
        data_sharing: false,
        theme: 'light'
      }
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userProfile)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error upserting user profile:', error)
    return { data: null, error }
  }
}

// Get user profile
export async function getUserProfile(): Promise<{ data: User | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { data: null, error }
  }
}

// Update user profile
export async function updateUserProfile(updates: UserUpdate): Promise<{ data: User | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { data: null, error }
  }
}

// Get user dashboard statistics
export async function getUserDashboardStats() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    // Get user's projects with counts
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, status, current_phase, created_at')
      .eq('user_id', user.id)

    if (projectsError) {
      return { data: null, error: projectsError }
    }

    // Calculate statistics
    const stats = {
      total_projects: projects.length,
      active_projects: projects.filter((p: any) => p.status === 'active').length,
      completed_projects: projects.filter((p: any) => p.status === 'completed').length,
      projects_by_phase: {
        question: projects.filter((p: any) => p.current_phase === 'question').length,
        literature: projects.filter((p: any) => p.current_phase === 'literature').length,
        methodology: projects.filter((p: any) => p.current_phase === 'methodology').length,
        writing: projects.filter((p: any) => p.current_phase === 'writing').length
      },
      recent_activity: projects
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error)
    return { data: null, error }
  }
}

// Create user session tracking
export async function createUserSession(projectId?: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        session_start: new Date().toISOString(),
        activity_data: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error creating user session:', error)
    return { data: null, error }
  }
}

// End user session
export async function endUserSession(sessionId: string, activityData: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    const sessionEnd = new Date()
    const { data: session } = await supabase
      .from('user_sessions')
      .select('session_start')
      .eq('id', sessionId)
      .single()

    let totalDuration = 0
    if (session) {
      const sessionStart = new Date(session.session_start)
      totalDuration = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 1000) // in seconds
    }

    const { error } = await supabase
      .from('user_sessions')
      .update({
        session_end: sessionEnd.toISOString(),
        total_duration: totalDuration,
        activity_data: activityData
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    return { error }
  } catch (error) {
    console.error('Error ending user session:', error)
    return { error }
  }
}