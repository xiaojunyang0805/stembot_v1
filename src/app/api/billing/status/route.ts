/**
 * Billing Status API Route
 * WP6.6: Comprehensive billing and usage data for Billing & Plans page
 *
 * Returns complete subscription, usage, and payment history data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import {
  getUserSubscriptionWithStatus,
  getCurrentUsageWithLimits,
} from '@/lib/stripe/subscriptionHelpers';
import { TIER_LIMITS, stripe } from '@/lib/stripe/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Get comprehensive billing status
 * Includes: subscription, usage, payment history, and tier information
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Try both authentication methods (Custom JWT and Supabase)
    let userId: string;

    // Try Custom JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.userId;
      console.log('📊 Using custom JWT auth for user:', userId);
    } catch (jwtError) {
      // If custom JWT fails, try Supabase auth
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      userId = user.id;
      console.log('📊 Using Supabase auth for user:', userId);
    }

    console.log('📊 Fetching billing status for user:', userId);

    // Fetch subscription and usage data in parallel
    const [subscription, usageData] = await Promise.all([
      getUserSubscriptionWithStatus(userId),
      getCurrentUsageWithLimits(userId),
    ]);

    const tier = subscription.tier;
    const tierLimits = TIER_LIMITS[tier];

    // Calculate usage percentages
    const aiUsagePercent =
      tierLimits.aiInteractions === null
        ? 0
        : Math.round(
            ((usageData.ai_interactions_count || 0) / tierLimits.aiInteractions) * 100
          );

    const projectUsagePercent =
      tierLimits.projects === null
        ? 0
        : Math.round(
            ((usageData.active_projects_count || 0) / tierLimits.projects) * 100
          );

    // Get usage color indicator
    const getUsageColor = (percent: number) => {
      if (percent >= 80) return 'red';
      if (percent >= 50) return 'yellow';
      return 'green';
    };

    // Calculate billing period from usage month
    const monthDate = new Date(usageData.month + '-01');
    const periodStart = monthDate.toISOString();
    const periodEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    ).toISOString();

    // Build response data
    const responseData: any = {
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        displayName: tierLimits.displayName,
        priceEur: tierLimits.priceEur,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        trialEnd: null, // trial_end not in Subscription type, can be added if needed
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
      },
      usage: {
        aiInteractions: {
          current: usageData.ai_interactions_count || 0,
          limit: tierLimits.aiInteractions,
          percentage: aiUsagePercent,
          color: getUsageColor(aiUsagePercent),
          unlimited: tierLimits.aiInteractions === null,
        },
        activeProjects: {
          current: usageData.active_projects_count || 0,
          limit: tierLimits.projects,
          percentage: projectUsagePercent,
          color: getUsageColor(projectUsagePercent),
          unlimited: tierLimits.projects === null,
        },
        period: {
          start: periodStart,
          end: periodEnd,
        },
      },
      tierInfo: {
        features: tierLimits.features,
        allTiers: Object.entries(TIER_LIMITS).map(([key, limits]) => ({
          id: key,
          displayName: limits.displayName,
          priceEur: limits.priceEur,
          features: limits.features,
          current: key === tier,
        })),
      },
      paymentHistory: [],
      warnings: [],
    };

    // Add warnings based on usage
    if (aiUsagePercent >= 80 && tierLimits.aiInteractions !== null) {
      responseData.warnings.push({
        type: 'ai_interactions',
        severity: aiUsagePercent >= 100 ? 'error' : 'warning',
        message:
          aiUsagePercent >= 100
            ? 'AI interaction limit reached. Upgrade to continue using AI features.'
            : `You've used ${aiUsagePercent}% of your monthly AI interactions.`,
      });
    }

    if (projectUsagePercent >= 100 && tierLimits.projects !== null) {
      responseData.warnings.push({
        type: 'projects',
        severity: 'error',
        message: 'Project limit reached. Upgrade to create more projects.',
      });
    }

    // Fetch payment history if user has a Stripe customer ID
    if (subscription.stripe_customer_id && tier !== 'free') {
      try {
        // Fetch recent invoices from Stripe
        const invoices = await stripe.invoices.list({
          customer: subscription.stripe_customer_id,
          limit: 10,
        });

        responseData.paymentHistory = invoices.data.map((invoice) => ({
          id: invoice.id,
          date: new Date(invoice.created * 1000).toISOString(),
          amount: invoice.amount_paid / 100, // Convert cents to euros
          currency: invoice.currency.toUpperCase(),
          status: invoice.status,
          pdfUrl: invoice.invoice_pdf,
          hostedUrl: invoice.hosted_invoice_url,
          description: invoice.description || `Invoice for ${tierLimits.displayName}`,
        }));
      } catch (error) {
        console.warn('Failed to fetch payment history:', error);
        // Don't fail the entire request if invoices can't be fetched
      }
    }

    console.log('✅ Billing status fetched successfully');

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch billing status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch billing status' },
      { status: 500 }
    );
  }
}
