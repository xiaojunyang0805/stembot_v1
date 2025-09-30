const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

// Import fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Use service role key for direct database access
const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

// Use a UUID that might exist (or any string for testing)
const TEST_PROJECT_ID = 'fded6dfc-8d1c-4a7e-bd11-e4add2efc29c'; // Existing project

async function insertTestDocument() {
  console.log('📄 Inserting test document directly...');

  const { data, error } = await supabase
    .from('project_documents')
    .insert({
      project_id: TEST_PROJECT_ID,
      user_id: '1c69a921-1303-404d-b974-9bd1f2ab02a2', // Existing user
      filename: 'exact-match-test.pdf',
      original_name: 'exact-match-test.pdf',
      file_size: 500000,
      mime_type: 'application/pdf',
      extracted_text: 'Exact duplicate test content for matching.',
      analysis_result: { test: true },
      upload_status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Insert error:', error);
    return null;
  }

  console.log('✅ Document inserted with ID:', data.id);
  return data;
}

async function testDuplicateAPI() {
  console.log('🔍 Testing duplicate detection API...');

  const formData = new FormData();
  formData.append('projectId', TEST_PROJECT_ID);
  formData.append('extractedText', 'Exact duplicate test content for matching.');

  // Create a simple buffer to simulate file upload with exact same size
  const fileBuffer = Buffer.alloc(500000, 'X'); // Same size as database entry
  formData.append('file', fileBuffer, {
    filename: 'exact-match-test.pdf', // Exact same filename
    contentType: 'application/pdf'
  });

  try {
    const response = await fetch('https://stembotv1.vercel.app/api/documents/check-duplicates', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('📊 API Response:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('❌ API call failed:', error);
    return null;
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up...');
  await supabase
    .from('project_documents')
    .delete()
    .eq('project_id', TEST_PROJECT_ID);
}

async function runTest() {
  console.log('🚀 Running simplified duplicate detection test...');

  try {
    // Insert test document
    const doc = await insertTestDocument();
    if (!doc) return;

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test duplicate detection
    const result = await testDuplicateAPI();

    if (result && result.success) {
      if (result.isDuplicate) {
        console.log('🎉 SUCCESS: Duplicate detected!');
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Matches: ${result.matches?.length || 0}`);
      } else {
        console.log('❌ ISSUE: No duplicate detected when one should exist');
        console.log('   This suggests the duplicate detection logic needs debugging');
      }
    } else {
      console.log('❌ API call failed or returned error');
    }

  } finally {
    await cleanup();
  }
}

runTest();