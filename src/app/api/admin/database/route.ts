import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin endpoint for database operations with service role key
export async function GET(request: NextRequest) {
  try {
    // Check if service role key is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Service role key not configured',
        hint: 'Add SUPABASE_SERVICE_ROLE_KEY to environment variables'
      }, { status: 500 })
    }

    if (!supabaseUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase URL not configured'
      }, { status: 500 })
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test 1: List all tables in public schema
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    // Test 2: Check conversations table structure
    const { data: conversationsColumns, error: columnsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'conversations')
      .eq('table_schema', 'public')

    // Test 3: Count conversations (should work even if empty)
    const { count: conversationsCount, error: countError } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })

    // Test 4: Check projects table (should exist)
    const { count: projectsCount, error: projectsCountError } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Test 5: Sample conversations data (first 3 records if any)
    const { data: sampleConversations, error: sampleError } = await supabaseAdmin
      .from('conversations')
      .select('id, user_id, message, ai_response, timestamp')
      .limit(3)
      .order('timestamp', { ascending: false })

    return NextResponse.json({
      status: 'success',
      message: 'Database access successful with service role key',
      tests: {
        service_role_configured: true,
        database_connection: {
          url: supabaseUrl,
          accessible: true
        },
        tables_list: {
          success: !tablesError,
          error: tablesError?.message || null,
          tables: tables?.map(t => t.table_name) || []
        },
        conversations_table: {
          exists: !columnsError && conversationsColumns && conversationsColumns.length > 0,
          error: columnsError?.message || null,
          columns: conversationsColumns?.map(c => ({ name: c.column_name, type: c.data_type })) || [],
          record_count: conversationsCount || 0,
          count_error: countError?.message || null,
          sample_data: sampleConversations || []
        },
        projects_table: {
          accessible: !projectsCountError,
          record_count: projectsCount || 0,
          error: projectsCountError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database admin test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST endpoint to run custom SQL queries
export async function POST(request: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Service role key not configured'
      }, { status: 500 })
    }

    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({
        status: 'error',
        message: 'No SQL query provided'
      }, { status: 400 })
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Execute custom query
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: query })

    return NextResponse.json({
      status: error ? 'error' : 'success',
      query: query,
      data: data,
      error: error?.message || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Query execution failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}