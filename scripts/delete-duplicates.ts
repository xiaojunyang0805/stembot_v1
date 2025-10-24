import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Duplicate project IDs (keep oldest, delete rest)
const DUPLICATE_PROJECT_IDS = [
  '28cae453-2b69-4219-955e-e5184cb05dc6',
  '588192ed-7e02-4e25-83a7-b04365c35e3e',
  'b1af2dc0-bbaf-47bd-9182-c4e858e62985',
]
const KEEP_PROJECT_ID = 'b19324d4-11e7-456b-b4e1-9117a7ef2595' // oldest

async function deleteDuplicates() {
  console.log('=== DELETING DUPLICATE PROJECTS ===\n')
  console.log(`Keeping: ${KEEP_PROJECT_ID} (oldest)`)
  console.log(`Deleting: ${DUPLICATE_PROJECT_IDS.length} duplicates\n`)

  let successCount = 0
  let errorCount = 0

  for (const projectId of DUPLICATE_PROJECT_IDS) {
    console.log(`Deleting project: ${projectId}...`)

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.log(`  ❌ Error: ${error.message}`)
      errorCount++
    } else {
      console.log(`  ✅ Deleted successfully`)
      successCount++
    }
  }

  console.log('\n=== CLEANUP SUMMARY ===')
  console.log(`✅ Successfully deleted: ${successCount} projects`)
  console.log(`❌ Errors: ${errorCount}`)

  // Verify remaining projects
  console.log('\n=== VERIFICATION ===')
  const { data: projects, error: verifyError } = await supabase
    .from('projects')
    .select('id, title, user_id, created_at')
    .eq('user_id', 'b7efa8ad-db3c-463a-a64a-7c079fa0cada') // User with duplicates

  if (verifyError) {
    console.log(`❌ Verification error: ${verifyError.message}`)
  } else if (projects) {
    console.log(`\nRemaining projects for user 601404242@qq.com:`)
    projects.forEach(p => {
      console.log(`  - ${p.title}`)
      console.log(`    ID: ${p.id}`)
      console.log(`    Created: ${p.created_at}`)
    })
  }

  console.log('\n✅ Cleanup complete!')
}

deleteDuplicates().catch(console.error)
