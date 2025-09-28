import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { plans } from '../../../../lib/stripe/config'

// Get user's current subscription
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching user subscription...')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For development/mock mode
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                    process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

    if (useMocks) {
      console.log('🎭 Returning mock subscription data')

      // Mock subscription data - free tier by default
      const mockSubscription = {
        id: `sub_mock_${user.id}`,
        status: 'active',
        tier: 'free',
        planId: 'free',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        trial_end: null,
        cancel_at_period_end: false,
        customer: {
          id: `cus_mock_${user.id}`,
          email: user.email
        },
        plan: plans[0], // Free plan
        usage: {
          projects: 0,
          aiInteractions: 12, // Mock some usage
          monthlyAiInteractions: 12
        },
        mock: true
      }

      return NextResponse.json({
        subscription: mockSubscription,
        usage: mockSubscription.usage
      })
    }

    // For production, you would fetch real subscription from Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const subscriptions = await stripe.subscriptions.list({
    //   customer: user.stripeCustomerId
    // })

    return NextResponse.json(
      { error: 'Stripe not configured for production' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Failed to fetch subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// Update subscription
export async function POST(request: NextRequest) {
  try {
    const { action, planId } = await request.json()

    console.log('🔄 Updating subscription:', { action, planId })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For development/mock mode
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                    process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

    if (useMocks) {
      console.log('🎭 Mock subscription update')

      const result = {
        success: true,
        action,
        planId,
        message: `Subscription ${action} successful (mock)`,
        mock: true
      }

      return NextResponse.json(result)
    }

    // For production, you would update real Stripe subscription
    // Handle different actions: upgrade, downgrade, cancel, reactivate

    return NextResponse.json(
      { error: 'Stripe not configured for production' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Failed to update subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}