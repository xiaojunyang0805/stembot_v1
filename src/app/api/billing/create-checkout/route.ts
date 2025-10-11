/**
 * Create Stripe Checkout Session API Route
 * WP6.6: Create checkout sessions for subscription upgrades
 * WP6.9: Added dual authentication support (custom JWT + Supabase OAuth)
 * WP6.9: Replaced Stripe SDK with direct API calls to fix Vercel connection issues
 *
 * Handles creating Stripe Checkout sessions for users upgrading
 * from Free to Student Pro or Researcher tiers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { getUserSubscriptionWithStatus } from '@/lib/stripe/subscriptionHelpers';
import { STRIPE_PRICE_IDS, SubscriptionTier } from '@/lib/stripe/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

/**
 * Helper function to make direct Stripe API calls
 * Bypasses SDK connection issues in Vercel serverless environment
 */
async function stripeApiCall(endpoint: string, method: string = 'POST', data?: Record<string, any>) {
  const url = `https://api.stripe.com/v1/${endpoint}`;
  const auth = Buffer.from(`${STRIPE_SECRET_KEY}:`).toString('base64');

  const body = data
    ? new URLSearchParams(
        Object.entries(data).flatMap(([key, value]) => {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects (e.g., metadata)
            return Object.entries(value).map(([subKey, subValue]) =>
              [`${key}[${subKey}]`, String(subValue)]
            );
          }
          return [[key, String(value)]];
        })
      ).toString()
    : undefined;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Stripe API error: ${result.error?.message || 'Unknown error'}`);
  }

  return result;
}

/**
 * Create a Stripe Checkout session
 * POST /api/billing/create-checkout
 * Body: { tier: 'student_pro' | 'researcher', successUrl, cancelUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const { tier, successUrl, cancelUrl } = await request.json();

    // Validate tier
    if (!tier || (tier !== 'student_pro' && tier !== 'researcher')) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be student_pro or researcher' },
        { status: 400 }
      );
    }

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

    // Get auth token from header and verify (supports both custom JWT and Supabase OAuth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId: string;
    let userEmail: string;

    // Try custom JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.userId && decoded.email) {
        userId = decoded.userId;
        userEmail = decoded.email;
        console.log('🔒 Checkout: Using custom JWT auth for user:', userId);
      } else {
        throw new Error('Invalid JWT payload');
      }
    } catch (jwtError) {
      // JWT verification failed, try Supabase auth
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      userId = user.id;
      userEmail = user.email || '';
      console.log('🔒 Checkout: Using Supabase auth for user:', userId);
    }

    console.log('🛒 Creating checkout session for:', { userId, tier });

    // Get user's subscription to check if they already have a Stripe customer
    const subscription = await getUserSubscriptionWithStatus(userId);

    // Get or create Stripe customer
    let customerId = subscription.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer using direct API call
      const customer = await stripeApiCall('customers', 'POST', {
        email: userEmail,
        'metadata[supabase_user_id]': userId,
      });
      customerId = customer.id;

      // Update subscription record with customer ID (using existing supabaseAdmin)
      await supabaseAdmin
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);

      console.log('✅ Created new Stripe customer:', customerId);
    }

    // Get price ID for the selected tier
    const priceId = STRIPE_PRICE_IDS[tier as Exclude<SubscriptionTier, 'free'>];

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for tier: ${tier}` },
        { status: 500 }
      );
    }

    // Create Stripe Checkout session using direct API call
    const session = await stripeApiCall('checkout/sessions', 'POST', {
      customer: customerId,
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=cancelled`,
      'metadata[user_id]': userId,
      'metadata[tier]': tier,
      'subscription_data[metadata][user_id]': userId,
      'subscription_data[metadata][tier]': tier,
      allow_promotion_codes: true,
    });

    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Failed to create checkout session:', error);
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor?.name);
    console.error('Error name:', error.name);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Return detailed error for debugging (always return details for now)
    return NextResponse.json(
      {
        error: error.message || 'Failed to create checkout session',
        type: error.constructor?.name || 'Error',
        name: error.name,
        code: error.code,
        statusCode: error.statusCode,
        raw: error.raw?.message,
        // Always include stack for debugging
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      },
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
