import { supabase } from '../supabase'
import type { Project } from '../../types/database'

// Get the most recently active project based on actual user activity
export async function getMostRecentlyActiveProject(): Promise<{ data: Project | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    // Get the project with the most recent conversation activity
    const { data: recentConversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        project_id,
        timestamp,
        projects (
          id,
          title,
          research_question,
          subject,
          subject_emoji,
          status,
          current_phase,
          due_date,
          memory_context,
          progress_data,
          metadata,
          created_at,
          updated_at,
          user_id
        )
      `)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (conversationError || !recentConversation) {
      // If no conversations exist, fall back to most recently updated project
      console.log('No conversations found, falling back to most recently updated project')
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      return { data: projects, error: projectsError }
    }

    // Extract the project from the joined data
    const project = recentConversation.projects as unknown as Project

    return { data: project, error: null }

  } catch (error) {
    console.error('Error getting most recently active project:', error)
    return { data: null, error }
  }
}

// Update project activity timestamp when user visits or interacts with a project
export async function trackProjectActivity(projectId: string): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    // Update the project's updated_at timestamp to reflect recent activity
    const { error } = await supabase
      .from('projects')
      .update({
        updated_at: new Date().toISOString(),
        // Update memory_context to include last_visited timestamp
        memory_context: {
          last_visited: new Date().toISOString(),
          last_visit_type: 'project_view'
        }
      })
      .eq('id', projectId)
      .eq('user_id', user.id) // Ensure user can only update their own projects

    return { error }

  } catch (error) {
    console.error('Error tracking project activity:', error)
    return { error }
  }
}

// Get project activity summary for dashboard insights
export async function getProjectActivitySummary(userId?: string): Promise<{
  data: {
    totalProjects: number;
    activeProjects: number;
    totalConversations: number;
    mostActiveProject: Project | null;
    recentActivities: Array<{
      project_id: string;
      project_title: string;
      last_conversation: string;
      conversation_count: number;
    }>;
  } | null;
  error: any
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const targetUserId = userId || user.id

    // Get total projects count
    const { count: totalProjects, error: projectsCountError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    // Get active projects count
    const { count: activeProjects, error: activeProjectsCountError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('status', 'active')

    // Get total conversations count
    const { count: totalConversations, error: conversationsCountError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    // Get most active project (by conversation count)
    const { data: mostActiveProjectData, error: mostActiveError } = await supabase
      .rpc('get_most_active_project', { target_user_id: targetUserId })

    // Get recent project activities
    const { data: recentActivities, error: recentActivitiesError } = await supabase
      .from('conversations')
      .select(`
        project_id,
        timestamp,
        projects!inner (
          title
        )
      `)
      .eq('user_id', targetUserId)
      .order('timestamp', { ascending: false })
      .limit(5)

    // Group activities by project
    const activitySummary = recentActivities?.reduce((acc: any[], activity: any) => {
      const existing = acc.find(item => item.project_id === activity.project_id)
      if (existing) {
        existing.conversation_count += 1
        if (activity.timestamp > existing.last_conversation) {
          existing.last_conversation = activity.timestamp
        }
      } else {
        acc.push({
          project_id: activity.project_id,
          project_title: activity.projects.title,
          last_conversation: activity.timestamp,
          conversation_count: 1
        })
      }
      return acc
    }, []) || []

    return {
      data: {
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0,
        totalConversations: totalConversations || 0,
        mostActiveProject: mostActiveProjectData?.[0] || null,
        recentActivities: activitySummary.slice(0, 5)
      },
      error: null
    }

  } catch (error) {
    console.error('Error getting project activity summary:', error)
    return { data: null, error }
  }
}