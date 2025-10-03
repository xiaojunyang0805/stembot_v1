#!/usr/bin/env node

/**
 * ⚡ Automated Migration Execution Script
 *
 * This script allows Claude Code to execute Supabase migrations automatically
 * via the Next.js API endpoint.
 *
 * Usage:
 *   node scripts/execute-migration.js <migration-file.sql>
 *   node scripts/execute-migration.js supabase/migrations/20251003_create_project_methodology.sql
 *   node scripts/execute-migration.js --dry-run supabase/migrations/20251003_create_project_methodology.sql
 */

const fs = require('fs')
const path = require('path')

// Parse arguments
const args = process.argv.slice(2)
let dryRun = false
let migrationFile = null

for (const arg of args) {
  if (arg === '--dry-run' || arg === '-d') {
    dryRun = true
  } else if (!migrationFile) {
    migrationFile = arg
  }
}

if (!migrationFile) {
  console.error('❌ Error: Migration file path required')
  console.error('Usage: node scripts/execute-migration.js [--dry-run] <migration-file.sql>')
  process.exit(1)
}

// Resolve file path
const filePath = path.resolve(process.cwd(), migrationFile)

if (!fs.existsSync(filePath)) {
  console.error(`❌ Error: File not found: ${filePath}`)
  process.exit(1)
}

console.log('🚀 Executing migration:', migrationFile)
if (dryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made')
}
console.log('')

// Read SQL file
const sqlContent = fs.readFileSync(filePath, 'utf-8')

// Prepare payload
const payload = {
  sql: sqlContent,
  description: `Migration from ${path.basename(migrationFile)}`,
  dryRun
}

// Execute via API
const apiUrl = process.env.API_URL || 'http://localhost:3000/api/admin/execute-sql'

console.log('📡 Sending to API:', apiUrl)
console.log('')

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
  .then(async (response) => {
    const data = await response.json()

    if (data.success) {
      console.log('✅ Migration completed successfully!')
      console.log('')
      console.log(JSON.stringify(data, null, 2))
      process.exit(0)
    } else {
      console.error('❌ Migration failed!')
      console.error('')
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Error executing migration:')
    console.error(error.message)
    process.exit(1)
  })
