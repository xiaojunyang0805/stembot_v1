/**
 * Stripe Webhook Handler
 * WP6.4: Stripe Webhook Handler
 *
 * Processes Stripe webhook events for subscription lifecycle management
 *
 * POST /api/webhooks/stripe
 * Handles: checkout.session.completed, customer.subscription.*, invoice.payment_*
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/server';
import Stripe from 'stripe';

// Initialize Supabase client with service role for elevated permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Verify webhook signature to ensure request is from Stripe
 */
function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error: any) {
    console.error('⚠️ Webhook signature verification failed:', error.message);
    return null;
  }
}

/**
 * Get current month in YYYY-MM format for usage tracking
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Handle checkout.session.completed event
 * Creates or updates subscription record after successful checkout
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('📦 Processing checkout.session.completed:', session.id);

  // Extract metadata
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as 'student_pro' | 'researcher';

  if (!userId) {
    console.error('❌ Missing userId in session metadata');
    return;
  }

  if (!tier || (tier !== 'student_pro' && tier !== 'researcher')) {
    console.error('❌ Invalid or missing tier in session metadata');
    return;
  }

  // Extract Stripe IDs
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) {
    console.error('❌ Missing customer or subscription ID in session');
    return;
  }

  // Retrieve full subscription details from Stripe
  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('❌ Failed to retrieve subscription:', error);
    return;
  }

  // Upsert subscription record (idempotent)
  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        tier,
        status: subscription.status,
        current_period_start:
          'current_period_start' in subscription &&
          typeof subscription.current_period_start === 'number'
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : null,
        current_period_end:
          'current_period_end' in subscription &&
          typeof subscription.current_period_end === 'number'
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

  if (upsertError) {
    console.error('❌ Failed to upsert subscription:', upsertError);
    return;
  }

  // Create initial usage tracking record for current month (idempotent)
  const currentMonth = getCurrentMonth();
  const { error: usageError } = await supabase
    .from('usage_tracking')
    .upsert(
      {
        user_id: userId,
        month: currentMonth,
        ai_interactions_count: 0,
        active_projects_count: 0,
      },
      {
        onConflict: 'user_id,month',
      }
    );

  if (usageError) {
    console.error('⚠️ Failed to create usage record:', usageError);
    // Don't return - subscription is still created successfully
  }

  console.log(
    `✅ Checkout completed: User ${userId} → ${tier} subscription (${subscription.status})`
  );
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription status, handles plan changes, trial endings
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('🔄 Processing customer.subscription.updated:', subscription.id);

  // Find subscription by stripe_subscription_id
  const { data: existingSubscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (fetchError || !existingSubscription) {
    console.error(
      '❌ Subscription not found in database:',
      subscription.id,
      fetchError
    );
    return;
  }

  // Update subscription record
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start:
        'current_period_start' in subscription &&
        typeof subscription.current_period_start === 'number'
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null,
      current_period_end:
        'current_period_end' in subscription &&
        typeof subscription.current_period_end === 'number'
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('❌ Failed to update subscription:', updateError);
    return;
  }

  console.log(
    `✅ Subscription updated: ${subscription.id} → ${subscription.status}${
      subscription.cancel_at_period_end ? ' (canceling at period end)' : ''
    }`
  );
}

/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled but keeps historical data
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log('🗑️ Processing customer.subscription.deleted:', subscription.id);

  // Find subscription by stripe_subscription_id
  const { data: existingSubscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (fetchError || !existingSubscription) {
    console.error(
      '❌ Subscription not found in database:',
      subscription.id,
      fetchError
    );
    return;
  }

  // Update subscription to canceled status
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('❌ Failed to mark subscription as canceled:', updateError);
    return;
  }

  console.log(`✅ Subscription deleted: ${subscription.id} → canceled`);
}

/**
 * Handle invoice.payment_succeeded event
 * Records payment in history and updates subscription status
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  console.log('💳 Processing invoice.payment_succeeded:', invoice.id);

  // Extract customer and subscription IDs
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  const subscriptionId =
    'subscription' in invoice && invoice.subscription
      ? typeof invoice.subscription === 'string'
        ? invoice.subscription
        : (invoice.subscription as Stripe.Subscription)?.id
      : null;

  if (!customerId) {
    console.error('❌ Missing customer ID in invoice');
    return;
  }

  // Find user by stripe_customer_id
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (fetchError || !subscription) {
    console.error(
      '❌ Subscription not found for customer:',
      customerId,
      fetchError
    );
    return;
  }

  const userId = subscription.user_id;

  // Record payment in payment_history (idempotent via invoice_id unique constraint)
  const paymentIntentId =
    'payment_intent' in invoice && invoice.payment_intent
      ? typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : (invoice.payment_intent as Stripe.PaymentIntent)?.id
      : null;

  const { error: paymentError } = await supabase
    .from('payment_history')
    .upsert(
      {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: paymentIntentId,
        amount_paid: invoice.amount_paid, // in cents
        currency: invoice.currency,
        status: invoice.status || 'paid',
        invoice_pdf: invoice.invoice_pdf || null,
        receipt_url: invoice.hosted_invoice_url || null,
        payment_date: new Date(invoice.created * 1000).toISOString(),
      },
      {
        onConflict: 'stripe_invoice_id',
      }
    );

  if (paymentError) {
    console.error('❌ Failed to record payment:', paymentError);
    // Continue - still update subscription status
  }

  // If subscription was past_due, update to active
  if (subscriptionId) {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
      .eq('status', 'past_due'); // Only update if currently past_due

    if (updateError) {
      console.error('⚠️ Failed to update subscription status:', updateError);
    }
  }

  console.log(
    `✅ Payment recorded: ${invoice.id} → ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`
  );
}

/**
 * Handle invoice.payment_failed event
 * Updates subscription status to past_due
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  console.log('⚠️ Processing invoice.payment_failed:', invoice.id);

  const subscriptionId =
    'subscription' in invoice && invoice.subscription
      ? typeof invoice.subscription === 'string'
        ? invoice.subscription
        : (invoice.subscription as Stripe.Subscription)?.id
      : null;

  if (!subscriptionId) {
    console.error('❌ Missing subscription ID in invoice');
    return;
  }

  // Update subscription status to past_due
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (updateError) {
    console.error('❌ Failed to update subscription status:', updateError);
    return;
  }

  console.log(`✅ Subscription marked as past_due: ${subscriptionId}`);

  // Future enhancement: Send notification to user about failed payment
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // ===== VERIFY WEBHOOK SIGNATURE =====
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const event = verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`\n🔔 Webhook received: ${event.type} (${event.id})`);

    // ===== HANDLE EVENT TYPES =====
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session
          );
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice
          );
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice
          );
          break;

        default:
          console.log(`⏭️ Unhandled event type: ${event.type}`);
      }
    } catch (handlerError) {
      console.error(`❌ Error handling ${event.type}:`, handlerError);
      // Still return 200 to acknowledge receipt
      // Stripe will retry failed webhooks automatically
    }

    // ===== ACKNOWLEDGE RECEIPT =====
    // Always return 200 to prevent Stripe from retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Unexpected error in webhook handler:', error);
    // Return 500 for unexpected errors - Stripe will retry
    return NextResponse.json(
      { error: 'Internal server error' },
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
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      },
    }
  );
}
