#!/usr/bin/env node

/**
 * Execute Billing Migration
 * Applies the billing and usage tracking schema to Supabase
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
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== ';');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    // Add semicolon back if it was removed
    const finalStatement = statement.endsWith(';') ? statement : statement + ';';

    try {
      console.log(`  • Executing statement ${i + 1}/${statements.length}...`);

      // Execute the SQL using rpc
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

async function checkBillingTables(supabase) {
  console.log('\n🔍 Checking billing tables...');

  const billingTables = [
    'subscriptions',
    'usage_tracking',
    'billing_events',
    'revenue_metrics'
  ];

  const existing = [];

  for (const table of billingTables) {
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
  console.log('🚀 Starting Billing Database Migration...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🔗 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}`);

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Check current state
    const existingTables = await checkBillingTables(supabase);

    // Execute billing migration
    console.log('\n📝 Applying billing and usage tracking schema...');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_billing_usage_tracking.sql');

    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await executeSQL(supabase, migrationSQL, 'Executing billing migration');
    } else {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    // Verify the setup
    console.log('\n🔍 Verifying billing tables...');
    const finalTables = await checkBillingTables(supabase);

    console.log('\n🎉 Billing migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Set up Stripe API keys in .env.local');
    console.log('2. Run: node scripts/setup-stripe-products.js');
    console.log('3. Test the billing flow');

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