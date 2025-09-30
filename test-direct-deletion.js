const { createClient } = require('@supabase/supabase-js');

// Use service role key to test deletion directly
const supabaseAdmin = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

async function testDirectDeletion() {
  console.log('🧪 Testing direct deletion of duplicate documents...');

  const projectId = '314b3a6f-5520-40a6-8e31-ca56aa2b3c88';

  // First, check current state
  const { data: beforeDocs, error: beforeError } = await supabaseAdmin
    .from('project_documents')
    .select('id, original_name, user_id')
    .eq('project_id', projectId)
    .order('created_at');

  if (beforeError) {
    console.error('❌ Error fetching documents:', beforeError);
    return;
  }

  console.log(`📊 Current state: ${beforeDocs.length} documents`);
  beforeDocs.forEach((doc, index) => {
    console.log(`  ${index + 1}. ${doc.original_name}`);
    console.log(`     ID: ${doc.id}`);
    console.log(`     User: ${doc.user_id}`);
  });

  if (beforeDocs.length < 2) {
    console.log('❌ Less than 2 documents found - cannot test deletion');
    return;
  }

  // Try to delete the first duplicate document
  const docToDelete = beforeDocs[0];
  console.log(`\n🗑️ Attempting to delete document: ${docToDelete.id}`);

  const { error: deleteError } = await supabaseAdmin
    .from('project_documents')
    .delete()
    .eq('id', docToDelete.id);

  if (deleteError) {
    console.error('❌ Deletion failed:', deleteError);
  } else {
    console.log('✅ Deletion successful!');
  }

  // Check state after deletion
  const { data: afterDocs, error: afterError } = await supabaseAdmin
    .from('project_documents')
    .select('id, original_name')
    .eq('project_id', projectId)
    .order('created_at');

  if (afterError) {
    console.error('❌ Error fetching documents after deletion:', afterError);
  } else {
    console.log(`\n📊 After deletion: ${afterDocs.length} documents`);
    afterDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.original_name} (${doc.id})`);
    });

    if (afterDocs.length === beforeDocs.length - 1) {
      console.log('🎉 SUCCESS: Deletion worked - 1 document removed');
    } else {
      console.log('❌ FAILURE: Document count unchanged');
    }
  }
}

testDirectDeletion();