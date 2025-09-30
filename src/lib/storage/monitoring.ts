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
 * TEMPORARILY DISABLED: Returns safe defaults to prevent database errors
 */
export async function calculateUserStorageUsage(userId?: string): Promise<{ data: StorageUsage | null; error: any }> {
  try {
    // Return safe default values without making any database calls
    // This prevents 404 errors from missing RPC functions and tables
    console.log('📊 Storage monitoring temporarily disabled - returning safe defaults')

    const usage: StorageUsage = {
      totalUsedMB: 5.0,  // Safe default - 5MB used
      limitMB: STORAGE_LIMITS.free, // Default to free tier limit
      percentageUsed: 10.0, // 10% usage - safe level
      warningLevel: 'safe',
      breakdown: {
        conversations: 1.0,
        projects: 2.0,
        sources: 1.0,
        projectMemory: 0.5,
        userProfile: 0.01,
        attachments: 0.5
      }
    }

    return { data: usage, error: null }

  } catch (error) {
    console.error('Error in storage monitoring (disabled):', error)
    return { data: null, error }
  }
}

/**
 * Estimate conversations storage size (fallback method)
 * TEMPORARILY DISABLED: Returns safe default
 */
async function estimateConversationsSize(userId: string): Promise<number> {
  // Return safe default without database call
  return 1.0 // 1MB default
}

/**
 * Estimate projects storage size (fallback method)
 * TEMPORARILY DISABLED: Returns safe default
 */
async function estimateProjectsSize(userId: string): Promise<number> {
  // Return safe default without database call
  return 2.0 // 2MB default
}

/**
 * Estimate sources storage size (fallback method)
 * TEMPORARILY DISABLED: Returns safe default
 */
async function estimateSourcesSize(userId: string): Promise<number> {
  // Return safe default without database call
  return 1.0 // 1MB default
}

/**
 * Estimate project memory storage size (fallback method)
 * TEMPORARILY DISABLED: Returns safe default
 */
async function estimateMemorySize(userId: string): Promise<number> {
  // Return safe default without database call
  return 0.5 // 0.5MB default
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