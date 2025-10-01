import { supabase, createClientComponentClient } from '../supabase'
import { UsageTracker } from '../usage-tracking'
import type { Database, ProjectInsert, ProjectUpdate, Project } from '../../types/database'

// Create a new project
export async function createProject(projectData: {
  title: string
  researchQuestion: string
  field: string
  timeline: string
}): Promise<{ data: Project | null; error: any }> {
  try {
    console.log('🚀 Starting project creation...', projectData)

    // Check if we're in mock mode
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                    process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

    let user: any = null
    let authError: any = null

    if (useMocks) {
      console.log('🎭 Using mock user for project creation')
      // Use mock user data that matches the AuthProvider
      user = {
        id: 'research-user-id',  // Same ID as in AuthProvider
        email: 'researcher@stembot.app'
      }
    } else {
      // Use client component client to access session properly in browser
      const clientSupabase = typeof window !== 'undefined' ? createClientComponentClient() : supabase

      // Try to get real user from Supabase
      const { data: { user: supabaseUser }, error } = await clientSupabase.auth.getUser()
      user = supabaseUser
      authError = error
      console.log('👤 Real auth check:', { user: user?.id, authError })
    }

    if (!useMocks && (authError || !user)) {
      console.error('❌ Authentication failed:', authError)
      return { data: null, error: authError || new Error('Auth session missing!') }
    }

    // Check usage limits before creating project
    if (!useMocks) {
      try {
        const usageTracker = new UsageTracker(user.id)
        const canCreate = await usageTracker.canPerformAction('create_project')

        if (!canCreate.allowed) {
          console.error('❌ Project creation blocked:', canCreate.reason)
          return {
            data: null,
            error: new Error(canCreate.reason || 'Project limit reached')
          }
        }
      } catch (usageError) {
        console.warn('⚠️ Usage tracking failed, allowing project creation:', usageError)
      }
    }

    // Prepare project data
    const newProject: ProjectInsert = {
      user_id: user.id,
      title: projectData.title,
      research_question: projectData.researchQuestion,
      subject: projectData.field,
      subject_emoji: getSubjectEmoji(projectData.field),
      status: 'active',
      current_phase: 'question',
      progress_data: {
        question: { completed: false, progress: 10 },
        literature: { completed: false, progress: 0, sources_count: 0 },
        methodology: { completed: false, progress: 0 },
        writing: { completed: false, progress: 0, word_count: 0 }
      },
      metadata: {
        field: projectData.field,
        timeline: projectData.timeline,
        created_from: 'web_app'
      }
    }

    console.log('📝 Project data prepared:', newProject)

    // Handle database insertion based on mode
    if (useMocks) {
      console.log('🎭 Mock database: Creating project with mock data')
      // Return mock project data
      const mockProject: Project = {
        id: `research-project-${Date.now()}`,
        user_id: user.id,
        title: projectData.title,
        research_question: projectData.researchQuestion,
        subject: projectData.field,
        subject_emoji: getSubjectEmoji(projectData.field),
        status: 'active' as any,
        current_phase: 'question' as any,
        due_date: null,
        memory_context: {},
        progress_data: {
          question: { completed: false, progress: 10 },
          literature: { completed: false, progress: 0, sources_count: 0 },
          methodology: { completed: false, progress: 0 },
          writing: { completed: false, progress: 0, word_count: 0 }
        },
        metadata: {
          field: projectData.field,
          timeline: projectData.timeline,
          created_from: 'web_app'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('✅ Mock project created:', mockProject)

      // Track usage for mock mode
      try {
        const usageTracker = new UsageTracker(user.id)
        await usageTracker.trackUsage('project_created', {
          projectId: mockProject.id,
          title: projectData.title,
          field: projectData.field
        })
      } catch (usageError) {
        console.warn('⚠️ Failed to track project creation usage:', usageError)
      }

      return { data: mockProject, error: null }
    }

    // Real database insertion
    console.log('💾 Real database: Inserting project')
    // Use client component client for database operations in browser
    const clientSupabase = typeof window !== 'undefined' ? createClientComponentClient() : supabase
    const { data, error } = await clientSupabase
      .from('projects')
      .insert(newProject)
      .select()
      .single()

    console.log('💾 Database insert result:', { data, error })

    // Track usage for successful real project creation
    if (data && !error) {
      try {
        const usageTracker = new UsageTracker(user.id)
        await usageTracker.trackUsage('project_created', {
          projectId: data.id,
          title: projectData.title,
          field: projectData.field
        })
      } catch (usageError) {
        console.warn('⚠️ Failed to track project creation usage:', usageError)
      }
    }

    return { data, error }
  } catch (error) {
    console.error('💥 Error creating project:', error)
    return { data: null, error }
  }
}

// Get all projects for a user
export async function getUserProjects(): Promise<{ data: Project[] | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    return { data, error }
  } catch (error) {
    console.error('Error fetching user projects:', error)
    return { data: null, error }
  }
}

// Get a specific project by ID
export async function getProject(projectId: string): Promise<{ data: Project | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id) // Ensure user can only access their own projects
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { data: null, error }
  }
}

// Update a project
export async function updateProject(
  projectId: string,
  updates: ProjectUpdate
): Promise<{ data: Project | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id) // Ensure user can only update their own projects
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error updating project:', error)
    return { data: null, error }
  }
}

// Delete a project
export async function deleteProject(projectId: string): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id) // Ensure user can only delete their own projects

    return { error }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { error }
  }
}

// Update project progress
export async function updateProjectProgress(
  projectId: string,
  phase: 'question' | 'literature' | 'methodology' | 'writing',
  progressData: any
): Promise<{ data: Project | null; error: any }> {
  try {
    // Get current project
    const { data: project, error: fetchError } = await getProject(projectId)

    if (fetchError || !project) {
      return { data: null, error: fetchError || new Error('Project not found') }
    }

    // Update progress data
    const currentProgress = project.progress_data as any || {}
    const updatedProgress = {
      ...currentProgress,
      [phase]: {
        ...currentProgress[phase],
        ...progressData
      }
    }

    // Update project
    return updateProject(projectId, {
      progress_data: updatedProgress,
      current_phase: phase
    })
  } catch (error) {
    console.error('Error updating project progress:', error)
    return { data: null, error }
  }
}

// Helper function to get emoji for research field
function getSubjectEmoji(field: string): string {
  const emojiMap: Record<string, string> = {
    'psychology': '🧠',
    'education': '🎓',
    'neuroscience': '🧬',
    'biology': '🔬',
    'medicine': '⚕️',
    'social': '👥',
    'other': '📊'
  }

  return emojiMap[field] || '📊'
}

// Get project statistics
export async function getProjectStats(projectId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    // Use the database function if available
    const { data, error } = await supabase
      .rpc('get_project_with_stats', { project_uuid: projectId })

    if (error) {
      // Fallback to manual aggregation
      const [projectResult, sourcesResult, conversationsResult, memoryResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single(),
        supabase.from('sources').select('id').eq('project_id', projectId),
        supabase.from('conversations').select('id').eq('project_id', projectId),
        supabase.from('project_memory').select('id').eq('project_id', projectId)
      ])

      if (projectResult.error) {
        return { data: null, error: projectResult.error }
      }

      return {
        data: {
          project: projectResult.data,
          source_count: sourcesResult.data?.length || 0,
          conversation_count: conversationsResult.data?.length || 0,
          memory_items_count: memoryResult.data?.length || 0,
          last_activity: projectResult.data.updated_at
        },
        error: null
      }
    }

    return { data, error }
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return { data: null, error }
  }
}