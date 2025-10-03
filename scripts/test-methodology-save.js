#!/usr/bin/env node

/**
 * Test methodology save functionality directly
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
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS
);

const projectId = '6741f266-9410-43b2-9f73-5dfe17176424';

async function testSave() {
  console.log('🧪 Testing methodology save functionality...\n');

  // Step 1: Check if project exists (with service role, bypassing RLS)
  console.log('1️⃣ Checking if project exists...');
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, user_id')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError) {
    console.error('❌ Error checking project:', projectError);
    return;
  }

  if (!project) {
    console.error('❌ Project not found:', projectId);
    return;
  }

  console.log('✅ Project found:', project.title);
  console.log('   User ID:', project.user_id);
  console.log('');

  // Step 2: Try to save methodology
  console.log('2️⃣ Attempting to save methodology...');
  const methodologyData = {
    project_id: projectId,
    method_type: 'experimental_study',
    method_name: 'Experimental Study',
    reasoning: 'Test methodology save',
    independent_variables: [],
    dependent_variables: [],
    control_variables: []
  };

  const { data: saved, error: saveError } = await supabase
    .from('project_methodology')
    .insert(methodologyData)
    .select()
    .single();

  if (saveError) {
    console.error('❌ Error saving methodology:', saveError);
    console.error('   Code:', saveError.code);
    console.error('   Message:', saveError.message);
    console.error('   Details:', saveError.details);
    console.error('   Hint:', saveError.hint);
    return;
  }

  console.log('✅ Methodology saved successfully!');
  console.log('   ID:', saved.id);
  console.log('');

  // Step 3: Verify it was saved
  console.log('3️⃣ Verifying saved data...');
  const { data: verified, error: verifyError } = await supabase
    .from('project_methodology')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
    return;
  }

  console.log('✅ Verified successfully!');
  console.log('   Method:', verified.method_name);
  console.log('   Created:', verified.created_at);
  console.log('');

  console.log('🎉 All tests passed! Methodology save is working correctly.');
}

testSave();
