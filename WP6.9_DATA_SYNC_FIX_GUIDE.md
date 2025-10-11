# WP6.9 Data Synchronization Bug - Complete Fix Guide

**Bug ID:** Critical Bug #2 from WP6.9 Testing
**Priority:** 🔴 HIGH (Data Integrity Issue)
**Status:** 🛠️ Ready to Fix
**Estimated Time:** 30-45 minutes

---

## 📋 Problem Summary

**Issue:** Dashboard shows 6 active projects, but billing page shows "0 / 1 active projects"

**Root Cause:**
1. **Silent Failures**: Project creation's usage count update catches errors but doesn't fail (`console.warn`)
2. **No Database Trigger**: No automatic synchronization when projects are inserted/updated/deleted
3. **Historical Data**: Projects created before usage tracking system may not be counted
4. **Application-Level Sync**: Relies on application code instead of database-level enforcement

**Impact:**
- ❌ Usage enforcement may not block project creation at limits
- ❌ Billing page shows incorrect usage statistics
- ❌ Users might exceed free tier without upgrade prompts
- ❌ Data integrity compromised across the system

---

## 🔍 Analysis Complete

### Current Architecture:

**Usage Tracking Flow:**
```
User Creates Project
    ↓
POST /api/projects/create
    ↓
Insert project into 'projects' table
    ↓
Try to update usage_tracking (lines 118-132)
    ↓
If fails → console.warn (SILENT FAILURE ❌)
    ↓
Return success to user
```

**Problem Points Identified:**

1. **src/app/api/projects/create/route.ts** (Lines 118-132)
   ```typescript
   try {
     const { count } = await supabaseAdmin
       .from('projects')
       .select('*', { count: 'exact', head: true })
       .eq('user_id', userId)
       .eq('status', 'active');

     if (count !== null) {
       await updateProjectCount(userId, count);
     }
   } catch (error) {
     console.warn('Failed to update project count:', error);
     // Don't fail the request if usage update fails  // ⚠️ SILENT FAILURE
   }
   ```

2. **No Database Trigger**: Schema has no automatic sync mechanism

3. **Test Account Data**:
   - User: 601404242@qq.com (b7efa8ad-...)
   - Projects table: 6 active projects
   - usage_tracking table: active_projects_count = 0

---

## 🛠️ Fix Strategy (3-Phase Approach)

### **Phase 1: Immediate Data Reconciliation** (5 minutes)
Fix existing data for all users

### **Phase 2: Database Trigger Implementation** (15 minutes)
Prevent future drift with automatic synchronization

### **Phase 3: Application Code Hardening** (10 minutes)
Remove silent failures and add monitoring

---

## 📝 Step-by-Step Fix Instructions

### **PHASE 1: SQL Reconciliation Script**

**What it does:** Updates `usage_tracking` to match actual project counts from `projects` table

**Instructions:**

1. **Open Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new

2. **Copy and run this SQL script:**

```sql
-- =====================================================
-- PHASE 1: Data Reconciliation Script
-- WP6.9 Bug Fix: Sync usage_tracking with actual project counts
-- =====================================================

-- Step 1: Check current state BEFORE reconciliation
SELECT
  'BEFORE RECONCILIATION' as status,
  COUNT(DISTINCT ut.user_id) as users_with_usage_records,
  SUM(ut.active_projects_count) as total_tracked_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'active') as actual_active_projects
FROM usage_tracking ut
WHERE ut.month = TO_CHAR(NOW(), 'YYYY-MM');

-- Step 2: Create temporary table with actual counts
CREATE TEMP TABLE actual_project_counts AS
SELECT
  user_id,
  COUNT(*) as actual_count
FROM projects
WHERE status = 'active'
GROUP BY user_id;

-- Step 3: Display discrepancies (for verification)
SELECT
  ut.user_id,
  ut.active_projects_count as tracked_count,
  COALESCE(apc.actual_count, 0) as actual_count,
  COALESCE(apc.actual_count, 0) - ut.active_projects_count as difference
FROM usage_tracking ut
LEFT JOIN actual_project_counts apc ON apc.user_id = ut.user_id
WHERE ut.month = TO_CHAR(NOW(), 'YYYY-MM')
  AND (COALESCE(apc.actual_count, 0) != ut.active_projects_count)
ORDER BY difference DESC;

-- Step 4: Update usage_tracking with correct counts
UPDATE usage_tracking ut
SET
  active_projects_count = COALESCE(apc.actual_count, 0),
  updated_at = NOW()
FROM actual_project_counts apc
WHERE ut.user_id = apc.user_id
  AND ut.month = TO_CHAR(NOW(), 'YYYY-MM')
  AND ut.active_projects_count != apc.actual_count;

-- Step 5: Insert missing usage records for users with projects but no tracking
INSERT INTO usage_tracking (user_id, month, active_projects_count, ai_interactions_count)
SELECT
  apc.user_id,
  TO_CHAR(NOW(), 'YYYY-MM') as month,
  apc.actual_count,
  0 as ai_interactions_count
FROM actual_project_counts apc
LEFT JOIN usage_tracking ut ON ut.user_id = apc.user_id AND ut.month = TO_CHAR(NOW(), 'YYYY-MM')
WHERE ut.id IS NULL
ON CONFLICT (user_id, month) DO NOTHING;

-- Step 6: Verify reconciliation AFTER
SELECT
  'AFTER RECONCILIATION' as status,
  COUNT(DISTINCT ut.user_id) as users_with_usage_records,
  SUM(ut.active_projects_count) as total_tracked_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'active') as actual_active_projects
FROM usage_tracking ut
WHERE ut.month = TO_CHAR(NOW(), 'YYYY-MM');

-- Step 7: Specific check for test account
SELECT
  'TEST ACCOUNT (601404242@qq.com)' as account,
  ut.user_id,
  ut.active_projects_count as tracked_projects,
  (SELECT COUNT(*) FROM projects WHERE user_id = ut.user_id AND status = 'active') as actual_projects
FROM usage_tracking ut
WHERE ut.user_id = 'b7efa8ad-be1f-48b2-89e8-1de7d08d8e91'  -- Update with actual user_id
  AND ut.month = TO_CHAR(NOW(), 'YYYY-MM');

-- Cleanup temp table
DROP TABLE actual_project_counts;

-- =====================================================
-- RECONCILIATION COMPLETE
-- =====================================================
```

3. **Click "Run" button**

4. **Verify Output:**
   - BEFORE: Should show mismatched counts
   - Discrepancies table: Should show users with incorrect counts
   - AFTER: Total tracked projects should match actual active projects
   - Test account: Should now show 6 projects

5. **Expected Result:**
   ```
   TEST ACCOUNT (601404242@qq.com)
   tracked_projects: 6
   actual_projects: 6
   ```

**⚠️ IMPORTANT:** Get the actual `user_id` for test account first:
```sql
-- Find user_id for test account
SELECT id, email FROM auth.users WHERE email = '601404242@qq.com';
-- Use the returned id in Step 7 above
```

---

### **PHASE 2: Database Trigger Implementation**

**What it does:** Automatically syncs `usage_tracking` whenever projects are created/updated/deleted

**Instructions:**

1. **Open Supabase SQL Editor** (same URL as above)

2. **Copy and run this SQL script:**

```sql
-- =====================================================
-- PHASE 2: Database Trigger for Automatic Synchronization
-- WP6.9 Bug Fix: Auto-sync usage_tracking on project changes
-- =====================================================

-- Step 1: Create trigger function
CREATE OR REPLACE FUNCTION sync_project_usage_count()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_current_month TEXT;
  v_project_count INT;
BEGIN
  -- Get current month in YYYY-MM format
  v_current_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Determine which user_id to update
  -- (NEW for INSERT/UPDATE, OLD for DELETE)
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);

  -- Count active projects for this user
  SELECT COUNT(*) INTO v_project_count
  FROM projects
  WHERE user_id = v_user_id
    AND status = 'active';

  -- Upsert usage_tracking with correct count
  INSERT INTO usage_tracking (user_id, month, active_projects_count, ai_interactions_count)
  VALUES (v_user_id, v_current_month, v_project_count, 0)
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    active_projects_count = v_project_count,
    updated_at = NOW();

  -- Log the sync (optional, for debugging)
  RAISE NOTICE 'Synced project count for user %: % active projects', v_user_id, v_project_count;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on projects table
DROP TRIGGER IF EXISTS sync_usage_on_project_change ON projects;

CREATE TRIGGER sync_usage_on_project_change
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION sync_project_usage_count();

-- Step 3: Test the trigger with a dry run
-- (This will show what the trigger would do without actually changing data)
SELECT
  'TRIGGER TEST' as test,
  user_id,
  COUNT(*) as active_projects
FROM projects
WHERE status = 'active'
GROUP BY user_id
LIMIT 5;

-- Step 4: Verify trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'sync_usage_on_project_change';

-- =====================================================
-- TRIGGER IMPLEMENTATION COMPLETE
-- =====================================================

COMMENT ON FUNCTION sync_project_usage_count IS
  'Automatically synchronizes usage_tracking.active_projects_count when projects are inserted, updated, or deleted';

COMMENT ON TRIGGER sync_usage_on_project_change ON projects IS
  'Ensures usage_tracking always reflects accurate project counts';
```

3. **Click "Run" button**

4. **Verify Output:**
   - Function created: `sync_project_usage_count()`
   - Trigger created: `sync_usage_on_project_change`
   - Test output: Should show users with their project counts

5. **Test the Trigger:**
   ```sql
   -- Simulate project status change
   UPDATE projects
   SET status = 'archived'
   WHERE id = (SELECT id FROM projects LIMIT 1)
   RETURNING id, user_id, status;

   -- Check if usage_tracking was updated
   SELECT user_id, active_projects_count
   FROM usage_tracking
   WHERE user_id = (SELECT user_id FROM projects LIMIT 1)
     AND month = TO_CHAR(NOW(), 'YYYY-MM');

   -- Revert the test change
   UPDATE projects
   SET status = 'active'
   WHERE id = (SELECT id FROM projects WHERE status = 'archived' LIMIT 1);
   ```

---

### **PHASE 3: Application Code Hardening**

**What it does:** Remove silent failures and add proper error handling

**Instructions:**

1. **Update src/app/api/projects/create/route.ts**

   **Find lines 118-132:**
   ```typescript
   try {
     const { count } = await supabaseAdmin
       .from('projects')
       .select('*', { count: 'exact', head: true })
       .eq('user_id', userId)
       .eq('status', 'active');

     if (count !== null) {
       await updateProjectCount(userId, count);
     }
   } catch (error) {
     console.warn('Failed to update project count:', error);
     // Don't fail the request if usage update fails
   }
   ```

   **Replace with:**
   ```typescript
   // Note: Usage count is now automatically synced by database trigger
   // This code is kept for backwards compatibility and logging only
   try {
     const { count } = await supabaseAdmin
       .from('projects')
       .select('*', { count: 'exact', head: true })
       .eq('user_id', userId)
       .eq('status', 'active');

     if (count !== null) {
       console.log('✅ Project count for user:', userId, '=', count);
       // Trigger will automatically sync usage_tracking
       // Manual update removed to avoid race conditions with trigger
     }
   } catch (error) {
     console.error('⚠️ Failed to verify project count:', error);
     // Project creation still succeeds because trigger handles sync
   }
   ```

2. **Create monitoring endpoint: src/app/api/admin/verify-usage/route.ts**

```typescript
/**
 * Admin API: Verify Usage Data Integrity
 * Checks for discrepancies between usage_tracking and actual data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get actual project counts
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('user_id, status');

    if (projectsError) throw projectsError;

    // Group by user and count active projects
    const actualCounts: Record<string, number> = {};
    projects.forEach((p) => {
      if (p.status === 'active') {
        actualCounts[p.user_id] = (actualCounts[p.user_id] || 0) + 1;
      }
    });

    // Get tracked counts from usage_tracking
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('user_id, active_projects_count')
      .eq('month', currentMonth);

    if (usageError) throw usageError;

    // Find discrepancies
    const discrepancies: any[] = [];
    const trackedCounts: Record<string, number> = {};

    usage.forEach((u) => {
      trackedCounts[u.user_id] = u.active_projects_count;
    });

    // Check all users with projects
    Object.keys(actualCounts).forEach((userId) => {
      const actual = actualCounts[userId];
      const tracked = trackedCounts[userId] || 0;

      if (actual !== tracked) {
        discrepancies.push({
          userId,
          actual,
          tracked,
          difference: actual - tracked,
        });
      }
    });

    // Check users with tracked but no actual projects
    Object.keys(trackedCounts).forEach((userId) => {
      if (!actualCounts[userId] && trackedCounts[userId] > 0) {
        discrepancies.push({
          userId,
          actual: 0,
          tracked: trackedCounts[userId],
          difference: -trackedCounts[userId],
        });
      }
    });

    return NextResponse.json({
      success: true,
      totalUsers: Object.keys({ ...actualCounts, ...trackedCounts }).length,
      usersWithDiscrepancies: discrepancies.length,
      discrepancies: discrepancies.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
      summary: {
        totalActiveProjects: Object.values(actualCounts).reduce((sum, n) => sum + n, 0),
        totalTrackedProjects: Object.values(trackedCounts).reduce((sum, n) => sum + n, 0),
      },
    });
  } catch (error: any) {
    console.error('❌ Error verifying usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify usage' },
      { status: 500 }
    );
  }
}
```

3. **Create reconciliation endpoint: src/app/api/admin/sync-usage/route.ts**

```typescript
/**
 * Admin API: Sync Usage Data
 * Manually triggers reconciliation between usage_tracking and actual data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateProjectCount } from '@/lib/stripe/subscriptionHelpers';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all active projects grouped by user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('user_id, status');

    if (projectsError) throw projectsError;

    // Count active projects per user
    const userCounts: Record<string, number> = {};
    projects.forEach((p) => {
      if (p.status === 'active') {
        userCounts[p.user_id] = (userCounts[p.user_id] || 0) + 1;
      }
    });

    // Update usage_tracking for each user
    const results: any[] = [];
    for (const [userId, count] of Object.entries(userCounts)) {
      try {
        await updateProjectCount(userId, count);
        results.push({ userId, count, success: true });
      } catch (error: any) {
        results.push({ userId, count, success: false, error: error.message });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      usersUpdated: successful,
      usersFailed: failed,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error syncing usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync usage' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Verification Steps

### **1. Verify Data Reconciliation:**

```bash
# Using curl to check billing status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://stembotv1.vercel.app/api/billing/status
```

Expected output should show correct project count:
```json
{
  "usage": {
    "activeProjects": {
      "current": 6,  // ✅ Should match dashboard
      "limit": 1
    }
  }
}
```

### **2. Verify Trigger Works:**

Create a test project via dashboard:
1. Login to https://stembotv1.vercel.app
2. Navigate to /projects/create
3. Create a new project
4. Immediately check billing page → count should increment

### **3. Verify Monitoring Endpoint:**

```bash
# Check for discrepancies
curl https://stembotv1.vercel.app/api/admin/verify-usage
```

Expected: `"usersWithDiscrepancies": 0`

### **4. Visual Verification:**

1. Login with test account: 601404242@qq.com
2. Navigate to Dashboard → Should show 6 projects
3. Navigate to Settings → Billing → Should show "6 / 1 active projects"
4. Usage bar should be at 600% (over limit)

---

## 🚨 Rollback Plan

If something goes wrong:

### **Rollback Phase 2 (Remove Trigger):**
```sql
DROP TRIGGER IF EXISTS sync_usage_on_project_change ON projects;
DROP FUNCTION IF EXISTS sync_project_usage_count();
```

### **Rollback Phase 3 (Revert Code):**
```bash
git checkout HEAD -- src/app/api/projects/create/route.ts
git checkout HEAD -- src/app/api/admin/verify-usage/route.ts
git checkout HEAD -- src/app/api/admin/sync-usage/route.ts
```

### **Rollback Phase 1 (Restore Old Data):**
```sql
-- Only if you have a backup!
-- This is why Phase 1 shows BEFORE state first
```

---

## 📊 Success Criteria

✅ **Phase 1 Complete:**
- [ ] SQL reconciliation script executed without errors
- [ ] Test account shows 6/1 projects in billing page
- [ ] BEFORE vs AFTER shows data was corrected

✅ **Phase 2 Complete:**
- [ ] Database trigger created successfully
- [ ] Trigger test shows it fires correctly
- [ ] Creating/deleting project automatically updates usage_tracking

✅ **Phase 3 Complete:**
- [ ] Application code updated (no silent failures)
- [ ] Monitoring endpoint returns 0 discrepancies
- [ ] Reconciliation endpoint works manually

✅ **Overall Fix Verified:**
- [ ] Dashboard and billing page show same project count
- [ ] Creating new project increments count immediately
- [ ] Deleting project decrements count immediately
- [ ] Test account data is accurate
- [ ] No console errors or warnings

---

## 🎯 Expected Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | SQL Reconciliation | 5 min | ⏳ Ready |
| 2 | Database Trigger | 15 min | ⏳ Ready |
| 3 | Application Code | 10 min | ⏳ Ready |
| - | Testing & Verification | 10 min | ⏳ Ready |
| **Total** | **Complete Fix** | **40 min** | **Ready to Execute** |

---

## 📞 Support

If you encounter issues during fix execution:

1. **Check Supabase Logs**: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/logs
2. **Check Vercel Logs**: https://vercel.com/stembot/logs
3. **Review CLAUDE.md**: Debugging protocols section
4. **Review WP6.9_TEST_RESULTS.md**: Original bug documentation

---

**Ready to execute? Start with Phase 1!** 🚀
