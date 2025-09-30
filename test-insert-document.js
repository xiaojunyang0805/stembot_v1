const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

async function insertTestDocument() {
  const documentData = {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174000', // dummy user ID
    filename: 'test-document.txt',
    original_name: 'test-document.txt',
    file_size: 196,
    mime_type: 'text/plain',
    storage_path: null,
    extracted_text: 'This is a test document for duplicate detection.\n\nContent:\n- Testing duplicate detection functionality\n- Sample research paper content\n- Lorem ipsum dolor sit amet consectetur adipiscing elit',
    analysis_result: {},
    upload_status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('project_documents')
    .insert(documentData)
    .select();

  if (error) {
    console.error('Error inserting document:', error);
  } else {
    console.log('Document inserted successfully:', data);
  }
}

insertTestDocument();