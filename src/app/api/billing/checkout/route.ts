import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { plans } from '../../../../lib/stripe/config'

// Mock Stripe checkout for development
export async function POST(request: NextRequest) {
  try {
    const { priceId, planId, successUrl, cancelUrl } = await request.json()

    console.log('🛒 Creating checkout session for:', { priceId, planId })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find the plan
    const plan = plans.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // For development/mock mode, simulate checkout
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                    process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock'

    if (useMocks) {
      console.log('🎭 Mock checkout session created')

      // Mock checkout session
      const mockSession = {
        id: `cs_mock_${Date.now()}`,
        url: `${successUrl}?session_id=cs_mock_${Date.now()}&plan=${planId}`,
        payment_status: 'paid',
        customer: {
          id: `cus_mock_${user.id}`,
          email: user.email
        },
        subscription: {
          id: `sub_mock_${Date.now()}`,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          items: [{
            price: {
              id: priceId,
              unit_amount: plan.price * 100,
              currency: plan.currency.toLowerCase(),
              recurring: {
                interval: plan.interval
              }
            }
          }]
        }
      }

      // Simulate trial period
      if (plan.trialDays) {
        (mockSession.subscription as any).trial_end = Math.floor(Date.now() / 1000) + (plan.trialDays * 24 * 60 * 60)
      }

      return NextResponse.json({
        sessionId: mockSession.id,
        url: mockSession.url,
        mock: true
      })
    }

    // For production, you would create a real Stripe checkout session here
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({...})

    return NextResponse.json(
      { error: 'Stripe not configured for production' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}