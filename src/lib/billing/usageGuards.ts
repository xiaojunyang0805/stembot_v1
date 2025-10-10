/**
 * Usage Limit Guards
 * WP6.5: Usage Enforcement Middleware
 *
 * Functions to check and enforce tier-based usage limits
 * for AI interactions and project creation
 */

import {
  getUserSubscriptionWithStatus,
  getCurrentUsageWithLimits,
} from '@/lib/stripe/subscriptionHelpers';
import { TIER_LIMITS } from '@/lib/stripe/server';
import type { Subscription } from '@/types/billing';

/**
 * Result of usage limit check
 */
export interface UsageLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number | null; // null = unlimited
  current: number;
  shouldUpgrade: boolean;
  tier: Subscription['tier'];
  message?: string;
  upgradeMessage?: string;
}

/**
 * Result of project limit check
 */
export interface ProjectLimitResult {
  allowed: boolean;
  current: number;
  limit: number | null; // null = unlimited
  shouldUpgrade: boolean;
  tier: Subscription['tier'];
  message?: string;
  upgradeMessage?: string;
}

/**
 * Check if user can make AI interactions
 *
 * @param userId - User ID to check
 * @returns Usage limit check result
 */
export async function checkAIUsageLimit(
  userId: string
): Promise<UsageLimitResult> {
  try {
    // Get subscription and usage data
    const subscription = await getUserSubscriptionWithStatus(userId);
    const usageData = await getCurrentUsageWithLimits(userId);

    const tier = subscription.tier;
    const tierLimit = TIER_LIMITS[tier];
    const aiLimit = tierLimit.aiInteractions; // null = unlimited
    const currentUsage = usageData.ai_interactions_count || 0;

    // Check if tier allows unlimited AI interactions
    if (aiLimit === null) {
      return {
        allowed: true,
        remaining: Infinity,
        limit: null,
        current: currentUsage,
        shouldUpgrade: false,
        tier,
        message: 'Unlimited AI interactions',
      };
    }

    // Check if limit is reached
    const remaining = Math.max(0, aiLimit - currentUsage);
    const allowed = currentUsage < aiLimit;

    // Determine if user should upgrade
    const shouldUpgrade = !allowed && tier === 'free';

    // Build message
    let message = '';
    let upgradeMessage = '';

    if (!allowed) {
      message = `AI interaction limit reached (${currentUsage}/${aiLimit} this month)`;
      if (shouldUpgrade) {
        upgradeMessage =
          'Upgrade to Student Pro for unlimited AI interactions at €10/month';
      }
    } else if (remaining <= 5) {
      message = `Only ${remaining} AI interactions remaining this month`;
      if (tier === 'free') {
        upgradeMessage =
          'Upgrade to Student Pro for unlimited AI interactions';
      }
    }

    return {
      allowed,
      remaining,
      limit: aiLimit,
      current: currentUsage,
      shouldUpgrade,
      tier,
      message,
      upgradeMessage,
    };
  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: 0,
      limit: null,
      current: 0,
      shouldUpgrade: false,
      tier: 'free',
      message: 'Unable to verify usage limit',
    };
  }
}

/**
 * Check if user can create new projects
 *
 * @param userId - User ID to check
 * @returns Project limit check result
 */
export async function checkProjectLimit(
  userId: string
): Promise<ProjectLimitResult> {
  try {
    // Get subscription and usage data
    const subscription = await getUserSubscriptionWithStatus(userId);
    const usageData = await getCurrentUsageWithLimits(userId);

    const tier = subscription.tier;
    const tierLimit = TIER_LIMITS[tier];
    const projectLimit = tierLimit.projects; // null = unlimited
    const currentProjects = usageData.active_projects_count || 0;

    // Check if tier allows unlimited projects
    if (projectLimit === null) {
      return {
        allowed: true,
        current: currentProjects,
        limit: null,
        shouldUpgrade: false,
        tier,
        message: 'Unlimited active projects',
      };
    }

    // Check if limit is reached
    const allowed = currentProjects < projectLimit;

    // Determine if user should upgrade
    const shouldUpgrade = !allowed && (tier === 'free' || tier === 'student_pro');

    // Build message
    let message = '';
    let upgradeMessage = '';

    if (!allowed) {
      message = `Project limit reached (${currentProjects}/${projectLimit} active projects)`;
      if (tier === 'free') {
        upgradeMessage =
          'Upgrade to Student Pro for up to 10 active projects at €10/month';
      } else if (tier === 'student_pro') {
        upgradeMessage =
          'Upgrade to Researcher for unlimited projects at €25/month';
      }
    } else if (currentProjects === projectLimit - 1) {
      message = `Last project slot available (${currentProjects}/${projectLimit})`;
      if (tier === 'free') {
        upgradeMessage = 'Upgrade to Student Pro for up to 10 active projects';
      } else if (tier === 'student_pro') {
        upgradeMessage = 'Upgrade to Researcher for unlimited projects';
      }
    }

    return {
      allowed,
      current: currentProjects,
      limit: projectLimit,
      shouldUpgrade,
      tier,
      message,
      upgradeMessage,
    };
  } catch (error) {
    console.error('Error checking project limit:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      current: 0,
      limit: null,
      shouldUpgrade: false,
      tier: 'free',
      message: 'Unable to verify project limit',
    };
  }
}

/**
 * Check if subscription is in good standing
 * (active, trialing, or grace period past_due)
 *
 * @param userId - User ID to check
 * @returns Whether subscription is active
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscriptionWithStatus(userId);

    // Allow free tier (always active)
    if (subscription.tier === 'free') {
      return true;
    }

    // Check subscription status
    const activeStatuses = ['active', 'trialing', 'past_due'];
    return activeStatuses.includes(subscription.status);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // On error, allow access (fail open for better UX)
    return true;
  }
}

/**
 * Get user-friendly tier name
 */
export function getTierDisplayName(tier: Subscription['tier']): string {
  const names: Record<Subscription['tier'], string> = {
    free: 'Free',
    student_pro: 'Student Pro',
    researcher: 'Researcher',
  };
  return names[tier] || tier;
}

/**
 * Get upgrade suggestion based on current tier
 */
export function getUpgradeSuggestion(
  tier: Subscription['tier'],
  context: 'ai' | 'projects'
): string {
  if (tier === 'free') {
    if (context === 'ai') {
      return 'Upgrade to Student Pro (€10/month) for unlimited AI interactions';
    }
    return 'Upgrade to Student Pro (€10/month) for up to 10 active projects';
  }

  if (tier === 'student_pro' && context === 'projects') {
    return 'Upgrade to Researcher (€25/month) for unlimited projects';
  }

  return 'Upgrade for more features';
}
