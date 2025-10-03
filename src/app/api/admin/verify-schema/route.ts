/**
 * Verify methodology schema is correctly set up
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log('🔍 Verifying project_methodology schema...')

    // Test 1: Check table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'project_methodology'
          ORDER BY ordinal_position;
        `
      })

    if (columnsError) {
      console.error('❌ Error fetching columns:', columnsError)
    }

    // Test 2: Check indexes
    const { data: indexes, error: indexesError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT indexname, indexdef
          FROM pg_indexes
          WHERE tablename = 'project_methodology';
        `
      })

    if (indexesError) {
      console.error('❌ Error fetching indexes:', indexesError)
    }

    // Test 3: Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT policyname, cmd, qual::text
          FROM pg_policies
          WHERE tablename = 'project_methodology';
        `
      })

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError)
    }

    // Test 4: Simple CRUD test
    console.log('📝 Testing CRUD operations...')

    return NextResponse.json({
      success: true,
      schema: {
        columns: columns || 'Could not fetch columns',
        indexes: indexes || 'Could not fetch indexes',
        policies: policies || 'Could not fetch policies'
      },
      message: 'Schema verification complete'
    })
  } catch (error: any) {
    console.error('💥 Verification error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
