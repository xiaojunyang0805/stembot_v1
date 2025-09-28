import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { plans } from '../../../../lib/stripe/config'

// Get user's usage statistics
export async function GET(request: NextRequest) {
  try {
    console.log('📈 Fetching usage statistics...')

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
      console.log('🎭 Returning mock usage data')

      // Get current date for monthly tracking
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Mock usage data
      const mockUsage = {
        userId: user.id,
        period: {
          start: monthStart.toISOString(),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        },
        projects: {
          count: 1,
          limit: 1, // Free tier limit
          percentage: 100
        },
        aiInteractions: {
          count: 15,
          limit: 50, // Free tier limit
          percentage: 30,
          remaining: 35
        },
        memory: {
          used: 2.5, // MB
          limit: 10, // MB for free tier
          percentage: 25
        },
        exports: {
          count: 3,
          limit: 10, // Free tier limit
          percentage: 30
        },
        currentPlan: plans[0], // Free plan
        warnings: [] as Array<{
          type: string
          message: string
          severity: string
        }>,
        mock: true
      }

      // Add warnings if approaching limits
      if (mockUsage.aiInteractions.percentage >= 80) {
        mockUsage.warnings.push({
          type: 'ai_interactions',
          message: 'You\'re approaching your monthly AI interaction limit',
          severity: 'warning'
        })
      }

      if (mockUsage.projects.percentage >= 100) {
        mockUsage.warnings.push({
          type: 'projects',
          message: 'You\'ve reached your project limit. Upgrade to create more projects.',
          severity: 'error'
        })
      }

      return NextResponse.json(mockUsage)
    }

    // For production, you would fetch real usage from database
    // Get projects count
    // Get AI interactions from conversations table
    // Get memory usage from project_memory table
    // Calculate against user's plan limits

    return NextResponse.json(
      { error: 'Usage tracking not configured for production' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Failed to fetch usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}

// Track usage event (AI interaction, project creation, etc.)
export async function POST(request: NextRequest) {
  try {
    const { eventType, metadata } = await request.json()

    console.log('📊 Tracking usage event:', { eventType, metadata })

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
      console.log('🎭 Mock usage tracking')

      const result = {
        success: true,
        eventType,
        metadata,
        timestamp: new Date().toISOString(),
        mock: true
      }

      return NextResponse.json(result)
    }

    // For production, you would:
    // 1. Check user's current plan limits
    // 2. Verify they haven't exceeded limits
    // 3. Track the usage event in database
    // 4. Update usage counters
    // 5. Send notifications if approaching limits

    return NextResponse.json(
      { error: 'Usage tracking not configured for production' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Failed to track usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage event' },
      { status: 500 }
    )
  }
}