/**
 * Subscription Helper Functions
 * WP6.2: Stripe Helper Libraries
 *
 * Server-side helper functions for managing subscriptions and usage tracking.
 * These functions interact with Supabase to manage billing data.
 *
 * IMPORTANT: Only use these functions in server-side code (API routes, server components)
 */

import { createClient } from '@supabase/supabase-js';
import { TIER_LIMITS, SubscriptionTier } from './server';
import type {
  Subscription,
  UsageData,
  SubscriptionWithStatus,
  UsageWithLimits,
  LimitCheckResult,
} from '@/types/billing';

// =====================================================
// SUPABASE CLIENT INITIALIZATION
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '❌ Supabase environment variables missing. ' +
      'Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

/**
 * Supabase client with service role key
 * Used for billing operations that require elevated permissions
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// SUBSCRIPTION MANAGEMENT
// =====================================================

/**
 * Get user's subscription from database
 * Returns free tier as default if no subscription exists
 *
 * @param userId - User's UUID
 * @returns User's subscription or default free tier
 *
 * @example
 * ```typescript
 * const subscription = await getUserSubscription(userId);
 * console.log(subscription.tier); // 'free', 'student_pro', or 'researcher'
 * ```
 */
export async function getUserSubscription(userId: string): Promise<Subscription> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no subscription found, return default free tier
      if (error.code === 'PGRST116') {
        console.warn(`No subscription found for user ${userId}, returning free tier`);
        return createDefaultFreeSubscription(userId);
      }
      throw error;
    }

    return data as Subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    // Fallback to free tier on error
    return createDefaultFreeSubscription(userId);
  }
}

/**
 * Get subscription with computed status fields
 *
 * @param userId - User's UUID
 * @returns Subscription with isActive, isTrialing, willCancel, daysRemaining
 */
export async function getUserSubscriptionWithStatus(
  userId: string
): Promise<SubscriptionWithStatus> {
  const subscription = await getUserSubscription(userId);

  const now = new Date();
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const isActive =
    subscription.status === 'active' || subscription.status === 'trialing';
  const isTrialing = subscription.status === 'trialing';
  const willCancel = subscription.cancel_at_period_end;

  let daysRemaining: number | null = null;
  if (periodEnd) {
    const diff = periodEnd.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    ...subscription,
    isActive,
    isTrialing,
    willCancel,
    daysRemaining,
  };
}

/**
 * Create a default free tier subscription object
 * Used as fallback when no subscription exists
 *
 * @param userId - User's UUID
 * @returns Default free subscription
 */
function createDefaultFreeSubscription(userId: string): Subscription {
  const now = new Date().toISOString();
  return {
    id: 'default-free',
    user_id: userId,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    tier: 'free',
    status: 'active',
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    canceled_at: null,
    created_at: now,
    updated_at: now,
  };
}

// =====================================================
// USAGE TRACKING
// =====================================================

/**
 * Get current month's usage data for a user
 * Creates a new usage record if none exists
 *
 * @param userId - User's UUID
 * @returns Current month's usage data
 *
 * @example
 * ```typescript
 * const usage = await getCurrentUsage(userId);
 * console.log(usage.ai_interactions_count); // e.g., 15
 * console.log(usage.active_projects_count); // e.g., 2
 * ```
 */
export async function getCurrentUsage(userId: string): Promise<UsageData> {
  try {
    const currentMonth = getCurrentMonth();

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single();

    if (error) {
      // If no usage record found, create one
      if (error.code === 'PGRST116') {
        return await createUsageRecord(userId, currentMonth);
      }
      throw error;
    }

    return data as UsageData;
  } catch (error) {
    console.error('Error fetching usage:', error);
    // Return empty usage on error
    return createEmptyUsageData(userId);
  }
}

/**
 * Get usage data with tier limits for comparison
 *
 * @param userId - User's UUID
 * @returns Usage data with limits and computed percentages
 */
export async function getCurrentUsageWithLimits(
  userId: string
): Promise<UsageWithLimits> {
  const [usage, subscription] = await Promise.all([
    getCurrentUsage(userId),
    getUserSubscription(userId),
  ]);

  const limits = TIER_LIMITS[subscription.tier];

  const ai_interactions_exceeded =
    limits.aiInteractions !== null &&
    usage.ai_interactions_count >= limits.aiInteractions;

  const active_projects_exceeded =
    limits.projects !== null && usage.active_projects_count >= limits.projects;

  const ai_interactions_percentage =
    limits.aiInteractions !== null
      ? Math.min(100, (usage.ai_interactions_count / limits.aiInteractions) * 100)
      : 0;

  const active_projects_percentage =
    limits.projects !== null
      ? Math.min(100, (usage.active_projects_count / limits.projects) * 100)
      : 0;

  return {
    ...usage,
    tier: subscription.tier,
    ai_interactions_limit: limits.aiInteractions,
    active_projects_limit: limits.projects,
    ai_interactions_exceeded,
    active_projects_exceeded,
    ai_interactions_percentage,
    active_projects_percentage,
  };
}

/**
 * Increment AI interaction count for current month
 * Uses atomic database function to prevent race conditions
 *
 * @param userId - User's UUID
 * @returns New AI interaction count
 *
 * @example
 * ```typescript
 * const newCount = await incrementAIUsage(userId);
 * console.log(`User has made ${newCount} AI interactions this month`);
 * ```
 */
export async function incrementAIUsage(userId: string): Promise<number> {
  try {
    const currentMonth = getCurrentMonth();

    const { data, error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_month: currentMonth,
    });

    if (error) throw error;

    return data as number;
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
    throw new Error('Failed to increment AI usage');
  }
}

/**
 * Update active project count for current month
 * Upserts the count (creates record if doesn't exist)
 *
 * @param userId - User's UUID
 * @param count - New project count
 * @returns Updated usage data
 *
 * @example
 * ```typescript
 * await updateProjectCount(userId, 3); // User now has 3 active projects
 * ```
 */
export async function updateProjectCount(
  userId: string,
  count: number
): Promise<UsageData> {
  try {
    const currentMonth = getCurrentMonth();

    const { data, error } = await supabase
      .from('usage_tracking')
      .upsert(
        {
          user_id: userId,
          month: currentMonth,
          active_projects_count: count,
        },
        {
          onConflict: 'user_id,month',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return data as UsageData;
  } catch (error) {
    console.error('Error updating project count:', error);
    throw new Error('Failed to update project count');
  }
}

// =====================================================
// LIMIT CHECKING
// =====================================================

/**
 * Check if user can create a new project
 * Checks against tier project limit
 *
 * @param userId - User's UUID
 * @returns Limit check result with allowed status
 *
 * @example
 * ```typescript
 * const check = await canUserCreateProject(userId);
 * if (!check.allowed) {
 *   console.log(check.suggestion); // "Upgrade to Student Pro for 10 projects"
 * }
 * ```
 */
export async function canUserCreateProject(userId: string): Promise<LimitCheckResult> {
  try {
    const usage = await getCurrentUsageWithLimits(userId);

    const allowed =
      usage.active_projects_limit === null ||
      usage.active_projects_count < usage.active_projects_limit;

    const percentageUsed =
      usage.active_projects_limit !== null
        ? (usage.active_projects_count / usage.active_projects_limit) * 100
        : null;

    let suggestion: string | undefined;
    if (!allowed) {
      if (usage.tier === 'free') {
        suggestion = 'Upgrade to Student Pro for up to 10 active projects';
      } else if (usage.tier === 'student_pro') {
        suggestion = 'Upgrade to Researcher for unlimited projects';
      }
    }

    return {
      allowed,
      current: usage.active_projects_count,
      limit: usage.active_projects_limit,
      exceeded: usage.active_projects_exceeded,
      percentageUsed,
      tier: usage.tier,
      suggestion,
    };
  } catch (error) {
    console.error('Error checking project limit:', error);
    // Default to not allowed on error for safety
    return {
      allowed: false,
      current: 0,
      limit: 1,
      exceeded: true,
      percentageUsed: 100,
      tier: 'free',
      suggestion: 'Error checking project limit. Please try again.',
    };
  }
}

/**
 * Check if user can make an AI interaction
 * Checks against tier AI interaction limit
 *
 * @param userId - User's UUID
 * @returns Limit check result with allowed status
 *
 * @example
 * ```typescript
 * const check = await canUserUseAI(userId);
 * if (!check.allowed) {
 *   console.log(check.suggestion); // "Upgrade to Student Pro for unlimited AI"
 * }
 * ```
 */
export async function canUserUseAI(userId: string): Promise<LimitCheckResult> {
  try {
    const usage = await getCurrentUsageWithLimits(userId);

    const allowed =
      usage.ai_interactions_limit === null ||
      usage.ai_interactions_count < usage.ai_interactions_limit;

    const percentageUsed =
      usage.ai_interactions_limit !== null
        ? (usage.ai_interactions_count / usage.ai_interactions_limit) * 100
        : null;

    let suggestion: string | undefined;
    if (!allowed) {
      suggestion = 'Upgrade to Student Pro or Researcher for unlimited AI interactions';
    }

    return {
      allowed,
      current: usage.ai_interactions_count,
      limit: usage.ai_interactions_limit,
      exceeded: usage.ai_interactions_exceeded,
      percentageUsed,
      tier: usage.tier,
      suggestion,
    };
  } catch (error) {
    console.error('Error checking AI limit:', error);
    // Default to not allowed on error for safety
    return {
      allowed: false,
      current: 0,
      limit: 30,
      exceeded: true,
      percentageUsed: 100,
      tier: 'free',
      suggestion: 'Error checking AI interaction limit. Please try again.',
    };
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get current month in YYYY-MM format
 * @returns Current month string (e.g., "2025-10")
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Create a new usage record in the database
 * @param userId - User's UUID
 * @param month - Month in YYYY-MM format
 * @returns Created usage data
 */
async function createUsageRecord(userId: string, month: string): Promise<UsageData> {
  const { data, error } = await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      month,
      ai_interactions_count: 0,
      active_projects_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating usage record:', error);
    return createEmptyUsageData(userId);
  }

  return data as UsageData;
}

/**
 * Create empty usage data object
 * Used as fallback when database operations fail
 * @param userId - User's UUID
 * @returns Empty usage data
 */
function createEmptyUsageData(userId: string): UsageData {
  const now = new Date().toISOString();
  return {
    id: 'empty',
    user_id: userId,
    month: getCurrentMonth(),
    ai_interactions_count: 0,
    active_projects_count: 0,
    created_at: now,
    updated_at: now,
  };
}

// =====================================================
// ADMIN FUNCTIONS (use with caution)
// =====================================================

/**
 * Reset usage for a specific month
 * ⚠️  ADMIN ONLY - Use with caution
 *
 * @param userId - User's UUID
 * @param month - Month to reset (defaults to current month)
 * @returns Success status
 */
export async function resetUsage(
  userId: string,
  month: string = getCurrentMonth()
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('usage_tracking')
      .update({
        ai_interactions_count: 0,
        active_projects_count: 0,
      })
      .eq('user_id', userId)
      .eq('month', month);

    if (error) throw error;

    console.log(`✅ Reset usage for user ${userId}, month ${month}`);
    return true;
  } catch (error) {
    console.error('Error resetting usage:', error);
    return false;
  }
}

/**
 * Get all usage history for a user
 * ⚠️  ADMIN ONLY - Returns all months of usage data
 *
 * @param userId - User's UUID
 * @param limit - Maximum number of months to return
 * @returns Array of usage data ordered by month (newest first)
 */
export async function getUserUsageHistory(
  userId: string,
  limit: number = 12
): Promise<UsageData[]> {
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data as UsageData[];
  } catch (error) {
    console.error('Error fetching usage history:', error);
    return [];
  }
}
