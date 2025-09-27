# 🚨 DEPLOYMENT TROUBLESHOOTING GUIDE

## **Issue: Main Domain Shows Different Content Than Working Domain**

### **Symptoms:**
- Working domain (e.g., `project-abc123-user.vercel.app`) shows latest changes
- Main domain (e.g., `project.vercel.app`) shows old content
- Debug indicators or new features missing on main domain
- Recent commits don't appear on main domain

### **Root Cause: Branch Mismatch**
Vercel is configured to deploy from a different branch than where you're developing.

### **Diagnosis Steps:**
1. **Check Vercel Dashboard:**
   - Go to project → Settings → Git
   - Look for "Production Branch" setting
   - Note which branch it's set to (usually `main` or `master`)

2. **Check Current Development Branch:**
   ```bash
   git branch --show-current
   ```

3. **Compare Recent Commits:**
   ```bash
   git log --oneline -5  # Check current branch
   git log --oneline -5 origin/master  # Check master branch
   git log --oneline -5 origin/main    # Check main branch
   ```

### **Solution Options:**

#### **Option A: Sync Branches (Recommended)**
```bash
# If Vercel deploys from master, sync master with your current branch
git checkout master
git merge main  # or whatever branch you're developing on
git push origin master

# If Vercel deploys from main, sync main with your current branch
git checkout main
git merge feature-branch  # or whatever branch you're developing on
git push origin main
```

#### **Option B: Change Vercel Production Branch**
1. Go to Vercel Dashboard → Project → Settings → Git
2. Change "Production Branch" to match your development branch
3. Redeploy

#### **Option C: Switch Development to Production Branch**
```bash
# Switch development to whatever branch Vercel uses
git checkout master  # or main, depending on Vercel setting
# Continue development on this branch
```

### **Prevention:**
- Always check which branch Vercel deploys from before starting work
- Keep production branch synchronized with development
- Add deployment debug indicators to catch mismatches early
- Test main domain URL, not just working domain URLs

### **Quick Commands:**
```bash
# Check current branch
git branch --show-current

# Check Vercel production branch (look at .vercel/project.json or dashboard)
# Sync branches if needed
git checkout [production-branch]
git merge [development-branch]
git push origin [production-branch]
```

---
*Last Updated: Sep 27, 2025 - Domain Routing Issue Resolution*