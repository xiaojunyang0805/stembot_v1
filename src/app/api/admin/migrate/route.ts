/**
 * Admin API endpoint to execute database migrations
 * Used to apply SQL migrations to Supabase database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      )
    }

    console.log('🔧 Executing migration SQL...')

    // Execute the SQL via Supabase RPC
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: sql
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    console.log('✅ Migration executed successfully')

    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully',
      data
    })
  } catch (error: any) {
    console.error('💥 Migration error:', error)
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}

// Allow GET to check if table exists
export async function GET() {
  try {
    console.log('🔍 Checking if project_methodology table exists...')

    const { data, error } = await supabaseAdmin
      .from('project_methodology')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist
        return NextResponse.json({
          exists: false,
          message: 'project_methodology table does not exist'
        })
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exists: true,
      message: 'project_methodology table exists'
    })
  } catch (error: any) {
    console.error('💥 Check error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
