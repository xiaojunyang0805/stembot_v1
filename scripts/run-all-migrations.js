#!/usr/bin/env node

/**
 * ⚡ Batch Migration Executor for Supabase
 *
 * Executes all pending migrations directly via Supabase client
 * No need for dev server - uses direct Supabase connection
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    line = line.trim()
    if (!line || line.startsWith('#')) return

    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
      if (!process.env[key]) { // Don't override existing env vars
        process.env[key] = value
      }
    }
  })
  console.log('✅ Loaded environment variables from .env.local\n')
}

// Environment check
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Get all migration files in order
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort() // Alphabetical order ensures 001, 002, etc. execute in sequence

console.log(`🚀 Found ${migrationFiles.length} migration files\n`)

async function executeMigration(filename) {
  const filePath = path.join(migrationsDir, filename)
  const sqlContent = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n📝 Executing: ${filename}`)
  console.log('─'.repeat(60))

  // Split into statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`   Statements: ${statements.length}`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]

    try {
      // Execute raw SQL using Supabase's postgres connection
      const { error } = await supabase.rpc('exec', { query: statement })

      if (error) {
        // Some errors are acceptable (e.g., "already exists")
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.code === '42P07' || // relation already exists
            error.code === '42710') {  // duplicate object
          console.log(`   ⚠️  [${i + 1}] Skipped (already exists)`)
          successCount++
        } else {
          console.log(`   ❌ [${i + 1}] Failed: ${error.message}`)
          errorCount++
        }
      } else {
        console.log(`   ✅ [${i + 1}] Success`)
        successCount++
      }
    } catch (err) {
      console.log(`   ❌ [${i + 1}] Error: ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n   Summary: ✅ ${successCount} | ❌ ${errorCount}`)

  return { filename, successCount, errorCount, total: statements.length }
}

async function runAllMigrations() {
  console.log('🗄️  Starting batch migration execution...\n')

  const results = []

  for (const file of migrationFiles) {
    const result = await executeMigration(file)
    results.push(result)
  }

  console.log('\n')
  console.log('═'.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('═'.repeat(60))

  let totalSuccess = 0
  let totalErrors = 0

  results.forEach(r => {
    totalSuccess += r.successCount
    totalErrors += r.errorCount
    const status = r.errorCount === 0 ? '✅' : '⚠️'
    console.log(`${status} ${r.filename}: ${r.successCount}/${r.total} statements`)
  })

  console.log('─'.repeat(60))
  console.log(`Overall: ✅ ${totalSuccess} successful | ❌ ${totalErrors} failed`)
  console.log('═'.repeat(60))

  if (totalErrors === 0) {
    console.log('\n🎉 All migrations completed successfully!')
  } else {
    console.log('\n⚠️  Some migrations had errors (check above for details)')
  }
}

runAllMigrations().catch(err => {
  console.error('\n💥 Fatal error:', err.message)
  process.exit(1)
})
