/**
 * Usage Enforcement Middleware
 * WP6.5: Usage Enforcement Middleware
 *
 * Middleware functions to enforce tier-based usage limits
 * on AI interactions and project creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  checkAIUsageLimit,
  checkProjectLimit,
  isSubscriptionActive,
} from '@/lib/billing/usageGuards';
import { incrementAIUsage } from '@/lib/stripe/subscriptionHelpers';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract user ID from authorization header
 *
 * @param request - Next.js request object
 * @returns User ID or null if not authenticated
 */
async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Error extracting user ID from request:', error);
    return null;
  }
}

/**
 * Enforce AI usage limits before processing AI requests
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const limitCheck = await enforceAIUsageLimit(request);
 *   if (limitCheck) return limitCheck; // Return 402 response if limit reached
 *
 *   // Process AI request...
 *
 *   await incrementAIUsageForRequest(request); // Increment after successful response
 * }
 * ```
 *
 * @param request - Next.js request object
 * @returns NextResponse with 402 error if limit reached, null if allowed
 */
export async function enforceAIUsageLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Get user ID from auth header
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      // Not authenticated - let auth middleware handle this
      return null;
    }

    // Check if subscription is active
    const subscriptionActive = await isSubscriptionActive(userId);
    if (!subscriptionActive) {
      return NextResponse.json(
        {
          error: 'Subscription expired or past due',
          code: 'SUBSCRIPTION_INACTIVE',
          message:
            'Your subscription is no longer active. Please update your payment method.',
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Check AI usage limit
    const usageCheck = await checkAIUsageLimit(userId);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'AI interaction limit reached',
          code: 'USAGE_LIMIT_EXCEEDED',
          limit: usageCheck.limit,
          current: usageCheck.current,
          tier: usageCheck.tier,
          shouldUpgrade: usageCheck.shouldUpgrade,
          upgradeMessage: usageCheck.upgradeMessage,
          message: usageCheck.message,
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Limit check passed
    return null;
  } catch (error) {
    console.error('Error enforcing AI usage limit:', error);
    // On error, allow the request (fail open for better UX)
    return null;
  }
}

/**
 * Increment AI usage after successful AI response
 *
 * Call this AFTER successfully processing an AI request
 *
 * @param request - Next.js request object
 */
export async function incrementAIUsageForRequest(
  request: NextRequest
): Promise<void> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return;
    }

    await incrementAIUsage(userId);
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
    // Don't throw - usage increment failure shouldn't break the response
  }
}

/**
 * Enforce project creation limits before creating projects
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const limitCheck = await enforceProjectLimit(request);
 *   if (limitCheck) return limitCheck; // Return 402 response if limit reached
 *
 *   // Create project...
 * }
 * ```
 *
 * @param request - Next.js request object
 * @returns NextResponse with 402 error if limit reached, null if allowed
 */
export async function enforceProjectLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Get user ID from auth header
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      // Not authenticated - let auth middleware handle this
      return null;
    }

    // Check if subscription is active
    const subscriptionActive = await isSubscriptionActive(userId);
    if (!subscriptionActive) {
      return NextResponse.json(
        {
          error: 'Subscription expired or past due',
          code: 'SUBSCRIPTION_INACTIVE',
          message:
            'Your subscription is no longer active. Please update your payment method.',
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Check project limit
    const projectCheck = await checkProjectLimit(userId);

    if (!projectCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Project limit reached',
          code: 'PROJECT_LIMIT_EXCEEDED',
          limit: projectCheck.limit,
          current: projectCheck.current,
          tier: projectCheck.tier,
          shouldUpgrade: projectCheck.shouldUpgrade,
          upgradeMessage: projectCheck.upgradeMessage,
          message: projectCheck.message,
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Limit check passed
    return null;
  } catch (error) {
    console.error('Error enforcing project limit:', error);
    // On error, allow the request (fail open for better UX)
    return null;
  }
}

/**
 * Get usage status for a user (for display purposes)
 *
 * This is used by the frontend to display usage information
 * without blocking requests
 *
 * @param userId - User ID to check
 * @returns Usage status object
 */
export async function getUsageStatus(userId: string) {
  try {
    const [aiUsage, projectUsage] = await Promise.all([
      checkAIUsageLimit(userId),
      checkProjectLimit(userId),
    ]);

    return {
      ai: {
        current: aiUsage.current,
        limit: aiUsage.limit,
        remaining: aiUsage.remaining,
        allowed: aiUsage.allowed,
        tier: aiUsage.tier,
        message: aiUsage.message,
        upgradeMessage: aiUsage.upgradeMessage,
      },
      projects: {
        current: projectUsage.current,
        limit: projectUsage.limit,
        allowed: projectUsage.allowed,
        tier: projectUsage.tier,
        message: projectUsage.message,
        upgradeMessage: projectUsage.upgradeMessage,
      },
    };
  } catch (error) {
    console.error('Error getting usage status:', error);
    throw error;
  }
}
