#!/usr/bin/env node

/**
 * Verify that project_methodology table exists in Supabase
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyMigration() {
  console.log('🔍 Verifying project_methodology table...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('project_methodology')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('404')) {
        console.log('❌ Table does NOT exist');
        console.log('   Error:', error.message);
        console.log('');
        console.log('📋 Next step: Run the migration in Supabase SQL Editor');
        console.log('   node scripts/open-migration-in-supabase.js');
        process.exit(1);
      } else {
        console.log('⚠️ Unexpected error:', error);
        process.exit(1);
      }
    }

    console.log('✅ Table EXISTS!');
    console.log('   Rows found:', data ? data.length : 0);
    console.log('');

    // Get table info using raw SQL query
    const { data: tableInfo, error: infoError } = await supabase.rpc('exec', {
      query: `
        SELECT
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_name = 'project_methodology'
        ORDER BY ordinal_position;
      `
    });

    if (!infoError && tableInfo) {
      console.log('📊 Table Structure:');
      console.table(tableInfo);
    }

    // Check RLS policies
    const { data: policies, error: policyError } = await supabase.rpc('exec', {
      query: `
        SELECT policyname, cmd, qual
        FROM pg_policies
        WHERE tablename = 'project_methodology';
      `
    });

    if (!policyError && policies && policies.length > 0) {
      console.log('🔐 RLS Policies:');
      policies.forEach(p => console.log(`   - ${p.policyname} (${p.cmd})`));
      console.log('');
    }

    console.log('🎉 Migration verified successfully!');
    console.log('');
    console.log('Next: Test methodology save functionality on:');
    console.log('https://stembotv1.vercel.app/projects/[PROJECT_ID]/methodology');

  } catch (err) {
    console.error('💥 Error:', err.message);
    process.exit(1);
  }
}

verifyMigration();
