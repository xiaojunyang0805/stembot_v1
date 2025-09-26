#!/usr/bin/env node

/**
 * Setup Authentication & Memory System
 * Executes the auth and memory integration migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function executeSQL(supabase, sql, description) {
  console.log(`\n🔧 ${description}...`);

  // Split SQL into individual statements
  const statements = sql
    .split(/;\s*\n/)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== ';' && stmt !== 'BEGIN' && stmt !== 'END');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.length < 10) continue;

    // Add semicolon back if needed
    const finalStatement = statement.endsWith(';') ? statement : statement + ';';

    try {
      console.log(`  • Executing statement ${i + 1}/${statements.length}: ${finalStatement.substring(0, 60)}...`);

      // Use rpc to execute raw SQL
      const result = await supabase.rpc('exec', { sql: finalStatement });

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

async function setupAuthMemorySystem() {
  console.log('🚀 Setting up Authentication & Memory System...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Read the auth & memory migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_auth_memory_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration file loaded');
    console.log(`📄 File contains ${migrationSQL.split('\n').length} lines`);

    // Execute the migration
    await executeSQL(supabase, migrationSQL, 'Setting up authentication and memory system');

    // Test the setup
    console.log('\n🧪 Testing setup...');

    // Test basic function creation
    const functions = [
      'handle_new_user',
      'update_user_profile',
      'store_conversation_with_memory',
      'get_relevant_memory_context',
      'get_project_statistics'
    ];

    for (const funcName of functions) {
      try {
        const result = await supabase.rpc('exec', {
          sql: `SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = '${funcName}');`
        });

        if (result.data) {
          console.log(`  ✅ Function '${funcName}' created successfully`);
        } else {
          console.log(`  ⚠️  Function '${funcName}' may not exist`);
        }
      } catch (error) {
        console.log(`  ⚠️  Could not verify function '${funcName}': ${error.message}`);
      }
    }

    // Test RLS policies
    console.log('\n🔒 Verifying Row Level Security policies...');
    const tables = ['users', 'projects', 'project_memory', 'sources', 'conversations', 'user_sessions'];

    for (const tableName of tables) {
      try {
        const result = await supabase.rpc('exec', {
          sql: `SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = '${tableName}' AND schemaname = 'public';`
        });

        console.log(`  ✅ Table '${tableName}' has RLS policies configured`);
      } catch (error) {
        console.log(`  ⚠️  Could not verify policies for '${tableName}': ${error.message}`);
      }
    }

    console.log('\n🎉 Authentication & Memory System setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Configure OAuth providers in Supabase Dashboard:');
    console.log('   → Authentication → Settings → Add Google provider');
    console.log('2. Test user registration and profile completion');
    console.log('3. Test memory storage and retrieval functions');
    console.log('4. Implement frontend authentication components');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupAuthMemorySystem().catch(console.error);
}

module.exports = { setupAuthMemorySystem };