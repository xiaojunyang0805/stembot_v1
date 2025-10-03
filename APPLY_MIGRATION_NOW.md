# 🚨 URGENT: Apply Database Migration

## Issue Identified
The `project_methodology` table does not exist in production, causing:
- 404 errors when loading methodology page
- Screen jumping as page retries loading
- Unable to save methodology data

## Solution
Apply the WP4-1.3 database migration to create the table.

---

## Method 1: Supabase Dashboard (RECOMMENDED)

### Steps:
1. Go to: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire SQL from: `supabase/migrations/20251003_create_project_methodology.sql`
5. Paste into the query editor
6. Click **Run** button
7. Verify: Check **Table Editor** → should see `project_methodology` table

### Expected Result:
```
Success. No rows returned
```

---

## Method 2: Automated Script (If Method 1 Fails)

### Prerequisites:
- Local dev server running
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Command:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run migration (wait for server to be ready)
node scripts/execute-migration.js supabase/migrations/20251003_create_project_methodology.sql
```

---

## Verification

### 1. Check Table Exists:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'project_methodology';
```

Expected: Returns 1 row

### 2. Test Methodology Page:
1. Go to: https://stembotv1.vercel.app/projects/6741f266-9410-43b2-9f73-5dfe17176424/methodology
2. Open DevTools Console
3. Should NOT see: `404 (Not Found)` for `project_methodology`
4. Should see: Smooth page load, no jumping

### 3. Test Save Functionality:
1. Click **✅ Use This Method**
2. Check DevTools Network tab
3. Should see successful POST to Supabase
4. Refresh page → methodology should reload

---

## SQL Migration File Location
```
supabase/migrations/20251003_create_project_methodology.sql
```

## What the Migration Creates:
- ✅ `project_methodology` table with all fields
- ✅ Indexes for performance (`project_id`, `created_at`)
- ✅ Auto-update trigger for `updated_at` field
- ✅ Row-Level Security (RLS) policies
- ✅ Cascading delete on project removal

---

## Timeline
**Priority:** URGENT
**Time Required:** 2 minutes
**Impact:** Fixes screen jumping + enables data persistence

---

## After Migration Applied:
1. ✅ Screen jumping fixed
2. ✅ Methodology data persists
3. ✅ Pinecone embeddings created
4. ✅ AI chat can access methodology
5. ✅ WP4-1.4 fully functional

---

## Troubleshooting

### Issue: Permission Denied
**Solution:** Use service role key, not anon key

### Issue: Table Already Exists
**Solution:** Migration uses `IF NOT EXISTS`, safe to re-run

### Issue: RLS Policies Conflict
**Solution:** Drop existing policies first:
```sql
DROP POLICY IF EXISTS "Users can view their own project methodologies" ON project_methodology;
-- Then re-run migration
```

---

**Created:** October 3, 2025
**Related:** WP4-1.3, WP4-1.4
**Deployment:** Commit 85868ce includes graceful error handling
