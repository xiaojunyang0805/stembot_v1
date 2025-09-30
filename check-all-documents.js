const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

async function checkAllDocuments() {
  console.log('🔍 Checking ALL documents in database...');

  const { data: allDocs, error } = await supabase
    .from('project_documents')
    .select('*')
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Found ${allDocs.length} total documents in database`);

  if (allDocs.length === 0) {
    console.log('❌ NO DOCUMENTS FOUND IN DATABASE!');
    console.log('   This explains why duplicate detection never works.');
    console.log('   The UI upload process is not saving documents to the database.');
  } else {
    allDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Project: ${doc.project_id}`);
      console.log(`     File: ${doc.original_name}`);
      console.log(`     Status: ${doc.upload_status}`);
      console.log(`     User: ${doc.user_id}`);
      console.log(`     Created: ${doc.created_at}`);
      console.log('');
    });
  }
}

checkAllDocuments();