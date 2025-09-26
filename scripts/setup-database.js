#!/usr/bin/env node

/**
 * StemBot Database Setup Script
 * Executes the Supabase migration using MCP database connection
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Starting StemBot Database Setup...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    process.exit(1);
  }

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_research_database.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Reading migration SQL file...');
    console.log('📄 Migration file contains', migrationSQL.split('\n').length, 'lines');

    console.log('\n⚠️  Manual Migration Required:');
    console.log('Due to Supabase security restrictions, the migration needs to be executed manually.');
    console.log('\nPlease follow these steps:');
    console.log('1. Open the Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to your project: ' + supabaseUrl.replace('https://', '').split('.')[0]);
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the contents of: supabase/migrations/001_create_research_database.sql');
    console.log('5. Click "Run" to execute the migration');
    console.log('6. Return here and run: npm run db:verify');

    console.log('\n📋 Alternatively, you can use the Supabase CLI:');
    console.log('1. Install Supabase CLI: npm install -g supabase');
    console.log('2. Login: supabase login');
    console.log('3. Link project: supabase link --project-ref ' + supabaseUrl.replace('https://', '').split('.')[0]);
    console.log('4. Push migration: supabase db push');

    // Create a verification script
    await createVerificationScript();

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function createVerificationScript() {
  const verifyScript = `#!/usr/bin/env node

/**
 * Database Verification Script
 * Verifies that the Supabase database has been set up correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyDatabase() {
  console.log('🔍 Verifying StemBot Database Setup...\\n');

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
        console.error(\`❌ Table '\${table}' not accessible:\`, error.message);
        allTablesExist = false;
      } else {
        console.log(\`✅ Table '\${table}' is accessible\`);
      }
    } catch (err) {
      console.error(\`❌ Error checking table '\${table}':\`, err.message);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    console.log('\\n🎉 Database verification successful!');
    console.log('\\nNext steps:');
    console.log('1. Run: npm run db:generate-types');
    console.log('2. Update your application to use the new database schema');
    console.log('3. Test authentication and data operations');
  } else {
    console.log('\\n❌ Database verification failed!');
    console.log('Please ensure you have executed the migration SQL in the Supabase dashboard.');
    process.exit(1);
  }
}

if (require.main === module) {
  verifyDatabase().catch(console.error);
}

module.exports = { verifyDatabase };
`;

  const verifyScriptPath = path.join(__dirname, 'verify-database.js');
  fs.writeFileSync(verifyScriptPath, verifyScript);
  console.log('\n✅ Created verification script at:', verifyScriptPath);
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };