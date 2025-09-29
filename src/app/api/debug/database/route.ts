import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({
        status: 'error',
        message: 'Authentication failed',
        error: authError.message,
        timestamp: new Date().toISOString()
      })
    }

    // Test conversations table existence and permissions
    const tests: any = {
      user_auth: !!user,
      user_id: user?.id || 'not authenticated',
      timestamp: new Date().toISOString()
    }

    // Test if conversations table exists and is accessible
    try {
      const { data: conversationsTest, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)

      tests.conversations_table = {
        exists: !convError,
        error: convError?.message || null,
        accessible: !!conversationsTest
      }
    } catch (err) {
      tests.conversations_table = {
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        accessible: false
      }
    }

    // Test if projects table exists and is accessible
    try {
      const { data: projectsTest, error: projError } = await supabase
        .from('projects')
        .select('id')
        .limit(1)

      tests.projects_table = {
        exists: !projError,
        error: projError?.message || null,
        accessible: !!projectsTest,
        count: projectsTest?.length || 0
      }
    } catch (err) {
      tests.projects_table = {
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        accessible: false
      }
    }

    // Test basic insert capability (dry run)
    if (user && tests.conversations_table?.exists) {
      try {
        // Just check the structure without actually inserting
        const testData = {
          project_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
          user_id: user.id,
          message: 'test',
          ai_response: 'test response',
          model_used: 'test-model'
        }

        // This will fail due to foreign key constraint, but tells us about table structure
        const { error: insertTestError } = await supabase
          .from('conversations')
          .insert(testData)
          .select()

        tests.insert_capability = {
          can_attempt: true,
          structure_error: insertTestError?.message || null
        }
      } catch (err) {
        tests.insert_capability = {
          can_attempt: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      tests,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}