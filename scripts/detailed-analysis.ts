import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function detailedAnalysis() {
  console.log('=== DETAILED DATABASE ANALYSIS ===\n')

  // Check users table structure
  console.log('👥 USERS TABLE ANALYSIS:')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(20)

  if (usersError) {
    console.log(`   Error: ${usersError.message}`)
  } else if (users && users.length > 0) {
    console.log(`   Total: ${users.length} users`)
    console.log(`   Columns: ${Object.keys(users[0]).join(', ')}`)
    console.log('\n   Sample users:')
    users.forEach(u => {
      console.log(`   - ID: ${u.id}`)
      console.log(`     Email: ${u.email}`)
      console.log(`     Created: ${u.created_at}`)
      console.log(`     Auth User ID: ${u.auth_user_id || 'none'}`)
      console.log(`     Data: ${JSON.stringify(u, null, 2).substring(0, 200)}...\n`)
    })
  }

  // Check subscriptions in detail
  console.log('\n💳 SUBSCRIPTIONS ANALYSIS:')
  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')

  if (subsError) {
    console.log(`   Error: ${subsError.message}`)
  } else if (subs) {
    console.log(`   Total: ${subs.length} subscriptions`)
    subs.forEach(sub => {
      console.log(`\n   Subscription ID: ${sub.id}`)
      console.log(`   User ID: ${sub.user_id}`)
      console.log(`   Status: ${sub.status}`)
      console.log(`   Stripe Customer ID: ${sub.stripe_customer_id || 'none'}`)
      console.log(`   Stripe Subscription ID: ${sub.stripe_subscription_id || 'none'}`)
      console.log(`   Price ID: ${sub.stripe_price_id || 'none'}`)
      console.log(`   Current Period End: ${sub.current_period_end || 'none'}`)
      console.log(`   Cancel At Period End: ${sub.cancel_at_period_end}`)
      console.log(`   Created: ${sub.created_at}`)
    })

    // Check for issues
    console.log('\n   🔍 Checking for subscription issues:')
    for (const sub of subs) {
      const issues = []

      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', sub.user_id)
        .single()

      if (!user) issues.push('⚠️ User does not exist (orphaned)')

      // Check if subscription has proper Stripe data
      if (sub.status === 'active' && !sub.stripe_subscription_id) {
        issues.push('⚠️ Active subscription without Stripe ID')
      }

      if (sub.status === 'active' && !sub.stripe_price_id) {
        issues.push('⚠️ Active subscription without price ID')
      }

      if (issues.length > 0) {
        console.log(`   Subscription ${sub.id}:`)
        issues.forEach(issue => console.log(`     ${issue}`))
      }
    }
  }

  // Check projects
  console.log('\n\n📁 PROJECTS ANALYSIS:')
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')

  if (projectsError) {
    console.log(`   Error: ${projectsError.message}`)
  } else if (projects) {
    console.log(`   Total: ${projects.length} projects`)

    // Group by user
    const projectsByUser = new Map<string, any[]>()
    projects.forEach(p => {
      if (!projectsByUser.has(p.user_id)) {
        projectsByUser.set(p.user_id, [])
      }
      projectsByUser.get(p.user_id)!.push(p)
    })

    console.log(`\n   Projects by user:`)
    for (const [userId, userProjects] of projectsByUser) {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()

      console.log(`\n   User: ${user?.email || 'UNKNOWN'} (${userId})`)
      console.log(`   Projects: ${userProjects.length}`)
      userProjects.forEach(p => {
        console.log(`     - ${p.title} (${p.id})`)
        console.log(`       Status: ${p.status || 'none'}`)
        console.log(`       Created: ${p.created_at}`)
      })
    }
  }

  // Check for duplicate projects
  console.log('\n\n🔍 CHECKING FOR DUPLICATE PROJECTS:')
  if (projects) {
    const titleCounts = new Map<string, any[]>()
    projects.forEach(p => {
      const key = `${p.title}-${p.user_id}`
      if (!titleCounts.has(key)) {
        titleCounts.set(key, [])
      }
      titleCounts.get(key)!.push(p)
    })

    let foundDuplicates = false
    for (const [key, projs] of titleCounts) {
      if (projs.length > 1) {
        foundDuplicates = true
        console.log(`\n   ⚠️ Duplicate projects found:`)
        console.log(`   Title: ${projs[0].title}`)
        console.log(`   User: ${projs[0].user_id}`)
        console.log(`   Duplicates:`)
        projs.forEach(p => {
          console.log(`     - ID: ${p.id}, Created: ${p.created_at}`)
        })
      }
    }
    if (!foundDuplicates) {
      console.log('   ✅ No duplicate projects found')
    }
  }

  // Check gap_analyses
  console.log('\n\n📊 GAP ANALYSES:')
  const { data: gaps, error: gapsError } = await supabase
    .from('gap_analyses')
    .select('id, project_id, created_at')

  if (gapsError) {
    console.log(`   Error: ${gapsError.message}`)
  } else if (gaps) {
    console.log(`   Total: ${gaps.length} gap analyses`)

    // Check for orphaned gap analyses
    for (const gap of gaps) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, title')
        .eq('id', gap.project_id)
        .single()

      if (!project) {
        console.log(`   ⚠️ Orphaned gap analysis: ${gap.id} (project: ${gap.project_id})`)
      }
    }
  }

  console.log('\n\n✅ Detailed analysis complete!')
}

detailedAnalysis().catch(console.error)
