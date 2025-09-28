import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// Stripe webhook handler for subscription events
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')
    const body = await request.text()

    console.log('🔔 Stripe webhook received:', { signature: !!signature })

    // For development/mock mode
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                    process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

    if (useMocks) {
      console.log('🎭 Mock webhook processing')

      // Parse mock webhook payload
      const event = JSON.parse(body)

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          console.log('📝 Subscription event:', event.type)
          return NextResponse.json({
            received: true,
            mock: true,
            event: event.type
          })

        case 'customer.subscription.deleted':
          console.log('❌ Subscription cancelled:', event.type)
          return NextResponse.json({
            received: true,
            mock: true,
            event: event.type
          })

        case 'invoice.payment_succeeded':
          console.log('💰 Payment succeeded:', event.type)
          return NextResponse.json({
            received: true,
            mock: true,
            event: event.type
          })

        case 'invoice.payment_failed':
          console.log('❌ Payment failed:', event.type)
          return NextResponse.json({
            received: true,
            mock: true,
            event: event.type
          })

        default:
          console.log('🔍 Unhandled event type:', event.type)
          return NextResponse.json({
            received: true,
            mock: true,
            event: event.type
          })
      }
    }

    // For production, you would:
    // 1. Verify webhook signature with Stripe
    // 2. Parse the webhook event
    // 3. Update subscription status in database
    // 4. Handle payment failures and dunning
    // 5. Send notification emails to users
    // 6. Update usage limits based on plan changes

    // Example production webhook handling:
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await updateUserSubscription(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await cancelUserSubscription(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handleSuccessfulPayment(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleFailedPayment(failedInvoice)
        break
    }
    */

    return NextResponse.json(
      { error: 'Stripe webhooks not configured for production' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Webhook processing failed:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Helper functions for production webhook handling
/*
async function updateUserSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    // Update user's subscription status
    await supabase
      .from('users')
      .update({
        subscription_tier: getSubscriptionTier(subscription),
        subscription_status: subscription.status,
        subscription_id: subscription.id,
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
      })
      .eq('id', user.id)
  }
}

async function cancelUserSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        subscription_id: null,
        updated_at: new Date()
      })
      .eq('id', user.id)
  }
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  // Update payment status, reset usage counters, etc.
  console.log('Payment successful for invoice:', invoice.id)
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  // Handle dunning, send notification emails, etc.
  console.log('Payment failed for invoice:', invoice.id)
}

function getSubscriptionTier(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id

  // Map Stripe price IDs to our subscription tiers
  const priceToTierMap: Record<string, string> = {
    'price_mock_pro_monthly': 'pro_monthly',
    'price_mock_pro_annual': 'pro_annual',
    'price_mock_student_monthly': 'student_monthly',
    'price_mock_department_license': 'department_license',
    'price_mock_institution_license': 'institution_license'
  }

  return priceToTierMap[priceId] || 'free'
}
*/