/**
 * Stripe Customer Portal API Route
 * WP6.6: Create Stripe Customer Portal sessions for subscription management
 *
 * Allows customers to manage their subscriptions, update payment methods,
 * view invoices, and update billing information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserSubscriptionWithStatus } from '@/lib/stripe/subscriptionHelpers';
import { stripe } from '@/lib/stripe/server';

/**
 * Create a Stripe Customer Portal session
 * POST /api/billing/portal
 */
export async function POST(request: NextRequest) {
  try {
    const { returnUrl } = await request.json();

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

    // Get auth token from header and verify with Supabase
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = user.id;

    console.log('🔐 Creating customer portal session for user:', userId);

    // Get user's subscription to get Stripe customer ID
    const subscription = await getUserSubscriptionWithStatus(userId);

    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please contact support.' },
        { status: 404 }
      );
    }

    if (subscription.tier === 'free') {
      return NextResponse.json(
        { error: 'Customer portal is only available for paid subscriptions' },
        { status: 403 }
      );
    }

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    console.log('✅ Customer portal session created:', session.id);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Failed to create customer portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer portal session' },
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
