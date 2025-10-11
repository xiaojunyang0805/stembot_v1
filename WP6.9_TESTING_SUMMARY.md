# WP6.9 Testing - Ready to Execute

**Status:** ✅ Testing framework complete, ready for manual execution
**Date:** 2025-10-11
**Environment:** https://stembotv1.vercel.app (Production, TEST mode)

---

## 📦 Deliverables Created

### 1. **WP6.9_BILLING_TESTING_GUIDE.md** (800+ lines)
Comprehensive testing guide covering all scenarios:

**✅ Test Scenarios (1-8):**
- Scenario 1: New User Signup → Free Tier (default limits, blocking)
- Scenario 2: Free → Student Pro Upgrade (complete flow)
- Scenario 3: Subscription Management (portal, cancellation)
- Scenario 4: Subscription Expiration (downgrade logic)
- Scenario 5: Failed Payment (grace period)
- Scenario 6: Webhook Failures (retry mechanisms)
- Scenario 7: Edge Cases (race conditions, timezone, etc.)
- Scenario 8: Usage Limit Edge Cases (boundary testing)

**✅ Additional Test Suites:**
- Error Handling Tests
- Performance Tests
- Security Tests

**✅ Tools & Resources:**
- SQL debugging queries
- Stripe CLI commands
- 30-minute quick smoke test
- Test results documentation template

---

### 2. **WP6.9_TEST_EXECUTION_LOG.md** (detailed checklist)
Step-by-step execution log with:
- Checkboxes for each test step
- Expected vs Actual result fields
- Screenshot capture points
- SQL verification queries
- Console inspection guidance
- Pass/Fail tracking
- Issue documentation sections

---

## 🔍 Implementation Verification Complete

### ✅ Code Review Confirmed:

**Billing API Routes (All Present):**
```
✅ /api/billing/create-checkout - Stripe Checkout session creation
✅ /api/billing/portal - Customer portal access
✅ /api/billing/webhooks - Stripe webhook handler
✅ /api/billing/subscription - Subscription queries
✅ /api/billing/usage - Usage tracking
✅ /api/billing/status - Billing status check
```

**Usage Enforcement Middleware:**
```
✅ enforceProjectLimit() - Blocks project creation at limit
✅ enforceAIUsageLimit() - Blocks AI interactions at limit
✅ incrementAIUsageForRequest() - Atomic usage increment
✅ Returns 402 Payment Required with upgrade message
```

**Helper Libraries:**
```
✅ checkProjectLimit() - Returns limit status
✅ checkAIUsageLimit() - Returns usage status
✅ getUserSubscriptionWithStatus() - Fetches subscription
✅ incrementAIUsage() - Atomic database increment
✅ updateProjectCount() - Updates project count
```

**Tier Limits Configuration:**
```
Free:        1 project,  30 AI/month
Student Pro: 10 projects, unlimited AI (€10/month)
Researcher:  unlimited,  unlimited AI (€25/month)
```

---

## 🚀 How to Execute Tests

### **Option 1: Quick Smoke Test (30 minutes)**

```bash
# Open testing guide
code WP6.9_BILLING_TESTING_GUIDE.md

# Jump to "Quick Test Checklist" section
# Follow 11-step smoke test
```

**Quick Test Steps:**
1. Sign up new user → free tier
2. Create 1 project → succeeds
3. Try 2nd project → blocked
4. Click upgrade → Stripe Checkout
5. Pay with 4242 4242 4242 4242 → succeeds
6. Verify Student Pro tier
7. Create 2nd project → now succeeds
8. Make 31+ AI interactions → unlimited
9. Open customer portal → works
10. Cancel subscription → cancel_at_period_end
11. Check payment history → visible

---

### **Option 2: Full Testing (4-6 hours)**

```bash
# Open execution log
code WP6.9_TEST_EXECUTION_LOG.md

# Execute Scenarios 1-8 sequentially
# Document results in the log file
```

**Full Test Coverage:**
- ✅ All 8 scenarios (70+ individual tests)
- ✅ Error handling tests
- ✅ Performance tests
- ✅ Security tests
- ✅ Edge case testing

---

## 🧪 Testing Tools Available

### **Test Account:**
```
Email: 601404242@qq.com
Password: Woerner6163418=
Auth Type: Custom JWT (API routes)
```

**OR create fresh account:**
```
Use Gmail + trick: yourname+test1@gmail.com
All emails go to yourname@gmail.com
```

---

### **Stripe Test Cards:**
```
Success:     4242 4242 4242 4242 (any future expiry, any CVC)
Declined:    4000 0000 0000 0002
Auth Failed: 4000 0000 0000 0341
3D Secure:   4000 0000 0000 3220 (test authentication flow)
```

---

### **Supabase SQL Editor:**
```
URL: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new

Quick Queries:
-- Check user subscription
SELECT * FROM subscriptions WHERE user_id = '{user_id}';

-- Check usage
SELECT * FROM usage_tracking WHERE user_id = '{user_id}' AND month = '2025-10';

-- Check payment history
SELECT * FROM payment_history WHERE user_id = '{user_id}' ORDER BY created_at DESC;
```

---

### **Stripe Dashboard:**
```
Test Mode: https://dashboard.stripe.com/test/dashboard

Check:
- Customers (search by email)
- Subscriptions (status, metadata)
- Payments (successful charges)
- Webhooks (delivery logs)
```

---

### **Vercel Logs:**
```
URL: https://vercel.com/stembot/logs

Filter by:
- /api/billing/* (checkout, webhooks)
- /api/projects/create (limit enforcement)
- /api/ai/* (usage tracking)
```

---

## 📊 Expected Test Results

### **Scenario 1 (Free Tier):**
```
Expected Pass Rate: 100% (7/7 tests)
Critical: Project limit at 1, AI limit at 30
```

### **Scenario 2 (Upgrade):**
```
Expected Pass Rate: 100% (10/10 tests)
Critical: Stripe Checkout works, DB updates, limits increase
```

### **Scenario 3-8 (Advanced):**
```
Expected Pass Rate: 80-90%
May find edge cases or minor issues
```

---

## ⚠️ Known Considerations

### **Testing Limitations:**
1. **Chrome DevTools MCP** - Browser instance conflict (manual testing required)
2. **Webhook Testing** - May need Stripe CLI for local testing
3. **Time-Based Tests** - Expiration requires manual date simulation

### **Potential Issues to Watch:**
1. **Race Conditions** - Concurrent project/AI requests
2. **Month Rollover** - Usage reset timing
3. **Webhook Delays** - Subscription status lag
4. **RLS Policies** - Ensure proper data isolation

---

## 🐛 Issue Reporting Template

When you find issues, document using this format:

```markdown
### Issue: [Brief Description]

**Scenario:** Test Scenario X, Step Y
**Severity:** Critical / Major / Minor
**Type:** Bug / UX Issue / Edge Case

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Behavior:**
...

**Actual Behavior:**
...

**Screenshots:**
[Attach screenshots]

**Database State:**
[SQL query results showing the issue]

**Console Errors:**
[Console output if relevant]

**Suggested Fix:**
[Optional: Your recommendation]
```

---

## ✅ Testing Checklist

Before you start testing:

- [ ] Review WP6.9_BILLING_TESTING_GUIDE.md
- [ ] Review WP6.9_TEST_EXECUTION_LOG.md
- [ ] Have Stripe test cards ready
- [ ] Have Supabase SQL Editor open
- [ ] Have Stripe Dashboard open
- [ ] Open browser DevTools (F12)
- [ ] Have screenshot tool ready
- [ ] Create fresh test account (or use 601404242@qq.com)

During testing:

- [ ] Document EVERY test result (pass/fail)
- [ ] Take screenshots at key points
- [ ] Capture SQL query results
- [ ] Note any console errors/warnings
- [ ] Test both success and failure paths
- [ ] Check edge cases and boundaries

After testing:

- [ ] Fill in "Overall Test Results" section in log
- [ ] List all issues found (critical vs minor)
- [ ] Calculate pass rate for each scenario
- [ ] Document recommendations
- [ ] Create GitHub issues for bugs found

---

## 📞 Support Resources

**Documentation:**
- CLAUDE.md - Project instructions
- Development_02.md - Development notes
- STRIPE_SETUP.md - Stripe configuration

**External:**
- Stripe Testing: https://docs.stripe.com/testing
- Supabase Docs: https://supabase.com/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 🎯 Success Criteria

**Minimum Viable Testing (MVP):**
- ✅ Scenarios 1 & 2 complete (free tier + upgrade)
- ✅ No critical bugs found
- ✅ Core billing flow works end-to-end

**Comprehensive Testing (Ideal):**
- ✅ All 8 scenarios complete
- ✅ All error handling tested
- ✅ Security tests passed
- ✅ Performance acceptable
- ✅ Edge cases documented

**Production Ready:**
- ✅ 95%+ test pass rate
- ✅ No critical or major bugs
- ✅ All security tests passed
- ✅ Webhook reliability confirmed
- ✅ User experience smooth and intuitive

---

## 📝 Next Steps

1. **Start Testing** - Begin with Scenario 1 (30 minutes)
2. **Document Results** - Use WP6.9_TEST_EXECUTION_LOG.md
3. **Fix Issues** - Address any critical bugs found
4. **Retest** - Verify fixes work
5. **Continue** - Move to Scenario 2, then 3-8
6. **Report** - Summarize findings in Development_02.md

---

**Testing framework is ready. Good luck! 🚀**

*For questions or issues during testing, refer to CLAUDE.md debugging protocols.*
