import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDatabase() {
  console.log('=== CHECKING SUPABASE DATABASE ===\n')

  // List of expected tables based on migrations
  const expectedTables = [
    'users',
    'projects',
    'conversations',
    'project_documents',
    'gap_analyses',
    'source_organizations',
    'credibility_assessments',
    'paper_outlines',
    'paper_sections',
    'subscriptions',
    'user_preferences'
  ]

  console.log('📋 Checking tables:\n')

  for (const tableName of expectedTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${tableName}: ERROR - ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: ${count || 0} rows`)

        // Get sample data for non-empty tables
        if (count && count > 0) {
          const { data, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3)

          if (!sampleError && data && data.length > 0) {
            console.log(`   Sample: ${JSON.stringify(data[0], null, 2).substring(0, 150)}...`)
          }
        }
      }
    } catch (err: any) {
      console.log(`❌ ${tableName}: ${err.message}`)
    }
  }

  console.log('\n\n=== DATA CONSISTENCY CHECKS ===\n')

  // Check users
  console.log('👥 Users:')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, full_name, created_at')
    .limit(20)

  if (usersError) {
    console.log(`   Error: ${usersError.message}`)
  } else if (users) {
    console.log(`   Total: ${users.length} users`)
    users.forEach(u => {
      console.log(`   - ${u.id}: ${u.email} (${u.full_name || 'no name'})`)
    })
  }

  // Check projects
  console.log('\n📁 Projects:')
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, user_id, created_at')
    .limit(20)

  if (projectsError) {
    console.log(`   Error: ${projectsError.message}`)
  } else if (projects) {
    console.log(`   Total: ${projects.length} projects`)

    // Check for orphaned projects
    for (const project of projects) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', project.user_id)
        .single()

      const status = user ? '✅' : '⚠️ ORPHANED'
      console.log(`   ${status} ${project.id}: "${project.title}" (user: ${project.user_id})`)
    }
  }

  // Check subscriptions
  console.log('\n💳 Subscriptions:')
  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(20)

  if (subsError) {
    console.log(`   Error: ${subsError.message}`)
  } else if (subs) {
    console.log(`   Total: ${subs.length} subscriptions`)
    subs.forEach(sub => {
      console.log(`   - User ${sub.user_id}: ${sub.status} (plan: ${sub.stripe_price_id || 'none'})`)
    })

    // Check for orphaned subscriptions
    for (const sub of subs) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', sub.user_id)
        .single()

      if (!user) {
        console.log(`   ⚠️ ORPHANED SUBSCRIPTION: ${sub.id} (user_id: ${sub.user_id})`)
      }
    }
  }

  // Check user_preferences
  console.log('\n⚙️ User Preferences:')
  const { data: prefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(20)

  if (prefsError) {
    console.log(`   Error: ${prefsError.message}`)
  } else if (prefs) {
    console.log(`   Total: ${prefs.length} preferences`)
    prefs.forEach(pref => {
      console.log(`   - User ${pref.user_id}: ${JSON.stringify(pref).substring(0, 100)}`)
    })

    // Check for orphaned preferences
    for (const pref of prefs) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', pref.user_id)
        .single()

      if (!user) {
        console.log(`   ⚠️ ORPHANED PREFERENCE: ${pref.id} (user_id: ${pref.user_id})`)
      }
    }
  }

  console.log('\n✅ Database check complete!')
}

checkDatabase().catch(console.error)
