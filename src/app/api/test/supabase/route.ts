import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET() {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...')

    // Test 2: Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth test:', { user: !!user, error: authError?.message })

    // Test 3: Try to access projects table (known to work)
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(1)

    console.log('Projects table test:', {
      success: !projectsError,
      error: projectsError?.message,
      count: projectsData?.length
    })

    // Test 4: Try to access conversations table
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1)

    console.log('Conversations table test:', {
      success: !conversationsError,
      error: conversationsError?.message,
      count: conversationsData?.length
    })

    // Test 5: Check if we can list all tables (might not work with RLS)
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    console.log('Tables list test:', {
      success: !tablesError,
      error: tablesError?.message,
      tables: tablesData?.map(t => t.table_name)
    })

    return NextResponse.json({
      status: 'success',
      tests: {
        authentication: {
          hasUser: !!user,
          userId: user?.id || null,
          authError: authError?.message || null
        },
        projects_table: {
          accessible: !projectsError,
          error: projectsError?.message || null,
          hasData: (projectsData?.length || 0) > 0,
          sampleData: projectsData
        },
        conversations_table: {
          accessible: !conversationsError,
          error: conversationsError?.message || null,
          hasData: (conversationsData?.length || 0) > 0
        },
        database_info: {
          tablesAccessible: !tablesError,
          tablesError: tablesError?.message || null,
          availableTables: tablesData?.map(t => t.table_name) || []
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Supabase connection',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}