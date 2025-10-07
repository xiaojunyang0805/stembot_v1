/**
 * Apply migration using Supabase client library with service role key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function applyMigration() {
  console.log('🚀 Applying paper_sections migration...\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read migration file
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251007200000_create_paper_sections.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 Migration SQL loaded');
  console.log('📏 Length:', sql.length, 'characters\n');

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log('📋 Found', statements.length, 'SQL statements\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 80).replace(/\n/g, ' ');
    console.log(`\n[${i + 1}/${statements.length}] ${preview}...`);

    try {
      // Try using raw query via supabase-js
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.log('❌ Error:', error.message);

        // Check if it's a "already exists" error (these are OK)
        if (error.message.includes('already exists') ||
            error.message.includes('PGRST202')) {
          console.log('ℹ️  Note: This might be expected if table/policy already exists');
        }
        errorCount++;
      } else {
        console.log('✅ Success');
        successCount++;
      }
    } catch (err) {
      console.log('❌ Exception:', err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Results:');
  console.log('  ✅ Success:', successCount);
  console.log('  ❌ Errors:', errorCount);
  console.log('='.repeat(60));

  if (errorCount === statements.length) {
    console.log('\n❌ All statements failed.');
    console.log('This is expected - Supabase client library does not support raw SQL execution.');
    console.log('\n📌 Solution: Use Supabase SQL Editor (Manual)');
    console.log('URL: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new');
    console.log('\nSteps:');
    console.log('1. Open the URL above');
    console.log('2. Copy contents from:', sqlPath);
    console.log('3. Paste and click "Run"');
    console.log('4. Ignore "already exists" errors - they are safe');
    return false;
  }

  // Verify table was created
  console.log('\n🔍 Verifying table creation...');
  const { data: tables, error: verifyError } = await supabase
    .from('paper_sections')
    .select('*')
    .limit(0);

  if (!verifyError) {
    console.log('✅ Table paper_sections exists and is accessible!');
    return true;
  } else {
    console.log('⚠️  Could not verify table:', verifyError.message);
    return false;
  }
}

applyMigration()
  .then(success => {
    if (success) {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Migration needs manual application');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
