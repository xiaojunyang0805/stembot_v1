const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

async function checkCurrentState() {
  console.log('🔍 Checking current database state...');

  const projectId = '314b3a6f-5520-40a6-8e31-ca56aa2b3c88';

  const { data: currentDocs, error } = await supabaseAdmin
    .from('project_documents')
    .select('id, original_name, created_at, updated_at')
    .eq('project_id', projectId)
    .order('created_at');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Current database state: ${currentDocs.length} documents`);
  currentDocs.forEach((doc, index) => {
    console.log(`  ${index + 1}. ${doc.original_name}`);
    console.log(`     ID: ${doc.id}`);
    console.log(`     Created: ${doc.created_at}`);
    console.log(`     Updated: ${doc.updated_at}`);
    console.log('');
  });

  if (currentDocs.length === 1) {
    console.log('✅ SUCCESS: Only 1 document remains - fix worked!');
    console.log('📝 User screenshot might be from before fix deployment or cached');
  } else if (currentDocs.length > 1) {
    console.log('❌ ISSUE: Multiple documents still exist');
    console.log('💡 This suggests either:');
    console.log('   1. User uploaded another duplicate after our fix');
    console.log('   2. There\'s a race condition in the replacement logic');
    console.log('   3. UI caching issue showing stale data');
  }

  // Check if there are any recent uploads after our fix
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentDocs = currentDocs.filter(doc => new Date(doc.created_at) > hourAgo);
  if (recentDocs.length > 0) {
    console.log(`\n⏰ Found ${recentDocs.length} documents uploaded in the last hour:`);
    recentDocs.forEach(doc => {
      console.log(`   - ${doc.original_name} at ${doc.created_at}`);
    });
  }
}

checkCurrentState();