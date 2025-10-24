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
  console.log('=== CHECKING DATABASE SCHEMA ===\n')

  // Get all tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name')

  if (tablesError) {
    console.error('Error fetching tables:', tablesError)
    return
  }

  console.log('📋 All Tables:')
  console.log(tables?.map(t => `  - ${t.table_name}`).join('\n'))
  console.log('\n')

  // Check each table's row count and structure
  for (const table of tables || []) {
    const tableName = table.table_name

    // Skip system tables
    if (tableName.startsWith('pg_') || tableName === 'spatial_ref_sys') {
      continue
    }

    try {
      // Get column info
      const { data: columns } = await supabase
        .rpc('get_columns', { table_name: tableName })
        .catch(() => ({ data: null }))

      // Get row count
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      console.log(`\n📊 Table: ${tableName}`)
      console.log(`   Rows: ${error ? 'ERROR' : count || 0}`)

      if (error) {
        console.log(`   Error: ${error.message}`)
      }

      // Get sample data for non-empty tables
      if (!error && count && count > 0) {
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(3)

        if (sample && sample.length > 0) {
          console.log(`   Sample columns: ${Object.keys(sample[0]).join(', ')}`)
        }
      }
    } catch (err: any) {
      console.log(`   Error checking table: ${err.message}`)
    }
  }

  console.log('\n\n=== CHECKING FOR ISSUES ===\n')

  // Check for orphaned records
  console.log('🔍 Checking for orphaned records...\n')

  // Check projects without users
  const { data: orphanedProjects } = await supabase
    .from('projects')
    .select('id, title, user_id')
    .limit(100)

  if (orphanedProjects) {
    console.log(`📁 Projects table: ${orphanedProjects.length} records`)

    // Check if user_ids exist in users table
    for (const project of orphanedProjects) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', project.user_id)
        .single()

      if (!user) {
        console.log(`   ⚠️ Orphaned project: ${project.id} (title: ${project.title}, user_id: ${project.user_id})`)
      }
    }
  }

  // Check subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(100)

  console.log(`\n💳 Subscriptions: ${subscriptions?.length || 0} records`)
  if (subscriptions && subscriptions.length > 0) {
    for (const sub of subscriptions) {
      console.log(`   - ${sub.id}: user_id=${sub.user_id}, status=${sub.status}, plan=${sub.stripe_price_id}`)
    }
  }

  // Check user_preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(100)

  console.log(`\n⚙️ User Preferences: ${prefs?.length || 0} records`)
  if (prefs && prefs.length > 0) {
    for (const pref of prefs) {
      console.log(`   - user_id=${pref.user_id}: ${JSON.stringify(pref).substring(0, 100)}...`)
    }
  }
}

checkDatabase().catch(console.error)
