# 🗄️ Supabase Migration Instructions

## ❌ **Why Automated Migration Failed**

**Root Cause:** Supabase doesn't provide RPC functions for executing raw DDL statements via their client libraries for security reasons.

**What We Tried:**
1. ✅ Created automated scripts (`run-all-migrations.js`)
2. ✅ Environment variables loaded correctly
3. ✅ Supabase CLI installed (v2.48.3)
4. ❌ Direct PostgreSQL connection requires exact connection string from Supabase dashboard
5. ❌ `public.exec()` RPC function doesn't exist (by design)

## ✅ **RECOMMENDED: Manual Migration via Supabase Dashboard**

This is the **fastest and most reliable** method:

### **Step-by-Step:**

1. **Go to Supabase SQL Editor:**
   - Navigate to: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new

2. **Copy Migration Content:**
   - Open: `supabase/migrations/001_create_research_database.sql`
   - Copy entire contents

3. **Paste and Run:**
   - Paste into SQL Editor
   - Click "Run" button
   - Check for success messages

4. **Repeat for All 16 Migrations in Order:**
   ```
   001_create_research_database.sql
   002_fix_user_registration.sql
   003_fix_user_trigger.sql
   004_disable_trigger_test.sql
   005_fix_user_trigger_final.sql
   006_remove_trigger_test.sql
   007_diagnose_users_table.sql
   008_custom_auth_schema.sql
   009_remove_auth_constraint.sql
   20250101_create_credibility_assessments.sql
   20250101130000_create_gap_analyses.sql
   20250101140000_create_source_organizations.sql
   20250101150000_create_cross_phase_tables.sql
   20250929105340_add_conversations_table.sql
   20250929140000_add_project_documents_table.sql
   20251003_create_project_methodology.sql
   ```

5. **Handle "Already Exists" Errors:**
   - If you see errors like "relation already exists" → **This is OK, skip to next migration**
   - Only worry about other types of errors

## 🔧 **ALTERNATIVE: Supabase CLI Method**

If you have direct database access, use:

```bash
# Get your connection string from Supabase dashboard first:
# Settings → Database → Connection String (Direct)

npx supabase db push --db-url "YOUR_DIRECT_CONNECTION_STRING_HERE"
```

**⚠️ Note:** You need to replace with actual connection string from your Supabase project settings.

## 📊 **What Each Migration Does**

| Migration | Purpose |
|-----------|---------|
| 001 | Creates core research database tables |
| 002-009 | User registration and authentication fixes (test iterations) |
| 20250101_credibility | Adds credibility assessment features |
| 20250101130000 | Creates gap analysis tables |
| 20250101140000 | Adds source organization tracking |
| 20250101150000 | Cross-phase research tables |
| 20250929105340 | Conversation tracking table |
| 20250929140000 | Project documents storage |
| 20251003 | Project methodology table (latest) |

## ✅ **Verification After Migration**

Run this query in SQL Editor to verify tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables should include:
- `project_methodology`
- `projects`
- `conversations`
- `project_documents`
- `gap_analyses`
- `source_organizations`
- And others from migrations

## 🎯 **Summary for User**

**Difficulties Encountered:**
1. Supabase security model prevents automated SQL execution via client libraries
2. Connection string format requires dashboard access to get exact string
3. 16 migrations need to be applied (213 total SQL statements)

**Best Solution:**
- Manual execution via Supabase SQL Editor (5-10 minutes)
- Reliable, secure, and transparent

**Alternative (if automation preferred):**
- Get direct connection string from Supabase dashboard
- Use `npx supabase db push --db-url "..."`
