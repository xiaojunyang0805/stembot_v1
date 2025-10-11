# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL STYLING REQUIREMENTS

### **ALWAYS USE INLINE STYLES - NEVER TAILWIND CLASSES**
**IMPORTANT**: This project has persistent Tailwind CSS build/deployment issues.

**MANDATORY STYLING APPROACH:**
- ✅ **ALWAYS use inline styles**: `style={{color: '#111827', fontSize: '1rem'}}`
- ❌ **NEVER use Tailwind classes**: `className="text-gray-900 text-base"`
- ✅ **Include both className AND style**: Keep Tailwind classes for semantic meaning but ALWAYS add inline styles as fallback
- ✅ **Example correct approach**: `<div className="bg-white p-4" style={{backgroundColor: 'white', padding: '1rem'}}>`

**This applies to ALL UI components, pages, and styling tasks regardless of what the user requests.**

---

## 🛡️ WORKING STATE PROTECTION PROTOCOL

### **MANDATORY BEFORE ANY CHANGES:**
**⚠️ CRITICAL: Protect days of work from being destroyed in minutes**

#### **Pre-Change Checklist:**
1. **Document Working State**: Test `https://stembotv1.vercel.app` - record what works NOW
2. **Risk Assessment**: What existing functionality could this change break?
3. **Incremental Testing**: Run `npm run type-check && npm run build` before any deploy
4. **Rollback Ready**: Keep last working commit hash accessible: `cat .working-commit`

#### **Emergency Rollback Procedure:**
```bash
git reset --hard $(cat .working-commit)
git push origin main --force
```

#### **Current Protected Baseline:**
- **Working Commit:** `9a1792c` (Storage & Usage fixed)
- **Protected Features:** Homepage, Auth Flow, Dashboard, Settings Pages, Inline Styles, Successful Builds
- **Date Protected:** 2025-01-11

#### **🚨 CRITICAL DEPLOYMENT LESSONS:**

**1. Branch Mismatch Issue (Sep 27, 2025):**
- **Problem:** Main domain served different content because Vercel deployed from `master` branch while development was on `main` branch
- **Prevention:**
  - ALWAYS verify which branch Vercel deploys from (Settings → Git → Production Branch)
  - Keep main and master branches synchronized
  - Test MAIN DOMAIN, not just working domain URLs after deployment

**2. Vercel Deployment Pipeline Failure (Oct 1, 2025):**
- **Problem:** 12+ consecutive deployment failures despite successful local builds
- **Root Cause:** Vercel deployment pipeline became stuck/corrupted
- **Solution:** `npx vercel --prod --force` to bypass cache
- **Lesson:** Local build success ≠ Vercel deployment success

**🚨 NEVER BREAK WORKING FUNCTIONALITY FOR "IMPROVEMENTS" - ADDITIVE CHANGES ONLY!**

---

## 🔍 DEBUGGING METHODOLOGY

### **Case Study: Storage Page Flashing Issue (Jan 11, 2025)**

**Initial Symptom:** Storage & Usage page showing infinite loading spinner ("flashing") for Supabase auth users

**Debugging Process:**
1. **Tested with Custom JWT Auth Account** (601404242@qq.com)
   - Initially worked, masked the real issue
   - Revealed dual authentication system complexity

2. **User Corrected Assumption:**
   - User reported issue persisted with Google/Supabase auth
   - Found 290+ "Multiple GoTrueClient instances" warnings in console

3. **Root Cause Analysis:**
   - **First Issue:** Direct Supabase queries with manual `.eq('user_id', user.id)` conflicted with RLS
   - **Second Issue:** Multiple `createClientComponentClient()` calls creating 290+ client instances
   - This caused authentication state race conditions

4. **Solution Implemented:**
   - **Phase 1:** Replaced direct queries with `getUserProjects()` API (works for both auth types)
   - **Phase 2:** Created singleton Supabase client at component level using `useState(() => createClientComponentClient())`

**Key Lessons:**
- ✅ **Test with actual user account** - Test accounts may use different auth paths
- ✅ **Check browser console** - 290+ warnings revealed the real issue
- ✅ **Understand dual auth systems** - Custom JWT vs Supabase auth need different approaches
- ✅ **Create singletons for client instances** - Prevent multiple auth client creation
- ✅ **Monitor network requests** - Reveals which code path is actually executing
- ❌ **Don't assume initial fix solves all cases** - Verify with both auth types

**Chrome DevTools MCP Tools Used:**
```bash
# Console error detection
"Check console logs for https://stembotv1.vercel.app"

# Network request monitoring
"Monitor network requests for https://stembotv1.vercel.app"

# Visual verification
"Take screenshot of https://stembotv1.vercel.app/settings/storage"
```

---

## 🔑 TEST ACCOUNT CREDENTIALS

### **Production Testing Account**
- **Email:** 601404242@qq.com
- **Password:** Woerner6163418=
- **Auth Type:** Custom JWT (uses API routes)
- **Usage:** For automated testing and custom auth path verification

### **User's Personal Account**
- **Email:** xiaojunyang0805@gmail.com
- **Auth Type:** Google/Supabase OAuth
- **Usage:** Real-world testing with Supabase auth

**IMPORTANT:** Always test with BOTH accounts when working on authentication-related features!

---

## Development Commands

### Core Development
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run analyze` - Analyze bundle size with webpack-bundle-analyzer

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changing files
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI mode

### Database (Supabase)
- `npm run db:generate` - Generate TypeScript types from Supabase schema
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

### Documentation
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

---

## 📝 Documentation Protocol

### **Development Notes - ALWAYS ADD TO END OF FILE**
**CRITICAL**: When documenting completed work in `Development_02.md`:

❌ **NEVER add notes to the top of the file**
✅ **ALWAYS add new development notes to the END of the file**

**Timestamp Format - MANDATORY:**
- ✅ **Format:** `HH:MM, DD/MM, YYYY` (24-hour time, European date)
- ✅ **Extract from git log:** Use `git log --pretty=format:"%H|%ai|%s"` to get actual commit timestamps
- ✅ **Example:** `00:31, 11/10, 2025` (from commit timestamp `2025-10-11 00:31:02 +0200`)
- ✅ **ALWAYS use real git commit time** - NEVER use pseudo timestamps or "Day ##"
- ❌ **WRONG:** "Day 11 Morning" or "10:00 AM" or "Oct 11"
- ✅ **RIGHT:** "00:31, 11/10, 2025" (from actual git commit)

**How to Extract Timestamps:**
```bash
# Get commit timestamp for specific work
git log --pretty=format:"%ai|%s" --grep="WP6.6\|billing" | head -5

# Example output:
# 2025-10-11 00:31:02 +0200|feat: Complete WP6.6 Billing & Plans Settings Page
# Convert to format: 00:31, 11/10, 2025
```

**Format for New Entries:**
```markdown
---

## Quick Summary - [Feature Name]

**WP#-#: [Task Name] (HH:MM, DD/MM, YYYY)** ✅
- Brief bullet points of what was implemented
- Key files created/modified
- Notable technical decisions
- Dependencies added (if any)

---
```

**Reason**: The user maintains chronological order with latest work at the bottom. This preserves the development timeline and makes it easy to see progression. **Real git timestamps provide accurate historical record.**

---

## Project Architecture

### Framework & Stack
- **Next.js 14** with App Router for full-stack React application
- **TypeScript** with strict type checking enabled
- **Tailwind CSS** with custom design system (use inline styles as fallback)
- **Supabase** for database, authentication, and real-time features
- **Radix UI** as the foundation for accessible component primitives

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── auth/              # Authentication pages (login, register)
│   ├── dashboard/         # Student dashboard and project management
│   ├── settings/          # User settings pages (profile, notifications, storage, etc.)
│   ├── projects/          # Project management pages
│   └── billing/           # Subscription and payment pages
├── components/
│   ├── ui/                # Reusable UI components based on Radix UI
│   └── settings/          # Settings-specific components
├── lib/
│   ├── database/          # Database query functions
│   ├── storage/           # Storage monitoring utilities
│   ├── utils/             # Utility functions and helpers
│   └── supabase.ts        # Supabase client configuration
└── types/                 # TypeScript type definitions
```

### Key Architecture Patterns

**Dual Authentication System:**
- **Custom JWT Auth:** Uses API routes with service role credentials (test account)
- **Supabase Auth:** Standard OAuth/email auth with RLS (user accounts)
- **Pattern:** Use `getUserProjects()` and similar API wrappers that handle both auth types

**Supabase Client Management:**
- ✅ **Create singleton instances:** `const [supabase] = useState(() => createClientComponentClient())`
- ❌ **Avoid multiple instances:** Don't call `createClientComponentClient()` in every function
- **Why:** Prevents "Multiple GoTrueClient instances" warnings and auth state race conditions

**Component Architecture:** Uses Radix UI primitives with custom styling via inline styles. Components follow shadcn/ui patterns with variants using class-variance-authority.

**Path Aliases**: Configured in tsconfig.json:
- `@/*` maps to `src/*`
- `@/components/*` maps to `src/components/*`
- `@/lib/*` maps to `src/lib/*`

**Authentication**: Supabase Auth with Next.js App Router integration. Route groups organize authenticated vs public pages.

---

## Development Guidelines

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- No implicit any, strict null checks, and unused variable detection
- Custom path mapping for clean imports

### Styling Conventions
**🚨 CRITICAL: ALWAYS USE INLINE STYLES DUE TO TAILWIND BUILD ISSUES**
- **PRIMARY**: Use inline styles for all styling: `style={{backgroundColor: 'white', padding: '1rem'}}`
- **SECONDARY**: Keep Tailwind classes for semantic reference but they may not work
- **COLORS**: Use hex values in inline styles: `#111827` (gray-900), `#3b82f6` (blue-600), `#22c55e` (green-600)
- **SPACING**: Use rem/px values: `1rem` (4), `1.5rem` (6), `2rem` (8)
- **LAYOUT**: Use CSS Grid/Flexbox in inline styles: `display: 'grid'`, `gridTemplateColumns: '2fr 1fr'`

### Component Development
- Follow Radix UI + Tailwind patterns from existing UI components
- Use `forwardRef` for components that need DOM access
- Implement proper accessibility with ARIA attributes
- **Create singleton Supabase clients** to avoid multiple instances

### Database Integration
- Supabase types are generated via `npm run db:generate`
- Use proper TypeScript interfaces for database models
- **Use API wrappers** (`getUserProjects()`, etc.) instead of direct Supabase queries for dual auth compatibility
- **Avoid manual user_id filtering** - RLS policies handle this automatically

### Performance Considerations
- Next.js Image optimization configured for educational content
- Bundle analysis available via `npm run analyze`
- Lazy loading and code splitting implemented
- SVG handling via @svgr/webpack

---

## Error Handling & Debugging

### Common Issues & Solutions

**1. "Multiple GoTrueClient instances" Warning**
- **Cause:** Creating multiple Supabase client instances
- **Solution:** Create singleton client: `const [supabase] = useState(() => createClientComponentClient())`
- **File:** Any component using Supabase

**2. Empty Data Despite Successful Queries**
- **Cause:** Manual `.eq('user_id', user.id)` conflicts with RLS or wrong auth type
- **Solution:** Use API wrappers like `getUserProjects()` or rely solely on RLS
- **File:** Settings pages, dashboard components

**3. 404 Errors on Table Queries**
- **Cause:** Wrong table name (e.g., `research_projects` vs `projects`)
- **Solution:** Check database schema: `001_create_research_database.sql`
- **Verification:** Check Supabase dashboard table list

**4. Build Errors**
1. Run `npm run type-check` to identify TypeScript issues
2. Check `npm run lint` for code quality problems
3. Verify path aliases match tsconfig.json configuration
4. For Supabase errors, ensure environment variables are configured

---

## Chrome DevTools MCP Integration

### **🔧 Automated UI Testing Protocol**
✅ **Chrome DevTools MCP Server**: Installed and connected (`claude mcp list`)

**Replace Manual DevTools with Automated Commands:**
```bash
# Performance analysis
"Check the performance of https://stembotv1.vercel.app"

# Visual inspection & screenshots
"Take screenshot of https://stembotv1.vercel.app"

# Console error detection
"Check console logs for https://stembotv1.vercel.app"

# Network request monitoring
"Monitor network requests for https://stembotv1.vercel.app"

# Responsive design testing
"Test responsive design for https://stembotv1.vercel.app"

# DOM & CSS inspection
"Inspect DOM elements and CSS for layout issues"
```

**Enhanced Commands After Making Changes:**
1. `npm run type-check` - Verify TypeScript compatibility
2. `npm run lint` - Check code quality
3. `npm run build` - Ensure build succeeds
4. **Chrome DevTools MCP**: "Check performance and console errors for https://stembotv1.vercel.app"
5. **Visual Verification**: "Take screenshot and inspect for styling issues"

**Integrated Deployment Workflow:**
```bash
# 1. Code validation
npm run type-check && npm run build

# 2. Automated UI inspection (Chrome DevTools MCP replaces manual DevTools)
"Check performance, console logs, and visual layout for https://stembotv1.vercel.app"

# 3. Deploy automatically
git add . && git commit -m "..." && git push origin main
```

---

## 🚨 VERCEL DEPLOYMENT PROTOCOLS

### **Deployment Crisis Response**
When deployment failures detected, follow this sequence:

```bash
# STEP 1: Check deployment status (30 seconds)
curl -s "https://stembotv1.vercel.app/api/version"

# STEP 2: If multiple consecutive failures → FORCE DEPLOY FIRST
npx vercel --prod --force
# DON'T debug code when pipeline is stuck!

# STEP 3: Monitor resolution (2-3 minutes)
curl -s "https://stembotv1.vercel.app/api/version"

# STEP 4: Only if force deploy fails → Debug code issues
npm run type-check && npm run build
```

### **Quick Deployment Verification**
```bash
# 1. Basic availability check
curl -s -I "https://stembotv1.vercel.app" | head -1

# 2. API health check
curl -s "https://stembotv1.vercel.app/api/version"

# 3. Automated UI inspection (Chrome DevTools MCP)
"Check console errors and performance for https://stembotv1.vercel.app"
```

---

## 🗄️ SUPABASE CONFIGURATION

### **Manual SQL Migration (ONLY Working Method)**

**All automated methods failed - Use SQL Editor:**

1. **Open:** https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new
2. **Copy** migration from `supabase/migrations/[filename].sql`
3. **Paste** into SQL Editor
4. **Click** "Run" button
5. **Ignore** "already exists" errors (safe)

**Verification:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

### **Environment Variables Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key_from_dashboard]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key_from_dashboard]
```

---

## ⚡ QUICK REFERENCE COMMANDS

```bash
# 🚨 DEPLOYMENT CRISIS (Multiple consecutive failures)
npx vercel --prod --force    # FIRST ACTION - Force deployment

# 🗄️ SUPABASE MIGRATIONS (Manual SQL Editor Only)
# Open: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new
# Copy migration → Paste → Run → Ignore "already exists" errors

# Test before deploy
npm run type-check && npm run build

# Check console warnings (use Chrome DevTools MCP)
"Check console logs for https://stembotv1.vercel.app"

# Verify deployment success
curl -s "https://stembotv1.vercel.app/api/version"

# Emergency rollback
git reset --hard [WORKING_COMMIT]
git push origin main --force

# Document working state
git rev-parse HEAD > .working-commit
```

---

## 🎯 DEVELOPMENT WORKFLOW

### Standard Workflow:
```bash
# 1. Make changes
# 2. Test locally (optional)
npm run dev

# 3. Validate code
npm run type-check && npm run build

# 4. Deploy
git add . && git commit -m "..." && git push origin main

# 5. Wait 2-3 minutes for Vercel deployment

# 6. Verify with Chrome DevTools MCP
"Check console logs and performance for https://stembotv1.vercel.app"
"Take screenshot to verify visual changes"
```

### When Things Go Wrong:
1. Check console for warnings/errors using Chrome DevTools MCP
2. Verify network requests aren't failing
3. Test with both auth accounts (JWT and Supabase)
4. Force deployment if Vercel is stuck
5. Rollback if necessary

---

**🔒 This guidance is mandatory for all development work. Protecting working functionality is more important than adding new features.**
