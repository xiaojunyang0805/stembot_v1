# 🛡️ WORKING PROTOCOL

## ⚠️ **CRITICAL: Comprehensive Development & Deployment Protocols**

This document contains all essential protocols for protecting working functionality, automated testing, and efficient development workflows.

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

### **As of Last Documentation:**
- **Working Commit:** `4ee78499e8e0c4c707bd41fafc014e748512f051`
- **Date:** `2025-01-27`
- **Working Domain:** `https://stembotv1.vercel.app`
- **Working Features:**
  - ✅ Homepage with proper styling
  - ✅ User authentication flow (login/logout)
  - ✅ Dashboard functionality
  - ✅ Error pages with inline styles
  - ✅ Loading pages with animations
  - ✅ 404 pages with navigation
  - ✅ Build compiles successfully

### **Known Issues (Accept These, Don't Break Working Parts):**
- Domain routing complexity due to repository split
- Tailwind CSS build inconsistencies
- [Other non-critical issues]

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

### **Prevention Checklist:**
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

## ⚡ **QUICK REFERENCE COMMANDS**

```bash
# Check current state
git status
git log --oneline -5

# Test before deploy (enhanced with Chrome DevTools MCP)
npm run type-check && npm run build

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