/**
 * Create Stripe Checkout Session API Route
 * WP6.6: Create checkout sessions for subscription upgrades
 * WP6.9: Added dual authentication support (custom JWT + Supabase OAuth)
 *
 * Handles creating Stripe Checkout sessions for users upgrading
 * from Free to Student Pro or Researcher tiers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { getUserSubscriptionWithStatus } from '@/lib/stripe/subscriptionHelpers';
import { stripe, STRIPE_PRICE_IDS, SubscriptionTier } from '@/lib/stripe/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
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

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=cancelled`,
      metadata: {
        user_id: userId,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          tier: tier,
        },
      },
      // Allow promotion codes
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
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
