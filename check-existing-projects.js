const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kutpbtpdgptcmrlabekq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHBidHBkZ3B0Y21ybGFiZWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MDcwNCwiZXhwIjoyMDczODQ2NzA0fQ.lMcRfuEUoY9QsTBd6MfISFmD8gqHUTdrG2RRoDlkwPU'
);

async function checkExistingProjects() {
  console.log('🔍 Checking existing projects...');

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, user_id')
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📋 Found projects:');
  projects.forEach((project, index) => {
    console.log(`  ${index + 1}. ID: ${project.id}`);
    console.log(`     Title: ${project.title}`);
    console.log(`     User: ${project.user_id}`);
    console.log('');
  });

  if (projects.length > 0) {
    console.log(`✅ Using project ID: ${projects[0].id}`);
    return projects[0];
  } else {
    console.log('❌ No projects found');
    return null;
  }
}

checkExistingProjects();