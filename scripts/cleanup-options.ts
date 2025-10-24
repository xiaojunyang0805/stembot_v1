import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test user IDs (from analysis)
const TEST_USER_IDS = [
  '5bd4192d-5fed-451e-9ba1-7287f82d3cc3', // cache.busted
  '367ded9c-3a98-40aa-8bb5-0ebea52ae77a', // test.student.0
  '067e935a-59e8-4aa6-9598-d448627074fc', // test.student.1
  '533491c0-9617-46b6-98f6-2c274a860018', // test.student.2
  'fe8cad7e-8896-4204-9b95-e507af3c8b07', // test.student.3
  '4e5e31d1-c9aa-4384-9bc6-2dd001e63875', // test.student.4
  '43820be9-de61-41cf-90ad-560c662bb26f', // complete.test
  'de2a8134-6fcf-43aa-913f-8b1b38f0dba3', // test@university.edu
]

// Duplicate project IDs (keep oldest, delete rest)
const DUPLICATE_PROJECT_IDS = [
  '28cae453-2b69-4219-955e-e5184cb05dc6',
  '588192ed-7e02-4e25-83a7-b04365c35e3e',
  'b1af2dc0-bbaf-47bd-9182-c4e858e62985',
]
const KEEP_PROJECT_ID = 'b19324d4-11e7-456b-b4e1-9117a7ef2595' // oldest

async function option1_DeleteTestUsers() {
  console.log('=== OPTION 1: Delete Test Users ===\n')
  console.log('This will delete 8 test users and all their associated data.')
  console.log('Test users to delete:', TEST_USER_IDS)
  console.log('\n⚠️ This will CASCADE delete:')
  console.log('  - User records')
  console.log('  - Associated projects')
  console.log('  - Associated conversations')
  console.log('  - Associated documents')
  console.log('  - Associated gap analyses')
  console.log('  - Associated subscriptions')
  console.log('  - Associated preferences')

  // Check what would be deleted
  for (const userId of TEST_USER_IDS) {
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    console.log(`\n  User: ${user?.email}`)
    console.log(`    Projects: ${projectCount || 0}`)
  }

  console.log('\n✅ Ready to execute: Set EXECUTE=true to proceed')
}

async function option2_DeleteDuplicateProjects() {
  console.log('=== OPTION 2: Delete Duplicate Projects ===\n')
  console.log('This will delete 3 duplicate "Sleep patterns" projects')
  console.log(`Keep: ${KEEP_PROJECT_ID} (oldest)`)
  console.log('Delete:')
  DUPLICATE_PROJECT_IDS.forEach(id => console.log(`  - ${id}`))

  console.log('\n⚠️ This will CASCADE delete:')
  console.log('  - Project records')
  console.log('  - Associated conversations')
  console.log('  - Associated documents')
  console.log('  - Associated gap analyses')
  console.log('  - Associated paper sections')

  // Check associated data
  for (const projectId of DUPLICATE_PROJECT_IDS) {
    const { count: convCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const { count: docCount } = await supabase
      .from('project_documents')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const { count: gapCount } = await supabase
      .from('gap_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    console.log(`\n  Project: ${projectId}`)
    console.log(`    Conversations: ${convCount || 0}`)
    console.log(`    Documents: ${docCount || 0}`)
    console.log(`    Gap Analyses: ${gapCount || 0}`)
  }

  console.log('\n✅ Ready to execute: Set EXECUTE=true to proceed')
}

async function option3_FixSubscriptions() {
  console.log('=== OPTION 3: Fix Subscription Data ===\n')
  console.log('This will NOT delete subscriptions, but will report issues.')
  console.log('Manual intervention may be needed to fix Stripe data.\n')

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')

  if (subs) {
    for (const sub of subs) {
      console.log(`\nSubscription: ${sub.id}`)
      console.log(`  User: ${sub.user_id}`)
      console.log(`  Status: ${sub.status}`)
      console.log(`  Stripe Customer ID: ${sub.stripe_customer_id || '❌ MISSING'}`)
      console.log(`  Stripe Subscription ID: ${sub.stripe_subscription_id || '❌ MISSING'}`)
      console.log(`  Price ID: ${sub.stripe_price_id || '❌ MISSING'}`)

      if (sub.status === 'active' && (!sub.stripe_subscription_id || !sub.stripe_price_id)) {
        console.log('  ⚠️ Action needed: Update with proper Stripe data or set status to "incomplete"')
      }
    }
  }

  console.log('\n✅ No automatic fix available - manual review recommended')
}

async function option4_FullCleanup() {
  console.log('=== OPTION 4: Full Cleanup (Test Users + Duplicates) ===\n')
  console.log('This combines Option 1 and Option 2:\n')

  await option1_DeleteTestUsers()
  console.log('\n' + '='.repeat(60) + '\n')
  await option2_DeleteDuplicateProjects()
}

async function executeCleanup(option: string) {
  console.log(`\n\n=== EXECUTING CLEANUP: ${option} ===\n`)

  if (option === '1' || option === '4') {
    console.log('Deleting test users...')
    let deletedCount = 0
    for (const userId of TEST_USER_IDS) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.log(`  ❌ Error deleting user ${userId}: ${error.message}`)
      } else {
        deletedCount++
        console.log(`  ✅ Deleted user ${userId}`)
      }
    }
    console.log(`\n✅ Deleted ${deletedCount} test users\n`)
  }

  if (option === '2' || option === '4') {
    console.log('Deleting duplicate projects...')
    let deletedCount = 0
    for (const projectId of DUPLICATE_PROJECT_IDS) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.log(`  ❌ Error deleting project ${projectId}: ${error.message}`)
      } else {
        deletedCount++
        console.log(`  ✅ Deleted project ${projectId}`)
      }
    }
    console.log(`\n✅ Deleted ${deletedCount} duplicate projects\n`)
  }

  if (option === '3') {
    console.log('⚠️ Subscription fixes require manual intervention - no automatic cleanup available')
  }

  console.log('\n✅ Cleanup complete!')
}

// Main
const args = process.argv.slice(2)
const option = args[0]
const execute = args[1] === 'EXECUTE'

async function main() {
  if (!option || !['1', '2', '3', '4'].includes(option)) {
    console.log('=== DATABASE CLEANUP OPTIONS ===\n')
    console.log('Usage: npm run cleanup [option] [EXECUTE]\n')
    console.log('Options:')
    console.log('  1 - Delete test users (8 users)')
    console.log('  2 - Delete duplicate projects (3 projects)')
    console.log('  3 - Review subscription issues (no deletions)')
    console.log('  4 - Full cleanup (options 1 + 2)\n')
    console.log('Examples:')
    console.log('  npx tsx scripts/cleanup-options.ts 1          # Preview option 1')
    console.log('  npx tsx scripts/cleanup-options.ts 1 EXECUTE  # Execute option 1')
    console.log('  npx tsx scripts/cleanup-options.ts 4 EXECUTE  # Execute full cleanup\n')
    return
  }

  switch (option) {
    case '1':
      await option1_DeleteTestUsers()
      break
    case '2':
      await option2_DeleteDuplicateProjects()
      break
    case '3':
      await option3_FixSubscriptions()
      break
    case '4':
      await option4_FullCleanup()
      break
  }

  if (execute) {
    console.log('\n' + '='.repeat(60))
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    readline.question('\n⚠️ Are you SURE you want to execute this cleanup? (yes/no): ', async (answer: string) => {
      if (answer.toLowerCase() === 'yes') {
        await executeCleanup(option)
      } else {
        console.log('\n❌ Cleanup cancelled')
      }
      readline.close()
    })
  }
}

main().catch(console.error)
