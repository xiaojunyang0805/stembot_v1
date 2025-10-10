/**
 * Stripe Checkout Session Creation API
 * WP6.3: Checkout Flow & Payment Processing
 *
 * Creates a Stripe Checkout Session for subscription purchase
 *
 * POST /api/stripe/create-checkout-session
 * Body: { priceId: string, tier: 'student_pro' | 'researcher' }
 * Returns: { sessionId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/server';
import { SubscriptionTier } from '@/lib/stripe/server';

// Initialize Supabase client with service role for elevated permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// App URL for redirects
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
    // Reset or create new limit: 5 requests per minute
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + 60000, // 1 minute from now
    });
    return true;
  }

  if (limit.count >= 5) {
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
          error: 'Too many checkout attempts. Please try again in a minute.',
        },
        { status: 429 }
      );
    }

    // ===== REQUEST VALIDATION =====
    const body = await request.json();
    const { priceId, tier } = body;

    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid priceId' },
        { status: 400 }
      );
    }

    if (!tier || (tier !== 'student_pro' && tier !== 'researcher')) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "student_pro" or "researcher"' },
        { status: 400 }
      );
    }

    // ===== CHECK EXISTING SUBSCRIPTION =====
    const { data: existingSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Error checking subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to check existing subscription' },
        { status: 500 }
      );
    }

    // Check if user already has an active paid subscription
    if (
      existingSubscription &&
      existingSubscription.tier !== 'free' &&
      (existingSubscription.status === 'active' ||
        existingSubscription.status === 'trialing')
    ) {
      return NextResponse.json(
        {
          error:
            'You already have an active subscription. Please manage it from the customer portal.',
        },
        { status: 400 }
      );
    }

    // ===== GET OR CREATE STRIPE CUSTOMER =====
    let stripeCustomerId = existingSubscription?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: userId,
          },
        });

        stripeCustomerId = customer.id;

        // Update subscription record with customer ID
        if (existingSubscription) {
          await supabase
            .from('subscriptions')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('user_id', userId);
        } else {
          // Create subscription record with free tier
          await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            tier: 'free',
            status: 'active',
          });
        }
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return NextResponse.json(
          { error: 'Failed to create customer account' },
          { status: 500 }
        );
      }
    }

    // ===== CREATE CHECKOUT SESSION =====
    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/settings`,
        metadata: {
          userId,
          tier,
        },
        // Allow promotional codes
        allow_promotion_codes: true,
        // Collect billing address for tax purposes
        billing_address_collection: 'auto',
        // Customer can update payment method
        payment_method_collection: 'always',
      });

      // Return session ID
      return NextResponse.json(
        {
          sessionId: session.id,
          url: session.url,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error creating checkout session:', error);

      // Handle specific Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: `Invalid request: ${error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in create-checkout-session:', error);
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
