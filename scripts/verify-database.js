#!/usr/bin/env node

/**
 * Database Verification Script
 * Verifies that the Supabase database has been set up correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyDatabase() {
  console.log('🔍 Verifying StemBot Database Setup...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const tables = ['users', 'projects', 'project_memory', 'sources', 'conversations', 'user_sessions'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Table '${table}' not accessible:`, error.message);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' is accessible`);
      }
    } catch (err) {
      console.error(`❌ Error checking table '${table}':`, err.message);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    console.log('\n🎉 Database verification successful!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run db:generate-types');
    console.log('2. Update your application to use the new database schema');
    console.log('3. Test authentication and data operations');
  } else {
    console.log('\n❌ Database verification failed!');
    console.log('Please ensure you have executed the migration SQL in the Supabase dashboard.');
    process.exit(1);
  }
}

if (require.main === module) {
  verifyDatabase().catch(console.error);
}

module.exports = { verifyDatabase };
