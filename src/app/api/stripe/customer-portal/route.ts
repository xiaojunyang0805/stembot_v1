/**
 * Stripe Customer Portal API
 * WP6.3: Checkout Flow & Payment Processing
 *
 * Creates a Stripe Customer Portal session for subscription management
 *
 * POST /api/stripe/customer-portal
 * Returns: { url: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/server';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// App URL for return_url
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Rate limiting: Simple in-memory store
 * In production, use Redis or similar distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(userId);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit: 10 requests per minute
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + 60000, // 1 minute from now
    });
    return true;
  }

  if (limit.count >= 10) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // ===== AUTHENTICATION =====
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in again.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // ===== RATE LIMITING =====
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          error: 'Too many portal access attempts. Please try again in a minute.',
        },
        { status: 429 }
      );
    }

    // ===== GET STRIPE CUSTOMER ID =====
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, tier, status')
      .eq('user_id', userId)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);

      // If no subscription found
      if (subError.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: 'No subscription found. Please subscribe first.',
            code: 'NO_SUBSCRIPTION',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to retrieve subscription information' },
        { status: 500 }
      );
    }

    // Check if user has a Stripe customer ID
    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            'No billing account found. Please subscribe to a plan first.',
          code: 'NO_CUSTOMER_ID',
        },
        { status: 404 }
      );
    }

    // Check if user is on free tier (shouldn't access portal)
    if (subscription.tier === 'free') {
      return NextResponse.json(
        {
          error:
            'Customer portal is only available for paid subscriptions. Please upgrade to access billing management.',
          code: 'FREE_TIER',
        },
        { status: 403 }
      );
    }

    // ===== CREATE CUSTOMER PORTAL SESSION =====
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${appUrl}/settings`,
      });

      // Return portal URL
      return NextResponse.json(
        {
          url: portalSession.url,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error creating customer portal session:', error);

      // Handle specific Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        // Customer might have been deleted in Stripe
        if (error.message.includes('No such customer')) {
          return NextResponse.json(
            {
              error:
                'Billing account not found. Please contact support.',
              code: 'CUSTOMER_NOT_FOUND',
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: `Invalid request: ${error.message}` },
          { status: 400 }
        );
      }

      if (error.type === 'StripeAPIError') {
        return NextResponse.json(
          {
            error:
              'Stripe service temporarily unavailable. Please try again in a moment.',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to access billing portal. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in customer-portal:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
