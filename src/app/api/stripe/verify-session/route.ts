/**
 * Stripe Checkout Session Verification API
 * WP6.3: Checkout Flow & Payment Processing
 *
 * Verifies a Stripe Checkout Session and returns subscription info
 *
 * GET /api/stripe/verify-session?session_id=xxx
 * Returns: { status, subscription, customer }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/server';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Rate limiting: Simple in-memory store
 * In production, use Redis or similar distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(sessionId);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit: 20 requests per minute per session
    rateLimitStore.set(sessionId, {
      count: 1,
      resetAt: now + 60000, // 1 minute from now
    });
    return true;
  }

  if (limit.count >= 20) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // ===== GET SESSION ID FROM QUERY PARAMS =====
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Validate session ID format (Stripe checkout session IDs start with cs_)
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json(
        { error: 'Invalid session_id format' },
        { status: 400 }
      );
    }

    // ===== RATE LIMITING =====
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        {
          error: 'Too many verification attempts. Please try again in a minute.',
        },
        { status: 429 }
      );
    }

    // ===== RETRIEVE CHECKOUT SESSION FROM STRIPE =====
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      });
    } catch (error: any) {
      console.error('Error retrieving Stripe session:', error);

      if (error.type === 'StripeInvalidRequestError') {
        // Session not found or invalid
        if (error.message.includes('No such checkout session')) {
          return NextResponse.json(
            {
              error: 'Checkout session not found or expired',
              code: 'SESSION_NOT_FOUND',
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: `Invalid request: ${error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to retrieve checkout session' },
        { status: 500 }
      );
    }

    // ===== EXTRACT SESSION INFORMATION =====
    const paymentStatus = session.payment_status; // 'paid', 'unpaid', 'no_payment_required'
    const sessionStatus = session.status; // 'complete', 'expired', 'open'
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    // Build response object
    const response: any = {
      sessionId: session.id,
      status: sessionStatus,
      paymentStatus,
      mode: session.mode, // 'payment' or 'subscription'
    };

    // Include customer information if available
    if (typeof session.customer === 'object' && session.customer) {
      response.customer = {
        id: session.customer.id,
        email: session.customer.deleted ? undefined : session.customer.email,
      };
    } else if (typeof session.customer === 'string') {
      response.customer = {
        id: session.customer,
      };
    }

    // Include subscription information if available
    if (typeof session.subscription === 'object' && session.subscription) {
      response.subscription = {
        id: session.subscription.id,
        status: session.subscription.status,
        currentPeriodStart:
          'current_period_start' in session.subscription
            ? session.subscription.current_period_start
            : undefined,
        currentPeriodEnd:
          'current_period_end' in session.subscription
            ? session.subscription.current_period_end
            : undefined,
      };
    } else if (typeof session.subscription === 'string') {
      response.subscription = {
        id: session.subscription,
      };
    }

    // Include metadata
    if (userId) {
      response.userId = userId;
    }
    if (tier) {
      response.tier = tier;
    }

    // ===== VERIFY SUBSCRIPTION IN DATABASE =====
    // Only if session is complete and we have userId
    if (sessionStatus === 'complete' && userId) {
      try {
        const { data: dbSubscription, error: dbError } = await supabase
          .from('subscriptions')
          .select('tier, status, stripe_subscription_id')
          .eq('user_id', userId)
          .single();

        if (!dbError && dbSubscription) {
          response.dbSubscription = {
            tier: dbSubscription.tier,
            status: dbSubscription.status,
            stripeSubscriptionId: dbSubscription.stripe_subscription_id,
            synced:
              dbSubscription.stripe_subscription_id === response.subscription?.id,
          };
        }
      } catch (error) {
        console.error('Error checking database subscription:', error);
        // Don't fail the request if DB check fails
        response.dbSubscription = { error: 'Failed to verify database sync' };
      }
    }

    // ===== CHECK IF SESSION HAS BEEN PROCESSED =====
    // This helps with idempotency - avoiding double processing
    if (sessionStatus === 'complete') {
      response.processed = true;
      response.message = 'Payment successful! Your subscription is now active.';
    } else if (sessionStatus === 'expired') {
      response.processed = false;
      response.message = 'This checkout session has expired. Please start a new checkout.';
    } else if (sessionStatus === 'open') {
      response.processed = false;
      response.message = 'Payment is still pending. Please complete the checkout.';
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in verify-session:', error);
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
