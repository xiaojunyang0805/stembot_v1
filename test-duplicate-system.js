const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

// Setup Supabase client with service role key for admin access
const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

const TEST_PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174001';

async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');

  // 1. Ensure test project exists
  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('id', TEST_PROJECT_ID)
    .single();

  if (!existingProject) {
    console.log('📋 Creating test project...');
    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        id: TEST_PROJECT_ID,
        user_id: TEST_USER_ID,
        title: 'Duplicate Detection Test Project',
        subject: 'Computer Science',
        current_phase: 'question_formation',
        research_question: 'How can we test duplicate document detection?',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (projectError) {
      console.error('❌ Failed to create project:', projectError);
      return false;
    }
    console.log('✅ Test project created');
  } else {
    console.log('✅ Test project already exists');
  }

  return true;
}

async function insertTestDocument() {
  console.log('📄 Inserting test document into database...');

  const documentData = {
    project_id: TEST_PROJECT_ID,
    user_id: TEST_USER_ID,
    filename: 'test-document.pdf',
    original_name: 'test-document.pdf',
    file_size: 1024000, // 1MB
    mime_type: 'application/pdf',
    storage_path: null,
    extracted_text: 'This is a test document for duplicate detection. It contains sample content that should be detected as a duplicate when uploaded again.',
    analysis_result: {
      summary: 'Test document for duplicate detection',
      keyPoints: ['Testing duplicate detection', 'Sample content']
    },
    upload_status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('project_documents')
    .insert(documentData)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to insert document:', error);
    return null;
  }

  console.log('✅ Test document inserted:', data.id);
  return data;
}

async function testDuplicateDetection() {
  console.log('🔍 Testing duplicate detection API...');

  // Create form data with the same file
  const formData = new FormData();
  formData.append('projectId', TEST_PROJECT_ID);
  formData.append('extractedText', 'This is a test document for duplicate detection. It contains sample content that should be detected as a duplicate when uploaded again.');

  // Create a mock file buffer
  const fileBuffer = Buffer.from('Mock PDF content for testing');
  formData.append('file', fileBuffer, {
    filename: 'test-document.pdf',
    contentType: 'application/pdf'
  });

  try {
    const response = await fetch('https://stembotv1.vercel.app/api/documents/check-duplicates', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('📊 Duplicate detection result:', result);

    if (result.success && result.isDuplicate) {
      console.log('🎯 SUCCESS: Duplicate detected!');
      console.log('   Confidence:', result.confidence + '%');
      console.log('   Matches:', result.matches.length);
      return true;
    } else {
      console.log('❌ FAILED: No duplicate detected');
      console.log('   Response:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  // Delete test documents
  await supabase
    .from('project_documents')
    .delete()
    .eq('project_id', TEST_PROJECT_ID);

  // Delete test project
  await supabase
    .from('projects')
    .delete()
    .eq('id', TEST_PROJECT_ID);

  console.log('✅ Cleanup completed');
}

async function runCompleteTest() {
  console.log('🚀 Starting comprehensive duplicate detection test...');

  try {
    // Setup
    const setupSuccess = await setupTestEnvironment();
    if (!setupSuccess) {
      console.log('❌ Setup failed, aborting test');
      return;
    }

    // Insert test document
    const document = await insertTestDocument();
    if (!document) {
      console.log('❌ Document insertion failed, aborting test');
      return;
    }

    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test duplicate detection
    const detectionSuccess = await testDuplicateDetection();

    if (detectionSuccess) {
      console.log('🎉 DUPLICATE DETECTION WORKING SUCCESSFULLY!');
    } else {
      console.log('❌ Duplicate detection test failed');
    }

    // Cleanup
    await cleanupTestData();

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await cleanupTestData();
  }
}

// Run the test
runCompleteTest();