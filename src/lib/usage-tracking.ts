import { supabase } from './supabase'
import { plans } from './stripe/config'

export interface UsageMetrics {
  projects: number
  aiInteractions: number
  memoryUsed: number
  exports: number
}

export interface UsageLimits {
  maxProjects: number
  monthlyAiInteractions: number
  maxFileSize: number
  memoryRetention: number
}

export class UsageTracker {
  private userId: string
  private planId: string

  constructor(userId: string, planId: string = 'free') {
    this.userId = userId
    this.planId = planId
  }

  /**
   * Get the current plan's limits
   */
  getPlanLimits(): UsageLimits {
    const plan = plans.find(p => p.id === this.planId) || plans[0] // Default to free
    return plan.limits
  }

  /**
   * Get current usage metrics for the user
   */
  async getCurrentUsage(): Promise<UsageMetrics> {
    try {
      // Get current month's start and end dates
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // For mock mode, return mock data
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                      process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

      if (useMocks) {
        return {
          projects: 1,
          aiInteractions: 15,
          memoryUsed: 2.5,
          exports: 3
        }
      }

      // Get projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', this.userId)

      if (projectsError) throw projectsError

      // Get AI interactions count for current month
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', this.userId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      if (conversationsError) throw conversationsError

      // Get memory usage (sum of all project memory)
      const { data: memoryData, error: memoryError } = await supabase
        .from('project_memory')
        .select('memory_size')
        .in('project_id', projects?.map(p => p.id) || [])

      if (memoryError) throw memoryError

      const memoryUsed = memoryData?.reduce((sum, m) => sum + (m.memory_size || 0), 0) || 0

      // Get exports count for current month (assuming we track this)
      // For now, we'll return a mock value since exports aren't implemented yet
      const exports = 0

      return {
        projects: projects?.length || 0,
        aiInteractions: conversations?.length || 0,
        memoryUsed: memoryUsed / (1024 * 1024), // Convert to MB
        exports
      }

    } catch (error) {
      console.error('Failed to get usage metrics:', error)
      // Return safe defaults on error
      return {
        projects: 0,
        aiInteractions: 0,
        memoryUsed: 0,
        exports: 0
      }
    }
  }

  /**
   * Check if user can perform a specific action
   */
  async canPerformAction(action: 'create_project' | 'ai_interaction' | 'export'): Promise<{
    allowed: boolean
    reason?: string
    limit?: number
    current?: number
  }> {
    const limits = this.getPlanLimits()
    const usage = await this.getCurrentUsage()

    switch (action) {
      case 'create_project':
        if (limits.maxProjects === -1) {
          return { allowed: true }
        }
        return {
          allowed: usage.projects < limits.maxProjects,
          reason: usage.projects >= limits.maxProjects ? 'Project limit reached' : undefined,
          limit: limits.maxProjects,
          current: usage.projects
        }

      case 'ai_interaction':
        if (limits.monthlyAiInteractions === -1) {
          return { allowed: true }
        }
        return {
          allowed: usage.aiInteractions < limits.monthlyAiInteractions,
          reason: usage.aiInteractions >= limits.monthlyAiInteractions ? 'Monthly AI interaction limit reached' : undefined,
          limit: limits.monthlyAiInteractions,
          current: usage.aiInteractions
        }

      case 'export':
        // For now, we'll allow exports (implement limits when export tracking is added)
        return { allowed: true }

      default:
        return { allowed: false, reason: 'Unknown action' }
    }
  }

  /**
   * Track a usage event
   */
  async trackUsage(eventType: 'ai_interaction' | 'project_created' | 'export', metadata?: any): Promise<boolean> {
    try {
      // For mock mode, just log and return success
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                      process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

      if (useMocks) {
        console.log('🎭 Mock usage tracking:', { eventType, metadata })
        return true
      }

      // Send tracking request to API
      const response = await fetch('/api/billing/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          metadata: {
            ...metadata,
            userId: this.userId,
            planId: this.planId,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to track usage')
      }

      return true

    } catch (error) {
      console.error('Failed to track usage:', error)
      return false
    }
  }

  /**
   * Get usage warnings and alerts
   */
  async getUsageWarnings(): Promise<Array<{
    type: string
    message: string
    severity: 'info' | 'warning' | 'error'
    action?: string
  }>> {
    const limits = this.getPlanLimits()
    const usage = await this.getCurrentUsage()
    const warnings = []

    // Check project limits
    if (limits.maxProjects > 0) {
      const projectPercentage = (usage.projects / limits.maxProjects) * 100

      if (projectPercentage >= 100) {
        warnings.push({
          type: 'projects',
          message: 'You\'ve reached your project limit. Upgrade to create more projects.',
          severity: 'error' as const,
          action: 'upgrade'
        })
      } else if (projectPercentage >= 80) {
        warnings.push({
          type: 'projects',
          message: `You're using ${usage.projects} of ${limits.maxProjects} projects.`,
          severity: 'warning' as const
        })
      }
    }

    // Check AI interaction limits
    if (limits.monthlyAiInteractions > 0) {
      const aiPercentage = (usage.aiInteractions / limits.monthlyAiInteractions) * 100

      if (aiPercentage >= 100) {
        warnings.push({
          type: 'ai_interactions',
          message: 'You\'ve reached your monthly AI interaction limit.',
          severity: 'error' as const,
          action: 'upgrade'
        })
      } else if (aiPercentage >= 80) {
        const remaining = limits.monthlyAiInteractions - usage.aiInteractions
        warnings.push({
          type: 'ai_interactions',
          message: `You have ${remaining} AI interactions remaining this month.`,
          severity: 'warning' as const
        })
      }
    }

    return warnings
  }
}

/**
 * Helper function to create a usage tracker for the current user
 */
export async function createUsageTracker(): Promise<UsageTracker | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user's subscription tier
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const planId = userProfile?.subscription_tier || 'free'

    return new UsageTracker(user.id, planId)

  } catch (error) {
    console.error('Failed to create usage tracker:', error)
    return null
  }
}