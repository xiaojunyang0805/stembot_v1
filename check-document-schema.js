const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

async function checkDocumentSchema() {
  console.log('🔍 Checking project_documents table schema...');

  // Get a sample document to see all fields
  const { data: sampleDoc, error } = await supabase
    .from('project_documents')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (sampleDoc) {
    console.log('📋 Sample document structure:');
    console.log(JSON.stringify(sampleDoc, null, 2));

    console.log('\n📊 Available fields:');
    Object.keys(sampleDoc).forEach(key => {
      console.log(`  - ${key}: ${typeof sampleDoc[key]}`);
    });
  } else {
    console.log('❌ No documents found to examine schema');
  }
}

checkDocumentSchema();