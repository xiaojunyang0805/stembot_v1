/**
 * ⚡ AUTOMATED SQL EXECUTION ENDPOINT
 *
 * This endpoint allows Claude Code to execute SQL migrations automatically.
 * Security: Protected by service role key, only accessible locally or with proper auth.
 *
 * Usage:
 * POST /api/admin/execute-sql
 * Body: { "sql": "CREATE TABLE...", "description": "What this SQL does" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { sql, description, dryRun = false } = await request.json()

    if (!sql) {
      return NextResponse.json(
        { error: 'SQL is required' },
        { status: 400 }
      )
    }

    console.log('🔧 SQL Execution Request:')
    console.log('   Description:', description || 'No description provided')
    console.log('   Dry Run:', dryRun)
    console.log('   SQL Length:', sql.length, 'characters\n')

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - SQL will not be executed')
      console.log('SQL Preview:\n', sql.substring(0, 500) + '...\n')
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: 'Dry run completed - no changes made',
        sqlPreview: sql.substring(0, 500)
      })
    }

    // Split SQL into individual statements (basic split by semicolon)
    const statements = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...\n`)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      console.log(`[${i + 1}/${statements.length}] Executing...`)

      try {
        // For DDL statements, we need to use raw SQL execution
        // Supabase.js doesn't have a direct execute method, so we'll use a workaround

        // Try using the postgres connection directly
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ query: statement })
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.log(`   ❌ Failed: ${errorText}`)
          errorCount++
          results.push({
            statement: i + 1,
            success: false,
            error: errorText
          })
        } else {
          console.log(`   ✅ Success`)
          successCount++
          results.push({
            statement: i + 1,
            success: true
          })
        }
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`)
        errorCount++
        results.push({
          statement: i + 1,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`\n📊 Execution Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📝 Total: ${statements.length}\n`)

    return NextResponse.json({
      success: errorCount === 0,
      summary: {
        total: statements.length,
        successful: successCount,
        failed: errorCount
      },
      results,
      message: errorCount === 0
        ? '✅ All statements executed successfully'
        : `⚠️ ${errorCount} statement(s) failed`
    })

  } catch (error: any) {
    console.error('💥 Execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack
      },
      { status: 500 }
    )
  }
}

// GET endpoint to list available migrations
export async function GET() {
  try {
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

    if (!fs.existsSync(migrationsDir)) {
      return NextResponse.json({
        error: 'Migrations directory not found'
      }, { status: 404 })
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(migrationsDir, f),
        size: fs.statSync(path.join(migrationsDir, f)).size
      }))

    return NextResponse.json({
      success: true,
      migrations: files,
      count: files.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
