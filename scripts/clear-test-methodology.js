#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearTestData() {
  const projectId = '6741f266-9410-43b2-9f73-5dfe17176424';

  console.log('🗑️ Clearing test methodology data for project:', projectId);

  const { data, error } = await supabase
    .from('project_methodology')
    .delete()
    .eq('project_id', projectId)
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Cleared', data ? data.length : 0, 'methodology record(s)');
  }
}

clearTestData();
