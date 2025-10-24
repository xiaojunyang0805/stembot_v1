# Database Cleanup Report
**Generated:** 2025-10-14
**Database:** kutpbtpdgptcmrlabekq.supabase.co

---

## Executive Summary

The Supabase database has been analyzed and contains **11 users**, **9 projects**, and various associated data. Several cleanup opportunities have been identified to remove test data and duplicates.

---

## Database Overview

### Tables Status
| Table | Rows | Status |
|-------|------|--------|
| users | 11 | ⚠️ Contains test users |
| projects | 9 | ⚠️ Contains duplicates |
| conversations | 1 | ✅ OK |
| project_documents | 1 | ✅ OK |
| gap_analyses | 18 | ✅ OK |
| source_organizations | 0 | ✅ Empty |
| credibility_assessments | 1 | ✅ OK |
| paper_outlines | 0 | ✅ Empty |
| paper_sections | 1 | ✅ OK |
| subscriptions | 2 | ⚠️ Missing Stripe data |
| user_preferences | 0 | ✅ Empty |

---

## Issues Identified

### 1. Test/Junk Users (8 users - 0 projects)

These appear to be automated test accounts with no associated data:

- `cache.busted.1759269474980@university.edu` (ID: 5bd4192d-5fed-451e-9ba1-7287f82d3cc3)
- `test.student.1759269568011.0@gmail.com` (ID: 367ded9c-3a98-40aa-8bb5-0ebea52ae77a)
- `test.student.1759269570259.1@outlook.com` (ID: 067e935a-59e8-4aa6-9598-d448627074fc)
- `test.student.1759269571661.2@yahoo.com` (ID: 533491c0-9617-46b6-98f6-2c274a860018)
- `test.student.1759269573185.3@student.university.edu` (ID: fe8cad7e-8896-4204-9b95-e507af3c8b07)
- `test.student.1759269574821.4@school.k12.state.us` (ID: 4e5e31d1-c9aa-4384-9bc6-2dd001e63875)
- `complete.test.1759270369720@university.edu` (ID: 43820be9-de61-41cf-90ad-560c662bb26f)
- `test@university.edu` (ID: de2a8134-6fcf-43aa-913f-8b1b38f0dba3)

**Impact:** Low - No projects or data associated with these users

---

### 2. Duplicate Projects (4 projects, 3 duplicates)

User `601404242@qq.com` has 4 identical projects titled **"Sleep patterns and memory performance in college students"**:

| Project ID | Created | Keep/Delete |
|------------|---------|-------------|
| b19324d4-11e7-456b-b4e1-9117a7ef2595 | 2025-10-01 20:32:31 | ✅ **KEEP** (oldest) |
| 28cae453-2b69-4219-955e-e5184cb05dc6 | 2025-10-01 20:38:06 | ❌ DELETE |
| 588192ed-7e02-4e25-83a7-b04365c35e3e | 2025-10-01 20:39:39 | ❌ DELETE |
| b1af2dc0-bbaf-47bd-9182-c4e858e62985 | 2025-10-01 20:50:07 | ❌ DELETE |

**Impact:** Low - Duplicate projects have no conversations, documents, or gap analyses attached

---

### 3. Subscription Data Issues (2 subscriptions)

Both active subscriptions are missing critical Stripe data:

**Subscription 1:**
- User: `xiaojunyang0805@gmail.com` (1c69a921-1303-404d-b974-9bd1f2ab02a2)
- Status: `active`
- Stripe Customer ID: ✅ `cus_TDYin3FV2vvTw8`
- Stripe Subscription ID: ❌ **MISSING**
- Price ID: ❌ **MISSING**

**Subscription 2:**
- User: `601404242@qq.com` (b7efa8ad-db3c-463a-a64a-7c079fa0cada)
- Status: `active`
- Stripe Customer ID: ✅ `cus_TDb3PM84gSyJGi`
- Stripe Subscription ID: ✅ `sub_1SH9sS2Q25JDcEYX0XRDf7yW`
- Price ID: ❌ **MISSING**

**Impact:** Medium - Active subscriptions without proper Stripe data may cause billing issues

---

## Real Users (DO NOT DELETE)

| Email | Projects | Notes |
|-------|----------|-------|
| xiaojunyang0805@gmail.com | 2 | Production user with real projects |
| 601404242@qq.com | 6 | Test account but has real project data |
| stembot.test.free@gmail.com | 1 | Free tier test account with data |

---

## Cleanup Options

### Option 1: Delete Test Users
**Impact:** Removes 8 test users with no associated data
**Risk:** Low (no real data will be lost)
**Command:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<your_key> \
npx tsx scripts/cleanup-options.ts 1 EXECUTE
```

---

### Option 2: Delete Duplicate Projects
**Impact:** Removes 3 duplicate projects (keeps oldest)
**Risk:** Low (duplicates have no associated data)
**Command:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<your_key> \
npx tsx scripts/cleanup-options.ts 2 EXECUTE
```

---

### Option 3: Review Subscription Issues
**Impact:** Reports subscription issues (no deletions)
**Risk:** None (read-only)
**Command:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<your_key> \
npx tsx scripts/cleanup-options.ts 3
```

**Recommended Actions:**
1. Verify subscriptions in Stripe dashboard
2. Update missing `stripe_price_id` fields manually
3. Consider setting status to `incomplete` if Stripe data is permanently missing

---

### Option 4: Full Cleanup (Recommended)
**Impact:** Combines Option 1 + Option 2
**Risk:** Low (only removes test data and duplicates)
**Command:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<your_key> \
npx tsx scripts/cleanup-options.ts 4 EXECUTE
```

---

## Recommendations

1. ✅ **Execute Option 4** (Full Cleanup) - Safely removes test users and duplicate projects
2. ⚠️ **Manually fix subscription data** - Option 3 provides details
3. 🔍 **Consider implementing safeguards:**
   - Add unique constraints on project titles per user
   - Implement better test data cleanup in CI/CD
   - Add validation for subscription data before marking as "active"

---

## Safety Notes

- All cleanup operations use CASCADE delete (removes associated data)
- Test users have NO associated projects or data
- Duplicate projects have NO associated conversations, documents, or gap analyses
- Real user data is explicitly protected and will NOT be deleted
- All operations prompt for confirmation before executing

---

## How to Execute

1. **Preview first** (without EXECUTE flag):
   ```bash
   npx tsx scripts/cleanup-options.ts 4
   ```

2. **Execute cleanup** (with confirmation):
   ```bash
   npx tsx scripts/cleanup-options.ts 4 EXECUTE
   ```

3. **Verify results**:
   ```bash
   npx tsx scripts/check-db-simple.ts
   ```

---

**Generated by:** Claude Code
**Script Location:** `scripts/cleanup-options.ts`
