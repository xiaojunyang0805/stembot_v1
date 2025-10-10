/**
 * Stripe Customer Portal API Route
 * WP6.6: Create Stripe Customer Portal sessions for subscription management
 *
 * Allows customers to manage their subscriptions, update payment methods,
 * view invoices, and update billing information.
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserSubscriptionWithStatus } from '@/lib/stripe/subscriptionHelpers';
import { stripe } from '@/lib/stripe/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Create a Stripe Customer Portal session
 * POST /api/billing/portal
 */
export async function POST(request: NextRequest) {
  try {
    const { returnUrl } = await request.json();

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

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
