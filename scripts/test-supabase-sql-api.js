/**
 * Test Supabase Management API for SQL execution
 * Using service_role_key with REST API
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function testSQLExecution() {
  console.log('🧪 Testing Supabase SQL Execution Methods...\n');

  // Read the migration file
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251007200000_create_paper_sections.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 Migration file loaded:', sqlPath);
  console.log('📏 SQL length:', sql.length, 'characters\n');

  // Method 1: Try using PostgREST /rpc endpoint
  console.log('Method 1: Testing PostgREST /rpc endpoint...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data.substring(0, 200));

    if (response.ok) {
      console.log('✅ Method 1 WORKS: PostgREST /rpc endpoint\n');
      return 'method1';
    } else {
      console.log('❌ Method 1 failed:', data.substring(0, 200), '\n');
    }
  } catch (error) {
    console.log('❌ Method 1 error:', error.message, '\n');
  }

  // Method 2: Try using pg-meta API (if available)
  console.log('Method 2: Testing pg-meta API...');
  try {
    const response = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data.substring(0, 200));

    if (response.ok) {
      console.log('✅ Method 2 WORKS: pg-meta API\n');
      return 'method2';
    } else {
      console.log('❌ Method 2 failed:', data.substring(0, 200), '\n');
    }
  } catch (error) {
    console.log('❌ Method 2 error:', error.message, '\n');
  }

  // Method 3: Split SQL into statements and use raw query
  console.log('Method 3: Testing statement-by-statement execution...');
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log('📋 Found', statements.length, 'SQL statements\n');

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}:`, statement.substring(0, 60) + '...');

      // Try using query endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: statement })
      });

      const data = await response.text();

      if (response.ok) {
        console.log('  ✓ Success');
        successCount++;
      } else {
        console.log('  ✗ Failed:', data.substring(0, 100));
      }
    }

    if (successCount > 0) {
      console.log(`\n✅ Method 3 partially works: ${successCount}/${statements.length} statements executed\n`);
      return 'method3';
    } else {
      console.log('\n❌ Method 3 failed: No statements executed\n');
    }
  } catch (error) {
    console.log('❌ Method 3 error:', error.message, '\n');
  }

  // Method 4: Use Supabase Management API (if project ref available)
  console.log('Method 4: Testing Supabase Management API...');
  try {
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    if (!projectRef) {
      console.log('❌ Could not extract project ref from URL\n');
    } else {
      console.log('Project ref:', projectRef);

      const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });

      const data = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', data.substring(0, 200));

      if (response.ok) {
        console.log('✅ Method 4 WORKS: Management API\n');
        return 'method4';
      } else {
        console.log('❌ Method 4 failed:', data.substring(0, 200), '\n');
      }
    }
  } catch (error) {
    console.log('❌ Method 4 error:', error.message, '\n');
  }

  console.log('❌ All methods failed. Manual SQL Editor is required.\n');
  return null;
}

async function applyMigrationWithWorkingMethod(method) {
  console.log(`\n🚀 Applying migration using ${method}...\n`);

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251007200000_create_paper_sections.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  if (method === 'method1') {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('✅ Migration applied successfully!');
      return true;
    }
  }

  // Add other methods as needed...

  return false;
}

// Run test
testSQLExecution()
  .then(async (workingMethod) => {
    if (workingMethod) {
      console.log('✅ Found working method:', workingMethod);
      console.log('\n📋 Would you like to apply the migration? (This is a dry run)\n');

      // In production, you would call:
      // await applyMigrationWithWorkingMethod(workingMethod);
    } else {
      console.log('❌ No working method found.');
      console.log('\n📌 Recommended: Use manual SQL Editor');
      console.log('URL: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
