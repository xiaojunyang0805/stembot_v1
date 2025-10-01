# Claude Automated Deployment Workflow

This workflow enables Claude to systematically check, diagnose, and fix Vercel deployment issues.

## Phase 1: Automated Diagnosis

**Claude Command:**
```
Run the deployment check script and analyze the results:
bash scripts/auto-deploy-check.sh
```

**Claude Analysis Prompt:**
```
Based on the deployment check results:
1. Identify specific error patterns (404, 500, timeout, stale deployment)
2. Determine root cause category (code issue, deployment pipeline, environment)
3. Generate specific fix recommendations
4. Assess urgency level (critical, warning, minor)
```

## Phase 2: Systematic Error Fixing

### Strategy A: Deployment Pipeline Issues (Most Common)
**Symptoms:** 404 on new API routes, stale buildDate
**Claude Action:**
```
1. Run: bash scripts/auto-deploy-fix.sh
2. Monitor progress and deployment logs
3. If fix fails, escalate to manual Vercel dashboard intervention
```

### Strategy B: Code/Build Issues
**Symptoms:** 500 errors, build failures
**Claude Action:**
```
1. Run: npm run type-check
2. Run: npm run build
3. If errors found, fix specific issues:
   - Import path problems
   - Missing environment variables
   - TypeScript compilation errors
4. Test fix: npm run build
5. Deploy: git add . && git commit && git push origin main
```

### Strategy C: Environment/Configuration Issues
**Symptoms:** Specific APIs fail, others work
**Claude Action:**
```
1. Check environment variables in API routes
2. Add graceful fallbacks for missing env vars
3. Test API routes locally: npm run dev
4. Deploy with fixes
```

## Phase 3: Verification Loop

**Claude Verification Protocol:**
```
1. Wait 2-3 minutes for deployment
2. Test endpoints:
   curl -s "https://stembotv1.vercel.app/api/version"
   curl -s "https://stembotv1.vercel.app/api/ai/search-strategy"
   curl -s "https://stembotv1.vercel.app/api/test-deployment"
3. Compare timestamps and status codes
4. If still failing, escalate fix strategy
5. If successful, document resolution
```

## Phase 4: Learning and Documentation

**After Successful Fix:**
```
1. Document root cause in WORKING_PROTOCOL.md
2. Update automation scripts if new patterns found
3. Add prevention measures
4. Update deployment verification checklist
```

## Quick Reference Commands for Claude

### Immediate Diagnosis
```bash
# Check deployment health
curl -s "https://stembotv1.vercel.app/api/version" | jq '.buildDate'
git log -1 --format="%ci %h %s"

# Run comprehensive check
bash scripts/auto-deploy-check.sh
```

### Automated Fixing
```bash
# Try automated fix
bash scripts/auto-deploy-fix.sh

# Manual force redeploy
npx vercel --prod --force

# Local validation first
npm run type-check && npm run build
```

### Real-time Monitoring
```bash
# Watch deployment status
watch -n 30 'curl -s "https://stembotv1.vercel.app/api/version" | jq ".buildDate, .timestamp"'

# Check multiple endpoints
for endpoint in "version" "ai/search-strategy" "test-deployment"; do
  echo "$endpoint: $(curl -s -w "%{http_code}" -o /dev/null "https://stembotv1.vercel.app/api/$endpoint")"
done
```

## Success Criteria

✅ **Deployment Healthy When:**
- All API endpoints return 200 status
- buildDate is recent (< 2 hours old)
- New features accessible on live site
- No console errors in browser

❌ **Escalate to Manual When:**
- Automated fix fails after 3 attempts
- Build errors that can't be auto-resolved
- Vercel dashboard shows service issues
- Authentication/permission problems

## Integration with WORKING_PROTOCOL.md

This workflow complements the documented procedures in WORKING_PROTOCOL.md:
- Automated scripts handle routine deployment issues
- Manual procedures for complex problems
- Comprehensive documentation for future reference
- Learning loop to improve automation

## Example Claude Session

```
User: "I see Vercel build errors, can you check it?"

Claude:
1. [Runs] bash scripts/auto-deploy-check.sh
2. [Analyzes] Results show 404 on new API routes, stale deployment
3. [Executes] bash scripts/auto-deploy-fix.sh
4. [Monitors] Deployment progress for 5 minutes
5. [Verifies] All endpoints return 200, buildDate updated
6. [Reports] "✅ Deployment fixed via force redeploy. Issue was stale deployment pipeline."
```

This creates a complete automated workflow for systematic deployment troubleshooting and fixing.