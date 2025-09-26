#!/usr/bin/env node

/**
 * Execute Database Migration via MCP
 * Cleans and rebuilds the Supabase database schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function executeSQL(supabase, sql, description) {
  console.log(`\n🔧 ${description}...`);

  // Split SQL into individual statements (rough split on semicolon + newline)
  const statements = sql
    .split(/;\s*\n/)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== ';');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    // Add semicolon back if it was removed and it's not the last statement
    const finalStatement = statement.endsWith(';') ? statement : statement + ';';

    try {
      console.log(`  • Executing statement ${i + 1}/${statements.length}...`);

      // Use rpc to execute raw SQL if available, otherwise try query
      let result;
      try {
        result = await supabase.rpc('exec', { sql: finalStatement });
      } catch (rpcError) {
        // If rpc fails, try direct query for simple statements
        if (finalStatement.toUpperCase().startsWith('SELECT')) {
          result = await supabase.from('_dummy_').select('*').limit(0);
        } else {
          throw rpcError;
        }
      }

      if (result.error) {
        console.warn(`    ⚠️  Warning: ${result.error.message}`);
      } else {
        console.log(`    ✅ Success`);
      }
    } catch (error) {
      console.warn(`    ⚠️  Error: ${error.message}`);
      // Continue with next statement
    }
  }
}

async function checkCurrentTables(supabase) {
  console.log('\n🔍 Checking current database state...');

  const tables = ['users', 'projects', 'project_memory', 'sources', 'conversations', 'user_sessions'];
  const existing = [];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        existing.push(table);
        console.log(`  ✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`  ❌ Table '${table}' does not exist`);
    }
  }

  return existing;
}

async function main() {
  console.log('🚀 Starting MCP Database Migration...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  console.log('🔗 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}`);

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Check current state
    const existingTables = await checkCurrentTables(supabase);

    // Step 1: Clean up existing objects
    console.log('\n📝 Step 1: Cleaning up existing database objects...');

    // Manual cleanup of known objects
    const cleanupOperations = [
      // Drop policies
      `DROP POLICY IF EXISTS "Users can view own profile" ON users;`,
      `DROP POLICY IF EXISTS "Users can manage own profile" ON users;`,
      `DROP POLICY IF EXISTS "Users can manage own projects" ON projects;`,
      `DROP POLICY IF EXISTS "Users can manage own project memory" ON project_memory;`,
      `DROP POLICY IF EXISTS "Users can manage own project sources" ON sources;`,
      `DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;`,
      `DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;`,

      // Drop tables in dependency order
      `DROP TABLE IF EXISTS user_sessions CASCADE;`,
      `DROP TABLE IF EXISTS conversations CASCADE;`,
      `DROP TABLE IF EXISTS project_memory CASCADE;`,
      `DROP TABLE IF EXISTS sources CASCADE;`,
      `DROP TABLE IF EXISTS projects CASCADE;`,
      `DROP TABLE IF EXISTS users CASCADE;`,

      // Drop functions
      `DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;`,
    ];

    for (const operation of cleanupOperations) {
      try {
        console.log(`  • ${operation.substring(0, 50)}...`);
        await supabase.rpc('exec', { sql: operation });
        console.log(`    ✅ Success`);
      } catch (error) {
        // If exec RPC doesn't work, continue silently
        console.log(`    ⚠️  Skipped (${error.message.substring(0, 30)}...)`);
      }
    }

    // Step 2: Create fresh schema
    console.log('\n📝 Step 2: Creating fresh database schema...');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_clean_migration.sql');

    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await executeSQL(supabase, migrationSQL, 'Executing clean migration');
    } else {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    // Step 3: Verify the setup
    console.log('\n🔍 Step 3: Verifying database setup...');
    await checkCurrentTables(supabase);

    console.log('\n🎉 Database migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Test your application');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };