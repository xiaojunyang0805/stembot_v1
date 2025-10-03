# 🛡️ WORKING PROTOCOL

## ⚠️ **CRITICAL: Comprehensive Development & Deployment Protocols**

This document contains all essential protocols for protecting working functionality, automated testing, and efficient development workflows.

---

## 🔑 **TEST ACCOUNT CREDENTIALS**

### **Production Testing Account**
- **Email:** 601404242@qq.com
- **Password:** Woerner6163418=
- **Usage:** For all automated and manual testing on https://stembotv1.vercel.app
- **Chrome DevTools MCP Testing:** Use this account for all browser automation tests

---

## 📋 **MANDATORY PRE-CHANGE CHECKLIST**

### **BEFORE ANY CODE CHANGES:**

#### 1. **Working State Documentation**
- [ ] Test current live deployment: `https://stembotv1.vercel.app`
- [ ] Document what currently WORKS:
  - [ ] Homepage loads properly
  - [ ] Auth flow (login/logout) functions
  - [ ] Dashboard displays correctly
  - [ ] UI styling renders properly
  - [ ] Navigation works
- [ ] Screenshot working pages for reference
- [ ] Record current git commit hash: `git rev-parse HEAD`

#### 2. **Change Impact Assessment**
- [ ] What specific functionality are we modifying?
- [ ] What existing features could this break?
- [ ] Is this additive or replacement?
- [ ] Can we implement this without touching working code?

#### 3. **Risk Mitigation**
- [ ] Identify rollback commit hash
- [ ] Test in development first: `npm run dev`
- [ ] Verify build works: `npm run build`
- [ ] Plan incremental deployment strategy

---

## 🚨 **DEPLOYMENT SAFETY RULES**

### **Rule 1: Working Features Are Sacred**
- NEVER modify working authentication, UI, or core functionality
- Add new features alongside existing ones
- Use feature flags for experimental changes

### **Rule 2: Test Before Deploy**
```bash
# Mandatory sequence before any deployment:
npm run type-check   # TypeScript validation
npm run build        # Build verification
git status           # Review all changes
```

### **Rule 3: Incremental Changes Only**
- Make ONE logical change per commit
- Test after each change
- Deploy small changes, not large batches

### **Rule 4: Immediate Rollback Capability**
- Keep track of last known working commit
- Test rollback procedure regularly
- Document how to quickly revert

---

## 📊 **CURRENT WORKING STATE BASELINE**

### **As of Latest Verification (Oct 1, 2025):**
- **Working Commit:** `8ac989f` (Deployment crisis resolved)
- **Date:** `2025-10-01`
- **Working Domain:** `https://stembotv1.vercel.app`
- **Build Date:** `2025-10-01T09:47:02.410Z`
- **Working Features:**
  - ✅ Homepage with proper styling
  - ✅ User authentication flow (login/logout)
  - ✅ Dashboard functionality
  - ✅ Error pages with inline styles
  - ✅ Loading pages with animations
  - ✅ 404 pages with navigation
  - ✅ Build compiles successfully
  - ✅ **WP3 SearchStrategy API fully deployed and functional**
  - ✅ **AI-powered literature search strategy generation working**
  - ✅ All API endpoints (version, search-strategy, test-deployment) responding

### **Known Issues (Accept These, Don't Break Working Parts):**
- Domain routing complexity due to repository split
- Tailwind CSS build inconsistencies
- ⚠️ **Vercel deployment pipeline can get stuck (requires force deployment)**

---

## 🔄 **ROLLBACK PROCEDURE**

### **Emergency Rollback Steps:**
1. Identify last working commit: `git log --oneline -10`
2. Create emergency branch: `git checkout -b emergency-rollback`
3. Reset to working state: `git reset --hard [WORKING_COMMIT_HASH]`
4. Force push: `git push origin main --force`
5. Verify deployment recovery

### **Recovery Verification:**
- [ ] Homepage loads without errors
- [ ] Authentication works
- [ ] Dashboard displays properly
- [ ] No console errors

---

## 🚨 **CRITICAL DEPLOYMENT LESSONS LEARNED**

### **🔥 CRITICAL: Vercel Deployment Pipeline Failure (Oct 1, 2025)**
**Problem:** 12+ consecutive deployment failures spanning 2+ hours despite successful local builds.
**Root Cause:** Vercel deployment pipeline became stuck/corrupted, not code issues.
**Symptoms:**
- All deployments failed in 30-40 seconds with 0ms build time
- Local `npm run build` worked perfectly
- No TypeScript or lint errors
- All commits since working deployment (~2 hours) failed consistently

**Resolution:** `npx vercel --prod --force` to bypass cache and force fresh deployment
**Time to Fix:** Immediate success after force deployment command

**🎯 Key Lessons:**
1. **Local build success ≠ Vercel deployment success** - Different failure points
2. **Deployment pipeline can get stuck independently of code quality**
3. **Force deployment (`--force` flag) should be first troubleshooting step**
4. **Automated deployment checking scripts are essential for rapid diagnosis**
5. **Don't debug code when deployment pipeline is the issue**

### **🛡️ MANDATORY Deployment Crisis Protocol:**
```bash
# 1. Quick diagnosis (run immediately on deployment failures)
bash scripts/auto-deploy-check.sh

# 2. If multiple consecutive failures detected, force deploy first
npx vercel --prod --force

# 3. Only debug code if force deployment also fails
npm run type-check && npm run build

# 4. Monitor resolution
bash scripts/auto-deploy-check.sh
```

### **Domain Routing Issue (Sep 27, 2025)**
**Problem:** Main domain served different content than working domain despite same project.
**Root Cause:** Vercel deployed from `master` branch while development was on `main` branch.
**Symptoms:** Debug indicators showed on working domain but not main domain.
**Resolution:** Merged `main` into `master` and pushed to update main domain.

**Key Lessons:**
1. **Always verify which branch Vercel uses for production domain**
2. **Check Vercel project settings → Git → Production Branch**
3. **Keep main and master branches synchronized**
4. **Use debug indicators to identify branch/deployment mismatches**

### **🚨 ENHANCED Prevention Checklist:**
- [ ] **FIRST**: Check if deployment pipeline is stuck (multiple consecutive failures)
- [ ] **If stuck**: Run `npx vercel --prod --force` before debugging code
- [ ] Use automated deployment checking: `bash scripts/auto-deploy-check.sh`
- [ ] Verify production branch setting in Vercel before major changes
- [ ] Ensure all development happens on the branch Vercel deploys from
- [ ] Add deployment verification banners for visual confirmation
- [ ] Test both main domain AND working domain URLs
- [ ] Document which branch is used for production deployments

## 📝 **CHANGE LOG TEMPLATE**

For every significant change, document:

```
## Change: [DESCRIPTION]
**Date:** [DATE]
**Before Commit:** [HASH]
**After Commit:** [HASH]
**Branch Used:** [main/master - verify Vercel production branch]

**What Works Before:**
- [List working functionality]

**What We're Changing:**
- [Specific changes]

**Potential Risks:**
- [What could break]
- [ ] Branch mismatch causing domain routing issues

**Testing Done:**
- [ ] Local dev test
- [ ] Build test
- [ ] Deployment test on MAIN DOMAIN (not just working domain)
- [ ] Verify correct branch is being deployed

**Rollback Plan:**
- Reset to commit: [HASH]
- Ensure rollback is on correct branch for production
```

---

## 🎯 **SUCCESS METRICS**

### **Project Protection Success:**
- Zero loss of previously working functionality
- All "improvements" are additive
- Quick recovery from any issues
- Maintained user confidence

### **Development Efficiency:**
- Faster feature development (no re-work)
- Reduced debugging time
- Preserved token investment
- Continuous progress forward

---

## 🔧 **CHROME DEVTOOLS MCP INTEGRATION**

### **Automated UI Inspection Protocol**
✅ **Chrome DevTools MCP Server**: Installed and connected
- **Status**: `claude mcp list` shows chrome-devtools connected
- **Command**: `npx chrome-devtools-mcp@latest`

### **Automated Testing Instead of Manual DevTools**
Replace manual DevTools inspection with automated commands:

```bash
# Performance check
"Check the performance of https://stembotv1.vercel.app"

# Visual inspection
"Take screenshot of https://stembotv1.vercel.app"

# Console error detection
"Check console logs for https://stembotv1.vercel.app"

# Network monitoring
"Monitor network requests for https://stembotv1.vercel.app"

# Responsive testing
"Test responsive design for https://stembotv1.vercel.app"
```

### **Integrated Pre-Deployment Protocol**
Enhanced testing workflow:
```bash
# 1. Code validation
npm run type-check && npm run build

# 2. Automated UI inspection (Chrome DevTools MCP)
"Check performance and console errors for https://stembotv1.vercel.app"

# 3. Visual verification
"Take screenshot and inspect DOM for layout issues"

# 4. Deploy with confidence
git add . && git commit -m "..." && git push origin main
```

## 🔍 **VERCEL DEPLOYMENT STATUS CHECKING**

### **Method 1: Direct Site Testing (Recommended)**
```bash
# Check main site availability
curl -s -o /dev/null -w "%{http_code}" "https://stembotv1.vercel.app"
# Expected: 200

# Verify API endpoints work
curl -s "https://stembotv1.vercel.app/api/version"
# Expected: JSON with version info

# Test specific project pages
curl -s -o /dev/null -w "%{http_code}" "https://stembotv1.vercel.app/projects/[PROJECT_ID]"
# Expected: 200
```

### **Method 1.5: Quick API Route Testing (For New Routes)**
```bash
# Test new API routes immediately after deployment
curl -s "https://stembotv1.vercel.app/api/[NEW_ROUTE]"
# Expected: Valid JSON response, NOT 405 Method Not Allowed

# Example: Test SearchStrategy API
curl -s "https://stembotv1.vercel.app/api/ai/search-strategy"
# Expected: {"message":"Search Strategy API is running","methods":["POST"],"status":"healthy"}

# Test POST functionality
curl -s "https://stembotv1.vercel.app/api/ai/search-strategy" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"researchQuestion":"test","projectId":"test"}'
# Expected: JSON response with search strategy, NOT 405 or 500 error
```

### **Method 2: Vercel CLI (Recommended for Deployment Issues)**
```bash
# Login (opens browser for authentication)
npx vercel login

# Check recent deployments and their status
npx vercel ls

# Get current production deployment info
npx vercel --prod

# Check specific deployment details
npx vercel inspect [DEPLOYMENT_URL]

# Force redeploy current branch
npx vercel --prod --force

# Check build logs for specific deployment
npx vercel logs [DEPLOYMENT_URL]
```

### **Method 2.1: Diagnose Stuck Deployments**
```bash
# Compare local vs deployed build timestamps
echo "Local build time:" && git log -1 --format="%ci %h %s"
echo "Deployed build time:" && curl -s "https://stembotv1.vercel.app/api/version" | jq '.buildDate'

# Check if deployments are being triggered
npx vercel ls | head -5
# Look for recent timestamps matching your git commits

# If deployments are missing/old, force new deployment
npx vercel --prod --force
```

### **Method 3: Chrome DevTools MCP (Automated UI Testing)**
```bash
# Full page inspection
"Check performance, console logs, and visual layout for https://stembotv1.vercel.app"

# Screenshot for visual verification
"Take screenshot of https://stembotv1.vercel.app"

# Network request monitoring
"Monitor network requests and check for errors on https://stembotv1.vercel.app"
```

### **Quick Deployment Verification Protocol**
```bash
# 1. Basic availability check
curl -s -I "https://stembotv1.vercel.app" | head -1

# 2. API health check
curl -s "https://stembotv1.vercel.app/api/version" | jq '.status'

# 3. Automated UI inspection (Chrome DevTools MCP)
"Check console errors and performance for https://stembotv1.vercel.app"

# 4. Visual confirmation
"Take screenshot to verify layout and styling"
```

### **Build Success Indicators**
- ✅ HTTP 200 status codes
- ✅ API endpoints return valid JSON
- ✅ No console errors in Chrome DevTools
- ✅ Visual layout renders correctly
- ✅ Authentication flows work

## 🚨 **COMMON VERCEL DEPLOYMENT ERRORS & FIXES**

### **Error 1: API Route Returns 405 Method Not Allowed**
**Symptoms:**
```bash
curl -s "https://stembotv1.vercel.app/api/new-route"
# Returns: 405 Method Not Allowed
```

**Root Causes:**
- Missing export function in route.ts
- Incorrect file structure in `/api/` directory
- Route file not properly deployed

**Quick Diagnosis:**
```bash
# Check if route exists at all
curl -s "https://stembotv1.vercel.app/api/new-route" -I | head -1
# If 404: Route file missing or not deployed
# If 405: Route exists but missing HTTP method export

# Check local build includes the route
npm run build | grep "api/new-route"
# Should see: ƒ /api/new-route    0 B    0 B
```

**Fixes:**
1. **Add GET method for debugging:**
```typescript
// In route.ts file
export async function GET() {
  return NextResponse.json({ message: 'API is running', status: 'healthy' });
}
```

2. **Verify file structure:**
```
src/app/api/new-route/route.ts  ✅ Correct
src/app/api/new-route.ts        ❌ Wrong
```

3. **Check exports:**
```typescript
// Must export HTTP methods
export async function GET() { ... }
export async function POST() { ... }
```

### **Error 2: Missing Environment Variables**
**Symptoms:**
```bash
# API works locally but fails in production
curl -s "https://stembotv1.vercel.app/api/ai/something"
# Returns: 500 Internal Server Error
```

**Quick Diagnosis:**
```bash
# Check if environment-dependent features work
curl -s "https://stembotv1.vercel.app/api/version"
# If this works but others don't, likely env var issue
```

**Fixes:**
1. **Add graceful fallbacks:**
```typescript
// Handle missing environment variables
if (!process.env.REQUIRED_VAR) {
  console.warn('REQUIRED_VAR not available, using fallback');
  return fallbackFunction();
}
```

2. **Add to Vercel dashboard:**
   - Go to Vercel project → Settings → Environment Variables
   - Add missing variables for Production environment

### **Error 3: Stuck/Stale Deployments (Most Common)**
**Symptoms:**
- Local build works perfectly, routes show in build output
- API routes return 404 in production
- Version endpoint shows old buildDate despite recent commits
- New features don't appear on live site

**Quick Diagnosis:**
```bash
# Check deployment freshness
curl -s "https://stembotv1.vercel.app/api/version" | grep buildDate
git log -1 --format="%ci %h %s"
# Compare timestamps - if deployed build is hours/days old, deployment is stuck

# Test if new routes exist
curl -s "https://stembotv1.vercel.app/api/[NEW_ROUTE]"
# If 404 but route exists in local build, deployment issue confirmed
```

**Root Causes:**
- Vercel webhook disconnected from GitHub
- Deployment pipeline silently failing
- Branch/environment configuration mismatch
- Build cache corruption

**Fixes:**
1. **Force redeploy via Vercel CLI:**
```bash
npx vercel login
npx vercel --prod --force
```

2. **Check deployment status:**
```bash
npx vercel ls
# Look for recent deployments matching your commits
```

3. **Manual trigger in Vercel Dashboard:**
   - Go to project → Deployments
   - Click "Redeploy" on latest commit
   - Or create new deployment from main branch

### **Error 4: Import/Export Issues**
**Symptoms:**
- Build fails with "Cannot find module" errors
- TypeScript compilation errors in production

**Quick Diagnosis:**
```bash
# Check TypeScript compilation
npm run type-check
# Look for import path errors, missing types
```

**Fixes:**
1. **Fix import paths:**
```typescript
// Use absolute imports with @/ alias
import { Component } from '@/components/Component';
// NOT relative: import { Component } from '../../../../components/Component';
```

2. **Check case sensitivity:**
```typescript
// Vercel is case-sensitive
import { SearchStrategyCard } from '@/components/literature/SearchStrategyCard'; // ✅
import { searchstrategycard } from '@/components/literature/searchstrategycard'; // ❌
```

### **Quick Deployment Verification Protocol**
```bash
# 1. Pre-deployment checks
npm run type-check && npm run build

# 2. Deploy
git add . && git commit -m "..." && git push origin main

# 3. Wait 2-3 minutes for deployment

# 4. Immediate post-deployment verification
curl -s -w "%{http_code}" "https://stembotv1.vercel.app" -o /dev/null
curl -s "https://stembotv1.vercel.app/api/version"

# 5. Test new features specifically
curl -s "https://stembotv1.vercel.app/api/[NEW_ROUTE]"

# 6. If any issues, check Chrome DevTools
"Check console errors and performance for https://stembotv1.vercel.app"
```

## 🤖 **AUTOMATED DEPLOYMENT WORKFLOW**

### **🚨 PRIORITY: Deployment Crisis Response Protocol**
**CRITICAL**: When deployment failures detected, follow this exact sequence:

```bash
# STEP 1: Immediate crisis assessment (30 seconds)
bash scripts/auto-deploy-check.sh

# STEP 2: If multiple consecutive failures → FORCE DEPLOY FIRST
npx vercel --prod --force
# DON'T debug code when pipeline is stuck!

# STEP 3: Monitor resolution (2-3 minutes)
bash scripts/auto-deploy-check.sh

# STEP 4: Only if force deploy fails → Debug code issues
npm run type-check && npm run build
```

### **Claude Automated Deployment Checking**
```bash
# Run comprehensive deployment diagnosis
bash scripts/auto-deploy-check.sh

# Automatically attempt to fix deployment issues
bash scripts/auto-deploy-fix.sh

# Claude workflow integration
# See: scripts/claude-deploy-workflow.md for complete automation guide
```

### **Enhanced Automated Fix Strategies** ⚡
1. **🔥 PRIORITY: Force Redeploy** - `npx vercel --prod --force` (First line of defense)
2. **Git Trigger** - Trivial commit to trigger new deployment
3. **Cache Bust** - Update timestamps to clear deployment cache

### **Claude Integration Pattern (UPDATED)**
```
User: "Check Vercel deployment errors"

Claude Process:
1. Run: bash scripts/auto-deploy-check.sh
2. Analyze: If multiple consecutive failures detected
3. Execute: npx vercel --prod --force (PRIORITY ACTION)
4. Monitor: Deployment progress and verification
5. Fallback: bash scripts/auto-deploy-fix.sh (if force deploy fails)
6. Report: Resolution status and prevention measures

⚠️ KEY CHANGE: Force deployment BEFORE code debugging
```

## 🗄️ **SUPABASE CONFIGURATION & MIGRATION AUTOMATION**

### **🔐 Authentication Configuration**

#### **Common Authentication Issues:**
1. **Invalid API Key Error**
   - Go to: https://app.supabase.com/projects → Select `kutpbtpdgptcmrlabekq`
   - Navigate to: Settings → API
   - Copy fresh `anon public` and `service_role` keys
   - Update in `.env.local`

2. **Email Signups Disabled Error**
   - Go to: Authentication → Settings
   - Enable "Email" under "Auth Providers"
   - Option 1: Disable "Confirm email" for instant registration (MVP testing)
   - Option 2: Configure SMTP for email confirmation

3. **Test Authentication Config**
   ```bash
   node test-auth-config.js
   # Expected: ✅ SUCCESS: Email authentication is properly configured!
   ```

### **⚡ Automated SQL Migration Execution**

#### **🚨 CRITICAL LIMITATION DISCOVERED (Oct 2025)**
**Issue:** Supabase security model prevents automated DDL execution via client libraries
- `@supabase/supabase-js` doesn't support raw SQL execution
- `public.exec()` RPC function doesn't exist (by design, prevents SQL injection)
- Direct PostgreSQL connection requires exact connection string from dashboard

#### **✅ RECOMMENDED APPROACH: Manual Migration via Dashboard**
**Fastest and Most Reliable (5-10 minutes for all migrations):**

1. **Go to Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new

2. **Execute Migrations in Order:**
   - Copy contents from `supabase/migrations/[filename].sql`
   - Paste into SQL Editor
   - Click "Run" button
   - **Ignore "already exists" errors** (these are safe)
   - Only worry about other error types

3. **Migration Files to Execute:**
   ```
   001_create_research_database.sql
   002-009_fix_user_registration.sql (auth fixes - may be obsolete)
   20250101_create_credibility_assessments.sql
   20250101130000_create_gap_analyses.sql
   20250101140000_create_source_organizations.sql
   20250101150000_create_cross_phase_tables.sql
   20250929105340_add_conversations_table.sql
   20250929140000_add_project_documents_table.sql
   20251003_create_project_methodology.sql
   ```

4. **Verification Query:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

#### **🔧 ALTERNATIVE: Supabase CLI Method**
**If you have direct database connection string:**

```bash
# Get connection string from: Settings → Database → Connection String (Direct)
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

npx supabase db push --db-url "YOUR_DIRECT_CONNECTION_STRING"

# Or dry-run first:
npx supabase db push --db-url "..." --dry-run
```

**Supabase CLI Version:** 2.48.3 ✅ (Installed)

#### **⚠️ DEPRECATED: API Endpoint Method**
**Note:** The following method exists but has limitations due to Supabase security:

**Available Tools:**
- `scripts/execute-migration.js` - Node.js script (requires dev server)
- `scripts/run-all-migrations.js` - Batch executor (blocks on missing RPC)
- API: `/api/admin/execute-sql` (POST) - Requires `public.exec()` RPC (doesn't exist)
- API: `/api/admin/test-migration` (GET) - Connection testing

**Why It Doesn't Work Automatically:**
```javascript
// This approach fails because Supabase doesn't provide exec() RPC
const { error } = await supabase.rpc('exec', { query: statement })
// Error: Could not find the function public.exec(query) in the schema cache
```

**If You Still Want to Try (requires dev server):**
```bash
# 1. Start dev server
npm run dev

# 2. Execute single migration
node scripts/execute-migration.js supabase/migrations/[filename].sql

# 3. Dry-run test
node scripts/execute-migration.js --dry-run supabase/migrations/[filename].sql

# 4. Verify
curl http://localhost:3000/api/admin/test-migration
```

### **📊 Migration Status Tracking**

**Current Database Tables:**
- ✅ `projects` - Core project management
- ✅ `project_methodology` - Methodology storage (WP4)
- ✅ `conversations` - AI chat history
- ✅ `project_documents` - Document uploads
- ⚠️ Research tables (gap_analyses, source_organizations, etc.) - **Check if applied**

**Verification After Migration:**
```sql
-- Check specific table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'project_methodology';

-- List all RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

### **🔐 Security Best Practices**

**Environment Variables Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key_from_dashboard]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key_from_dashboard]
```

**Service Role Key Protection:**
- ✅ Never expose in client-side code
- ✅ Only use in API routes or server components
- ✅ Grants full database access (bypass RLS)
- ⚠️ Rotate if compromised

**Production Security for API Endpoints:**
```typescript
// Add to /api/admin/* routes before deployment
const ALLOWED_IPS = ['YOUR_IP_ADDRESS']
const API_KEY = process.env.ADMIN_API_KEY

// IP whitelist check
const ip = request.headers.get('x-forwarded-for')
if (!ALLOWED_IPS.includes(ip)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### **🚨 Troubleshooting Migration Issues**

**Error: "Table already exists"**
- ✅ This is OK! Use `CREATE TABLE IF NOT EXISTS` in migrations
- ✅ Safe to re-run migrations with this error

**Error: "Permission denied"**
- Check RLS policies aren't blocking service role
- Use service role key, not anon key for migrations

**Error: "Cannot connect to API"**
- Ensure dev server is running: `npm run dev`
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`

**Error: "Migration causes screen jumping / 404s"**
- Table doesn't exist yet, apply migration ASAP
- Example: `project_methodology` table required for methodology page
- Graceful error handling in code helps but migration is the fix

---

## ⚡ **QUICK REFERENCE COMMANDS**

```bash
# 🚨 DEPLOYMENT CRISIS (Multiple consecutive failures)
npx vercel --prod --force    # FIRST ACTION - Force deployment

# 🗄️ SUPABASE MIGRATIONS
# Method 1: Manual (Recommended - Always Works)
# Go to: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new
# Copy/paste migration SQL and run

# Method 2: CLI (if you have connection string)
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Method 3: API endpoint (deprecated - requires dev server + RPC doesn't exist)
node scripts/execute-migration.js supabase/migrations/[file].sql

# Verify Supabase tables exist
# Run in SQL Editor: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

# Test Supabase authentication
node test-auth-config.js

# Automated deployment check (preferred for diagnosis)
bash scripts/auto-deploy-check.sh

# Check current state
git status
git log --oneline -5

# Test before deploy (enhanced with Chrome DevTools MCP)
npm run type-check && npm run build

# Verify deployment success
curl -s -w "%{http_code}" "https://stembotv1.vercel.app" -o /dev/null

# Automated fix attempt (after force deploy fails)
bash scripts/auto-deploy-fix.sh

# Emergency rollback
git reset --hard [WORKING_COMMIT]
git push origin main --force

# Document working state
git rev-parse HEAD > .working-commit

# Verify MCP tools
claude mcp list
```

---

**🔒 This protocol is mandatory for all changes. Protecting working functionality is more important than adding new features.**