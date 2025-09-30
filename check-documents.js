const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

const PROJECT_ID = 'fded6dfc-8d1c-4a7e-bd11-e4add2efc29c';

async function checkDocuments() {
  console.log('🔍 Checking documents in project:', PROJECT_ID);

  // Check ALL documents for this project (no filters)
  const { data: allDocs, error: allError } = await supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', PROJECT_ID);

  console.log('\n📊 ALL documents for project:');
  if (allError) {
    console.error('❌ Error:', allError);
  } else {
    console.log(`Found ${allDocs.length} total documents`);
    allDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.original_name}`);
      console.log(`     Status: ${doc.upload_status}`);
      console.log(`     Created: ${doc.created_at}`);
      console.log(`     Size: ${doc.file_size}`);
      console.log('');
    });
  }

  // Check with the exact same filter as duplicate detection
  const { data: completedDocs, error: completedError } = await supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', PROJECT_ID)
    .eq('upload_status', 'completed');

  console.log('\n📊 COMPLETED documents (duplicate detection filter):');
  if (completedError) {
    console.error('❌ Error:', completedError);
  } else {
    console.log(`Found ${completedDocs.length} completed documents`);
    completedDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.original_name}`);
      console.log(`     Status: ${doc.upload_status}`);
      console.log(`     Created: ${doc.created_at}`);
      console.log('');
    });
  }
}

checkDocuments();