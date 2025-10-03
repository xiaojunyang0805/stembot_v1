/**
 * WP4-1.3: Methodology Storage Functions
 * Handles persistence of methodology decisions to Supabase
 */

import { supabase, createClientComponentClient } from '@/lib/supabase'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MethodologyVariable {
  name: string;
  description: string;
  measurementMethod?: string;
}

export interface MethodologyData {
  id?: string;
  projectId: string;
  methodType: string;
  methodName: string;
  reasoning?: string;
  independentVariables?: MethodologyVariable[];
  dependentVariables?: MethodologyVariable[];
  controlVariables?: MethodologyVariable[];
  participantCriteria?: string;
  estimatedSampleSize?: number;
  recruitmentStrategy?: string;
  procedureDraft?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Database row type (snake_case)
interface MethodologyRow {
  id: string;
  project_id: string;
  method_type: string;
  method_name: string;
  reasoning: string | null;
  independent_variables: any;
  dependent_variables: any;
  control_variables: any;
  participant_criteria: string | null;
  estimated_sample_size: number | null;
  recruitment_strategy: string | null;
  procedure_draft: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts camelCase MethodologyData to snake_case database row
 */
function toDbRow(data: MethodologyData): Partial<MethodologyRow> {
  return {
    project_id: data.projectId,
    method_type: data.methodType,
    method_name: data.methodName,
    reasoning: data.reasoning || null,
    independent_variables: data.independentVariables || null,
    dependent_variables: data.dependentVariables || null,
    control_variables: data.controlVariables || null,
    participant_criteria: data.participantCriteria || null,
    estimated_sample_size: data.estimatedSampleSize || null,
    recruitment_strategy: data.recruitmentStrategy || null,
    procedure_draft: data.procedureDraft || null,
  }
}

/**
 * Converts snake_case database row to camelCase MethodologyData
 */
function fromDbRow(row: MethodologyRow): MethodologyData {
  return {
    id: row.id,
    projectId: row.project_id,
    methodType: row.method_type,
    methodName: row.method_name,
    reasoning: row.reasoning || undefined,
    independentVariables: row.independent_variables || undefined,
    dependentVariables: row.dependent_variables || undefined,
    controlVariables: row.control_variables || undefined,
    participantCriteria: row.participant_criteria || undefined,
    estimatedSampleSize: row.estimated_sample_size || undefined,
    recruitmentStrategy: row.recruitment_strategy || undefined,
    procedureDraft: row.procedure_draft || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Gets Supabase client (client-side or server-side)
 */
function getSupabaseClient() {
  return typeof window !== 'undefined' ? createClientComponentClient() : supabase
}

// ============================================================================
// CORE STORAGE FUNCTIONS
// ============================================================================

/**
 * Saves methodology decision to Supabase
 * Handles both insert (new methodology) and update (existing methodology)
 */
export async function saveMethodology(
  projectId: string,
  methodology: Omit<MethodologyData, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
): Promise<{ data: MethodologyData | null; error: any }> {
  try {
    console.log('💾 Saving methodology for project:', projectId)

    // Validate project exists
    const client = getSupabaseClient()
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle()

    if (projectError || !project) {
      console.error('❌ Project not found:', projectId, projectError)
      return { data: null, error: projectError || new Error('Project not found') }
    }

    // Check if methodology already exists for this project
    const { data: existing, error: checkError } = await client
      .from('project_methodology')
      .select('id')
      .eq('project_id', projectId)
      .maybeSingle()

    // Gracefully handle table not existing (404/PGRST116)
    if (checkError) {
      if (checkError.code === 'PGRST116' || checkError.code === '404' || checkError.message?.includes('404')) {
        console.warn('⚠️ project_methodology table does not exist - migration required')
        return {
          data: null,
          error: {
            message: 'Database migration required: project_methodology table does not exist. Please apply migration from supabase/migrations/20251003_create_project_methodology.sql',
            code: 'TABLE_NOT_EXISTS'
          }
        }
      }
      console.error('❌ Error checking existing methodology:', checkError)
      return { data: null, error: checkError }
    }

    const methodologyData: MethodologyData = {
      projectId,
      ...methodology
    }

    const dbRow = toDbRow(methodologyData)

    // Update if exists, insert if new
    if (existing) {
      console.log('📝 Updating existing methodology:', existing.id)
      const { data, error } = await client
        .from('project_methodology')
        .update(dbRow)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating methodology:', error)
        return { data: null, error }
      }

      const result = fromDbRow(data as MethodologyRow)
      console.log('✅ Methodology updated successfully')
      return { data: result, error: null }
    } else {
      console.log('📝 Inserting new methodology')
      const { data, error } = await client
        .from('project_methodology')
        .insert(dbRow)
        .select()
        .single()

      if (error) {
        console.error('❌ Error inserting methodology:', error)
        return { data: null, error }
      }

      const result = fromDbRow(data as MethodologyRow)
      console.log('✅ Methodology saved successfully')
      return { data: result, error: null }
    }
  } catch (error) {
    console.error('💥 Error in saveMethodology:', error)
    return { data: null, error }
  }
}

/**
 * Retrieves methodology for a specific project
 */
export async function getProjectMethodology(
  projectId: string
): Promise<{ data: MethodologyData | null; error: any }> {
  try {
    console.log('🔍 Fetching methodology for project:', projectId)

    const client = getSupabaseClient()
    const { data, error } = await client
      .from('project_methodology')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle()

    // Gracefully handle table not existing (404/PGRST116) or no data found
    if (error) {
      // PGRST116 = No rows found (expected when table is empty)
      // 404 = Table doesn't exist (migration not applied yet)
      if (error.code === 'PGRST116' || error.code === '404' || error.message?.includes('404')) {
        console.log('ℹ️ No methodology found (table may not exist yet or no data)')
        return { data: null, error: null }
      }
      // Only log/return actual errors (not table missing errors)
      console.warn('⚠️ Error fetching methodology (non-critical):', error)
      return { data: null, error: null } // Return null gracefully instead of breaking
    }

    if (!data) {
      console.log('ℹ️ No methodology found for project')
      return { data: null, error: null }
    }

    const result = fromDbRow(data as MethodologyRow)
    console.log('✅ Methodology retrieved successfully')
    return { data: result, error: null }
  } catch (error) {
    console.warn('⚠️ Error in getProjectMethodology (recovering gracefully):', error)
    // Return null gracefully - don't break the page
    return { data: null, error: null }
  }
}

/**
 * Updates an existing methodology by ID
 */
export async function updateMethodology(
  methodologyId: string,
  updates: Partial<Omit<MethodologyData, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
): Promise<{ data: MethodologyData | null; error: any }> {
  try {
    console.log('📝 Updating methodology:', methodologyId)

    const dbUpdates = toDbRow({ projectId: '', ...updates } as MethodologyData)
    // Remove project_id from updates (shouldn't be changed)
    delete dbUpdates.project_id

    const client = getSupabaseClient()
    const { data, error } = await client
      .from('project_methodology')
      .update(dbUpdates)
      .eq('id', methodologyId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating methodology:', error)
      return { data: null, error }
    }

    const result = fromDbRow(data as MethodologyRow)
    console.log('✅ Methodology updated successfully')
    return { data: result, error: null }
  } catch (error) {
    console.error('💥 Error in updateMethodology:', error)
    return { data: null, error }
  }
}

/**
 * Deletes methodology for a project
 */
export async function deleteMethodology(
  projectId: string
): Promise<{ error: any }> {
  try {
    console.log('🗑️ Deleting methodology for project:', projectId)

    const client = getSupabaseClient()
    const { error } = await client
      .from('project_methodology')
      .delete()
      .eq('project_id', projectId)

    if (error) {
      console.error('❌ Error deleting methodology:', error)
      return { error }
    }

    console.log('✅ Methodology deleted successfully')
    return { error: null }
  } catch (error) {
    console.error('💥 Error in deleteMethodology:', error)
    return { error }
  }
}

// ============================================================================
// PROJECT PROGRESS INTEGRATION
// ============================================================================

/**
 * Updates project progress when methodology is saved
 */
export async function updateProjectMethodologyProgress(
  projectId: string,
  progressPercentage: number
): Promise<{ error: any }> {
  try {
    console.log('📊 Updating methodology progress:', progressPercentage)

    const client = getSupabaseClient()

    // Get current project data
    const { data: project, error: fetchError } = await client
      .from('projects')
      .select('progress_data')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return { error: fetchError || new Error('Project not found') }
    }

    // Update methodology progress
    const progressData = project.progress_data as any || {}
    const updatedProgress = {
      ...progressData,
      methodology: {
        ...progressData.methodology,
        completed: progressPercentage >= 100,
        progress: progressPercentage
      }
    }

    // Save updated progress
    const { error: updateError } = await client
      .from('projects')
      .update({
        progress_data: updatedProgress,
        current_phase: 'methodology',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      console.error('❌ Error updating project progress:', updateError)
      return { error: updateError }
    }

    console.log('✅ Project progress updated')
    return { error: null }
  } catch (error) {
    console.error('💥 Error in updateProjectMethodologyProgress:', error)
    return { error }
  }
}

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Validates methodology data before saving
 */
export function validateMethodologyData(
  data: Partial<MethodologyData>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!data.methodType) {
    errors.push('Method type is required')
  }

  if (!data.methodName) {
    errors.push('Method name is required')
  }

  // Variable validation
  const validateVariables = (vars: any, type: string) => {
    if (vars && !Array.isArray(vars)) {
      errors.push(`${type} must be an array`)
    }
    if (vars && Array.isArray(vars)) {
      vars.forEach((v: any, i: number) => {
        if (!v.name) {
          errors.push(`${type}[${i}] missing name`)
        }
        if (!v.description) {
          errors.push(`${type}[${i}] missing description`)
        }
      })
    }
  }

  validateVariables(data.independentVariables, 'Independent variables')
  validateVariables(data.dependentVariables, 'Dependent variables')
  validateVariables(data.controlVariables, 'Control variables')

  // Sample size validation
  if (data.estimatedSampleSize && data.estimatedSampleSize < 1) {
    errors.push('Sample size must be positive')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
