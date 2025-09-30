/**
 * Storage Monitoring and Management
 * Tracks user storage usage and provides warnings/limits
 */

import { supabase } from '../supabase'
import type { SubscriptionTier } from '../../types/database'

// Storage limits per subscription tier (in MB)
export const STORAGE_LIMITS = {
  free: 50,      // 50 MB per user on free plan
  pro: 1000,     // 1 GB per user on pro plan
  enterprise: 5000 // 5 GB per user on enterprise plan
} as const

// Warning thresholds (percentages)
export const STORAGE_WARNINGS = {
  yellow: 70,    // Show warning at 70%
  orange: 85,    // Show urgent warning at 85%
  red: 95        // Show critical warning at 95%
} as const

export interface StorageUsage {
  totalUsedMB: number
  limitMB: number
  percentageUsed: number
  warningLevel: 'safe' | 'yellow' | 'orange' | 'red'
  breakdown: {
    conversations: number
    projects: number
    sources: number
    projectMemory: number
    userProfile: number
    attachments: number
  }
}

/**
 * Calculate approximate storage usage for a user
 */
export async function calculateUserStorageUsage(userId?: string): Promise<{ data: StorageUsage | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const targetUserId = userId || user.id

    // Get user's subscription tier
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', targetUserId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return { data: null, error: profileError }
    }

    // Calculate storage for each data type with error handling
    const [conversationsResult, projectsResult, sourcesResult, memoryResult] = await Promise.allSettled([
      // Conversations storage
      supabase.rpc('calculate_conversations_size', { target_user_id: targetUserId }),

      // Projects storage
      supabase.rpc('calculate_projects_size', { target_user_id: targetUserId }),

      // Sources storage
      supabase.rpc('calculate_sources_size', { target_user_id: targetUserId }),

      // Project memory storage
      supabase.rpc('calculate_memory_size', { target_user_id: targetUserId })
    ])

    // Fallback calculations if RPC functions don't exist
    const conversationsMB = (conversationsResult.status === 'fulfilled' && conversationsResult.value?.data) || await estimateConversationsSize(targetUserId)
    const projectsMB = (projectsResult.status === 'fulfilled' && projectsResult.value?.data) || await estimateProjectsSize(targetUserId)
    const sourcesMB = (sourcesResult.status === 'fulfilled' && sourcesResult.value?.data) || await estimateSourcesSize(targetUserId)
    const memoryMB = (memoryResult.status === 'fulfilled' && memoryResult.value?.data) || await estimateMemorySize(targetUserId)
    const profileMB = 0.01 // User profile is typically very small
    const attachmentsMB = 0 // TODO: Implement when file uploads are added

    const totalUsedMB = conversationsMB + projectsMB + sourcesMB + memoryMB + profileMB + attachmentsMB
    const tier = (userProfile?.subscription_tier || 'free') as SubscriptionTier
    const limitMB = STORAGE_LIMITS[tier]
    const percentageUsed = (totalUsedMB / limitMB) * 100

    // Determine warning level
    let warningLevel: 'safe' | 'yellow' | 'orange' | 'red' = 'safe'
    if (percentageUsed >= STORAGE_WARNINGS.red) {
      warningLevel = 'red'
    } else if (percentageUsed >= STORAGE_WARNINGS.orange) {
      warningLevel = 'orange'
    } else if (percentageUsed >= STORAGE_WARNINGS.yellow) {
      warningLevel = 'yellow'
    }

    const usage: StorageUsage = {
      totalUsedMB: parseFloat(totalUsedMB.toFixed(2)),
      limitMB,
      percentageUsed: parseFloat(percentageUsed.toFixed(1)),
      warningLevel,
      breakdown: {
        conversations: parseFloat(conversationsMB.toFixed(2)),
        projects: parseFloat(projectsMB.toFixed(2)),
        sources: parseFloat(sourcesMB.toFixed(2)),
        projectMemory: parseFloat(memoryMB.toFixed(2)),
        userProfile: parseFloat(profileMB.toFixed(2)),
        attachments: parseFloat(attachmentsMB.toFixed(2))
      }
    }

    return { data: usage, error: null }

  } catch (error) {
    console.error('Error calculating storage usage:', error)
    return { data: null, error }
  }
}

/**
 * Estimate conversations storage size (fallback method)
 */
async function estimateConversationsSize(userId: string): Promise<number> {
  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Estimate: Average conversation = 5 KB (message + AI response + metadata)
  return ((count || 0) * 5) / 1024 // Convert KB to MB
}

/**
 * Estimate projects storage size (fallback method)
 */
async function estimateProjectsSize(userId: string): Promise<number> {
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Estimate: Average project = 20 KB (metadata, progress, memory context)
  return ((count || 0) * 20) / 1024 // Convert KB to MB
}

/**
 * Estimate sources storage size (fallback method)
 */
async function estimateSourcesSize(userId: string): Promise<number> {
  try {
    // Get user's projects first
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)

    if (!projects || projects.length === 0) return 0

    const projectIds = projects.map(p => p.id)

    const { count } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)

    // Estimate: Average source = 8 KB (title, authors, summary, notes)
    return ((count || 0) * 8) / 1024 // Convert KB to MB
  } catch (error) {
    console.warn('Sources table not found, using default estimate:', error)
    return 0 // Default to 0 if sources table doesn't exist
  }
}

/**
 * Estimate project memory storage size (fallback method)
 */
async function estimateMemorySize(userId: string): Promise<number> {
  try {
    // Get user's projects first
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)

    if (!projects || projects.length === 0) return 0

    const projectIds = projects.map(p => p.id)

    const { count } = await supabase
      .from('project_memory')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)

    // Estimate: Average memory entry = 10 KB (content + embeddings)
    return ((count || 0) * 10) / 1024 // Convert KB to MB
  } catch (error) {
    console.warn('Project memory table not found, using default estimate:', error)
    return 0 // Default to 0 if project_memory table doesn't exist
  }
}

/**
 * Check if user can perform an action based on storage limits
 */
export async function checkStorageLimit(
  userId?: string,
  additionalSizeMB: number = 0
): Promise<{ allowed: boolean; reason?: string; currentUsage?: StorageUsage }> {
  const { data: usage, error } = await calculateUserStorageUsage(userId)

  if (error || !usage) {
    // If we can't calculate usage, allow the action but warn
    console.warn('Could not calculate storage usage, allowing action')
    return { allowed: true, reason: 'Storage calculation unavailable' }
  }

  const projectedUsageMB = usage.totalUsedMB + additionalSizeMB
  const projectedPercentage = (projectedUsageMB / usage.limitMB) * 100

  if (projectedPercentage >= 100) {
    return {
      allowed: false,
      reason: `Storage limit exceeded. This would use ${projectedUsageMB.toFixed(1)} MB of your ${usage.limitMB} MB limit.`,
      currentUsage: usage
    }
  }

  if (projectedPercentage >= STORAGE_WARNINGS.red) {
    return {
      allowed: false,
      reason: `This action would exceed 95% of your storage limit (${projectedPercentage.toFixed(1)}%). Please free up space first.`,
      currentUsage: usage
    }
  }

  return { allowed: true, currentUsage: usage }
}

/**
 * Get storage cleanup suggestions for a user
 */
export async function getStorageCleanupSuggestions(userId?: string): Promise<{
  suggestions: Array<{
    type: string
    description: string
    potentialSavingMB: number
    action: string
  }>
  error?: any
}> {
  try {
    const { data: usage, error } = await calculateUserStorageUsage(userId)

    if (error || !usage) {
      return { suggestions: [], error }
    }

    const suggestions = []

    // Old conversations cleanup
    if (usage.breakdown.conversations > 10) {
      suggestions.push({
        type: 'conversations',
        description: 'Delete conversations older than 6 months',
        potentialSavingMB: usage.breakdown.conversations * 0.3, // Estimate 30% savings
        action: 'archive_old_conversations'
      })
    }

    // Unused projects cleanup
    if (usage.breakdown.projects > 5) {
      suggestions.push({
        type: 'projects',
        description: 'Archive completed or inactive projects',
        potentialSavingMB: usage.breakdown.projects * 0.2, // Estimate 20% savings
        action: 'archive_projects'
      })
    }

    // Memory optimization
    if (usage.breakdown.projectMemory > 20) {
      suggestions.push({
        type: 'memory',
        description: 'Clean up old project memory entries',
        potentialSavingMB: usage.breakdown.projectMemory * 0.25, // Estimate 25% savings
        action: 'optimize_memory'
      })
    }

    // Sources cleanup
    if (usage.breakdown.sources > 10) {
      suggestions.push({
        type: 'sources',
        description: 'Remove unused or duplicate sources',
        potentialSavingMB: usage.breakdown.sources * 0.15, // Estimate 15% savings
        action: 'clean_sources'
      })
    }

    return { suggestions }

  } catch (error) {
    return { suggestions: [], error }
  }
}

/**
 * Format storage size for display
 */
export function formatStorageSize(sizeInMB: number): string {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(1)} GB`
  }
  if (sizeInMB >= 1) {
    return `${sizeInMB.toFixed(1)} MB`
  }
  return `${(sizeInMB * 1024).toFixed(0)} KB`
}

/**
 * Get storage warning message based on usage
 */
export function getStorageWarningMessage(usage: StorageUsage): string | null {
  switch (usage.warningLevel) {
    case 'red':
      return `⚠️ Critical: You're using ${usage.percentageUsed}% of your storage limit (${formatStorageSize(usage.totalUsedMB)} / ${formatStorageSize(usage.limitMB)}). Please free up space to continue.`
    case 'orange':
      return `⚠️ Warning: You're using ${usage.percentageUsed}% of your storage limit (${formatStorageSize(usage.totalUsedMB)} / ${formatStorageSize(usage.limitMB)}). Consider cleaning up old data.`
    case 'yellow':
      return `💡 Notice: You're using ${usage.percentageUsed}% of your storage limit (${formatStorageSize(usage.totalUsedMB)} / ${formatStorageSize(usage.limitMB)}).`
    default:
      return null
  }
}