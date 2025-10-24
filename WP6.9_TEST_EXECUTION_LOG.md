s# WP6.9 Billing System - Test Execution Log

**Start Date:** 2025-10-11
**Environment:** https://stembotv1.vercel.app (Production - TEST mode)
**Tester:** Automated Testing + Manual Verification
**Deployment Version:** adabfd5 (2025-10-11T13:12:35.826Z)

---

## 🧪 TEST SCENARIO 1: New User Signup → Free Tier

### Test Preparation
- [ ] Close all browser sessions to start fresh
- [ ] Open incognito/private window
- [ ] Navigate to https://stembotv1.vercel.app
- [ ] Open DevTools (F12) and go to Console tab

### Step 1.1: Create New Account

**Action:**
```
1. Click "Sign Up" or navigate to /auth/register
2. Use email: stembot.test+{timestamp}@gmail.com (or your test email)
3. Fill in password and details
4. Submit registration form
```

**Expected Result:**
- Account created successfully
- Redirected to dashboard
- No console errors

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________
- [ ] ⚠️ Warning/Issue: _______________

**Screenshots:**
- [ ] Registration form
- [ ] Success confirmation
- [ ] Dashboard after signup

---

### Step 1.2: Verify Default Subscription Created

**Action:**
```sql
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new

SELECT
  id,
  user_id,
  tier,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  created_at
FROM subscriptions
WHERE user_id = '{NEW_USER_ID}';
```

**Expected Result:**
```
tier = 'free'
status = 'active'
stripe_customer_id = NULL
stripe_subscription_id = NULL
```

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________

**Data Captured:**
```
User ID: _______________
Tier: _______________
Status: _______________
```

---

### Step 1.3: Verify Usage Tracking Initialized

**Action:**
```sql
-- Run in Supabase SQL Editor:
SELECT
  user_id,
  month,
  ai_interactions_count,
  active_projects_count,
  created_at
FROM usage_tracking
WHERE user_id = '{NEW_USER_ID}'
AND month = '2025-10';
```

**Expected Result:**
```
ai_interactions_count = 0
active_projects_count = 0
month = '2025-10'
```

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________
- [ ] ⚠️ Record not created automatically - Is this expected?

**Data Captured:**
```
AI Interactions: _______________
Active Projects: _______________
```

---

### Step 1.4: Create First Project (Should Succeed)

**Action:**
```
1. Navigate to /projects/create
2. Fill in project details:
   - Title: "Test Project 1 - Free Tier"
   - Research Question: "Testing billing limits"
   - Methodology: Select any
3. Click "Create Project"
```

**Expected Result:**
- Project created successfully
- Redirected to project workspace or dashboard
- Project visible in project list
- active_projects_count = 1 in database

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________

**Verification:**
```sql
-- Check usage tracking updated:
SELECT active_projects_count
FROM usage_tracking
WHERE user_id = '{USER_ID}' AND month = '2025-10';

-- Expected: 1

-- Check project exists:
SELECT id, title, status
FROM projects
WHERE user_id = '{USER_ID}';
```

**Screenshots:**
- [ ] Project creation form
- [ ] Success confirmation
- [ ] Project in dashboard

---

### Step 1.5: Try to Create Second Project (Should Block)

**Action:**
```
1. Navigate to /projects/create again
2. Try to create another project:
   - Title: "Test Project 2 - Should Block"
   - Fill in other details
3. Click "Create Project"
```

**Expected Result:**
- ❌ **BLOCKED** with upgrade prompt
- Error message: "Project limit reached (1/1 active projects)"
- Upgrade CTA visible: "Upgrade to Student Pro for up to 10 active projects at €10/month"
- Cannot proceed without upgrade
- Project NOT created in database

**Actual Result:**
- [ ] ✅ Pass - Correctly blocked
- [ ] ❌ Fail - Project created (limit not enforced!)
- [ ] ⚠️ Warning shown but creation allowed (race condition?)

**UI Elements Verified:**
- [ ] Error message clear and visible
- [ ] Upgrade button present
- [ ] Upgrade button links to /settings/billing
- [ ] Message mentions Student Pro tier
- [ ] Message mentions 10 projects limit

**Console Check:**
```
Open Console:
- Look for errors related to usage limits
- Look for API call to /api/projects/create
- Check response: Should be 403 Forbidden or similar
```

**Screenshots:**
- [ ] Limit reached error message
- [ ] Upgrade prompt UI
- [ ] Console showing blocked API call

---

### Step 1.6: Use AI Interactions (First 30 Should Succeed)

**Action:**
```
1. Navigate to first project workspace
2. Open AI chat assistant
3. Make test interactions:
   - Interaction 1: "Hello"
   - Interaction 2: "What is machine learning?"
   - ... continue to 30 interactions

OR use API testing:
for i in {1..30}; do
  echo "Interaction $i"
  # Make AI request via UI
  sleep 2
done
```

**Expected Result:**
- All 30 interactions succeed
- ai_interactions_count increments correctly
- At 25/30: Warning appears: "Only 5 AI interactions remaining this month"
- At 30/30: No more warnings (at limit)

**Actual Result:**
- [ ] ✅ Pass - All 30 succeeded
- [ ] ❌ Fail - Some interactions blocked early
- [ ] ⚠️ Warning not shown at 25/30

**Progressive Testing:**
```
After 10 interactions:
SELECT ai_interactions_count FROM usage_tracking
WHERE user_id = '{USER_ID}' AND month = '2025-10';
Expected: 10

After 25 interactions:
Expected: 25 + warning banner

After 30 interactions:
Expected: 30 + no more available
```

**Screenshots:**
- [ ] AI chat after 10 interactions
- [ ] Warning at 25/30
- [ ] At limit (30/30)

---

### Step 1.7: Try 31st AI Interaction (Should Block)

**Action:**
```
1. With ai_interactions_count at 30
2. Try one more AI interaction
3. Type message and send
```

**Expected Result:**
- ❌ **BLOCKED** with upgrade message
- Error: "AI interaction limit reached (30/30 this month)"
- Upgrade CTA: "Upgrade to Student Pro for unlimited AI interactions at €10/month"
- Request NOT processed
- Usage counter stays at 30

**Actual Result:**
- [ ] ✅ Pass - Correctly blocked
- [ ] ❌ Fail - Interaction processed (limit not enforced!)
- [ ] ⚠️ Warning shown but request still processed

**Verification:**
```sql
SELECT ai_interactions_count
FROM usage_tracking
WHERE user_id = '{USER_ID}' AND month = '2025-10';

-- Expected: Still 30 (not incremented to 31)
```

**Console Check:**
```
Look for:
- API call to /api/ai/chat or similar
- Response: 403 Forbidden or 429 Too Many Requests
- Error message in response body
```

**Screenshots:**
- [ ] Limit reached error in chat
- [ ] Upgrade prompt
- [ ] Console showing blocked request

---

## ✅ Test Scenario 1 Summary

**Pass Criteria Checklist:**
- [ ] Default free subscription created automatically
- [ ] Usage tracking initialized at 0/0
- [ ] First project creation succeeds
- [ ] Second project creation blocked with upgrade prompt
- [ ] First 30 AI interactions succeed
- [ ] 31st AI interaction blocked with upgrade message
- [ ] All upgrade CTAs redirect to /settings/billing

**Results:**
- **Passed:** __ / 7
- **Failed:** __ / 7
- **Warnings:** __ / 7

**Critical Issues Found:**
1. _______________
2. _______________

**Minor Issues Found:**
1. _______________
2. _______________

**Edge Cases Discovered:**
1. _______________
2. _______________

---

## 🧪 TEST SCENARIO 2: Free → Student Pro Upgrade

### Test Preparation
- [ ] Have Test Scenario 1 completed (user at free tier, limits reached)
- [ ] Have Stripe test card ready: 4242 4242 4242 4242
- [ ] Clear any cached Stripe data
- [ ] Ensure test mode is active (check Stripe Dashboard)

### Step 2.1: Navigate to Billing Settings

**Action:**
```
Option A: Click upgrade button from limit prompt in Scenario 1
Option B: Navigate directly to /settings/billing
```

**Expected Result:**
- Billing page loads successfully
- Current plan shows "Free" tier with current limits (1 project, 30 AI/month)
- Student Pro plan card visible showing "€10/month"
- Researcher plan card visible showing "€25/month"
- "Upgrade" buttons visible on paid tier cards
- Page renders without errors

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________

**UI Verification:**
- [ ] Free tier badge visible
- [ ] Usage stats displayed correctly
- [ ] Plan comparison clear
- [ ] Pricing displayed in EUR
- [ ] All plan features listed

**Screenshots:**
- [ ] Full billing settings page
- [ ] Plan comparison section

---

### Step 2.2: Click "Upgrade to Student Pro"

**Action:**
```
1. Locate Student Pro plan card
2. Click "Upgrade" or "Subscribe" button
3. Observe behavior
```

**Expected Result:**
- API call to /api/billing/create-checkout
- Loading indicator appears briefly
- Redirect to Stripe Checkout page (checkout.stripe.com)
- Checkout page loads with:
  - €10/month subscription details
  - User email pre-filled
  - Stripe secure payment badge
  - Test mode indicator

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________

**Network Inspection:**
```
Open DevTools Network tab:
- Find: POST /api/billing/create-checkout
- Status: 200 OK
- Response contains: sessionId
- Redirect happens automatically
```

**Console Check:**
```
Look for:
- Stripe.js loaded successfully
- No errors during redirect
- Session ID in console (if logged)
```

**Screenshots:**
- [ ] Billing page with upgrade button highlighted
- [ ] Loading state during API call
- [ ] Stripe Checkout page loaded

---

### Step 2.3: Complete Payment with Test Card

**Action:**
```
1. On Stripe Checkout page, fill in:
   Email: (should be pre-filled)
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP/Postal: 12345

2. Click "Subscribe" button
3. Wait for processing (usually 2-5 seconds)
```

**Expected Result:**
- Payment processed successfully
- "Payment successful" confirmation
- Redirect to app URL: /settings/billing?session_id={checkout_session_id}
- No errors during checkout

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________

**Stripe Checkout Verification:**
- [ ] Card number accepted
- [ ] Test mode indicator visible
- [ ] Processing indicator shown
- [ ] Success message displayed
- [ ] Redirect happens automatically (within 5 seconds)

**Screenshots:**
- [ ] Filled checkout form
- [ ] Processing state
- [ ] Success confirmation

---

### Step 2.4: Verify Redirect to Success Page

**Action:**
```
1. After payment, observe redirect behavior
2. Check URL contains session_id parameter
3. Check page content
```

**Expected Result:**
- URL: /settings/billing?session_id={session_id}
- Success banner visible: "Subscription activated! Welcome to Student Pro" (or similar)
- Plan card shows "Student Pro" tier
- Limits updated in UI:
  - Projects: "10 active projects"
  - AI: "Unlimited" or "∞"
- Payment history shows first payment
- No loading spinners stuck
- No console errors

**Actual Result:**
- [ ] ✅ Pass
- [ ] ❌ Fail - Details: _______________

**UI Verification:**
- [ ] Success message clear and prominent
- [ ] Plan badge shows "Student Pro"
- [ ] Updated limits displayed
- [ ] Payment history populated
- [ ] All sections render correctly

**Console Check:**
```
Look for:
- No errors
- Successful API calls to fetch subscription
- No warnings about GoTrueClient
```

**Screenshots:**
- [ ] Success page with banner
- [ ] Updated plan card
- [ ] Payment history section

---

### Step 2.5: Verify Subscription Updated in Database

**Action:**
```sql
-- Run in Supabase SQL Editor:
SELECT
  id,
  user_id,
  tier,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM subscriptions
WHERE user_id = '{USER_ID}';
```

**Expected Result:**
```
tier = 'student_pro'
status = 'active'
stripe_customer_id = 'cus_...' (populated)
stripe_subscription_id = 'sub_...' (populated)
current_period_start = (recent timestamp, within last 5 minutes)
current_period_end = (start + 1 month, approximately)
cancel_at_period_end = false
updated_at = (recent timestamp)
```

**Actual Result:**
- [ ] ✅ Pass - All fields correct
- [ ] ❌ Fail - Details: _______________

**Stripe Dashboard Verification:**
```
1. Open Stripe Dashboard: https://dashboard.stripe.com/test/customers
2. Search for customer by email
3. Verify:
   - Customer created
   - Subscription active
   - Payment succeeded
   - Metadata includes tier: 'student_pro'
```

**Data Captured:**
```
Customer ID: _______________
Subscription ID: _______________
Period Start: _______________
Period End: _______________
```

---

### Step 2.6: Verify Can Now Create Multiple Projects

**Action:**
```
1. Navigate to /projects/create
2. Create 2nd project: "Test Project 2 - Student Pro"
3. Create 3rd project: "Test Project 3 - Student Pro"
4. Continue to 10th project if desired
5. Monitor for any warnings
```

**Expected Result:**
- Project 2 creation: ✅ Succeeds (no limit error)
- Project 3 creation: ✅ Succeeds
- ...
- Project 9 creation: ✅ Succeeds with warning "Last project slot available (9/10)"
- Project 10 creation: ✅ Succeeds
- Project 11 creation: ❌ Blocked (reached new limit)
- active_projects_count increments correctly in database

**Actual Result:**
- [ ] ✅ Pass - Projects 2-10 created successfully
- [ ] ❌ Fail - Still limited to 1 project (upgrade not working!)
- [ ] ⚠️ Some projects failed for other reasons

**Database Verification:**
```sql
-- Check usage updated:
SELECT active_projects_count
FROM usage_tracking
WHERE user_id = '{USER_ID}' AND month = '2025-10';

-- Expected: 2 or more (up to 10)

-- Check projects exist:
SELECT COUNT(*) as project_count
FROM projects
WHERE user_id = '{USER_ID}';

-- Expected: Matches active_projects_count
```

**Screenshots:**
- [ ] 2nd project created successfully
- [ ] Dashboard with multiple projects
- [ ] Warning at 9/10 projects

---

### Step 2.7: Verify AI Limit Increased to Unlimited

**Action:**
```
1. Check current AI usage (should be 30 from Scenario 1)
2. Make 31st AI interaction
3. Make 32nd, 33rd... up to 50th interaction
4. Observe no limits enforced
```

**Expected Result:**
- 31st interaction: ✅ Succeeds (no longer blocked!)
- 32nd-50th interactions: ✅ All succeed
- No limit warnings displayed
- No upgrade prompts
- ai_interactions_count continues incrementing past 30
- Usage UI shows "Unlimited" or "∞" for AI

**Actual Result:**
- [ ] ✅ Pass - Unlimited AI confirmed
- [ ] ❌ Fail - Still limited to 30 interactions
- [ ] ⚠️ Limit changed but not unlimited

**Database Verification:**
```sql
SELECT ai_interactions_count
FROM usage_tracking
WHERE user_id = '{USER_ID}' AND month = '2025-10';

-- Expected: > 30 (e.g., 50 if tested to 50)
```

**UI Verification:**
- [ ] Settings page shows "Unlimited AI"
- [ ] No counter shown (or shows count without limit)
- [ ] No warning banners

**Screenshots:**
- [ ] AI chat after 50+ interactions
- [ ] Usage stats showing unlimited

---

### Step 2.8: Verify Payment Recorded in History

**Action:**
```sql
-- Database check:
SELECT
  id,
  user_id,
  amount,
  currency,
  status,
  stripe_payment_intent_id,
  invoice_url,
  created_at
FROM payment_history
WHERE user_id = '{USER_ID}'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Database Result:**
```
amount = 1000 (€10.00 in cents)
currency = 'eur'
status = 'succeeded'
stripe_payment_intent_id = 'pi_...' (populated)
invoice_url = 'https://invoice.stripe.com/...' (populated)
created_at = (recent timestamp)
```

**Actual Result:**
- [ ] ✅ Pass - Payment recorded correctly
- [ ] ❌ Fail - No payment in history
- [ ] ⚠️ Payment recorded but incorrect amount/status

**UI Verification:**
```
1. Navigate to /settings/billing
2. Scroll to "Payment History" section
3. Verify first payment listed with:
   - Date
   - Amount: €10.00
   - Status: Succeeded/Paid
   - Invoice download link (optional)
```

**Stripe Dashboard Verification:**
```
1. Open Stripe Dashboard → Payments
2. Find payment for test customer
3. Verify:
   - Amount: €10.00
   - Status: Succeeded
   - Customer ID matches
   - Invoice generated
```

**Screenshots:**
- [ ] Payment history in app
- [ ] Stripe Dashboard showing payment

---

## ✅ Test Scenario 2 Summary

**Pass Criteria Checklist:**
- [ ] Upgrade button redirects to Stripe Checkout
- [ ] Checkout session contains correct price (€10/month) and metadata
- [ ] Payment with test card succeeds
- [ ] Redirect back to app after payment with session_id
- [ ] Subscription updated to student_pro in database
- [ ] Stripe customer_id and subscription_id stored correctly
- [ ] Can now create up to 10 projects (limit increased from 1)
- [ ] AI interactions now unlimited (no longer 30/month limit)
- [ ] Payment appears in payment_history table and UI
- [ ] Webhook processed subscription update correctly

**Results:**
- **Passed:** __ / 10
- **Failed:** __ / 10
- **Warnings:** __ / 10

**Critical Issues Found:**
1. _______________
2. _______________

**Minor Issues Found:**
1. _______________
2. _______________

**Edge Cases Discovered:**
1. _______________
2. _______________

---

## 🧪 TEST SCENARIO 3: Subscription Management

### Status: ⏸️ PENDING
*Execute after completing Scenarios 1 and 2*

---

## 🧪 TEST SCENARIO 4: Subscription Expiration

### Status: ⏸️ PENDING
*Requires subscription cancellation from Scenario 3 or manual simulation*

---

## 🧪 TEST SCENARIO 5: Failed Payment

### Status: ⏸️ PENDING
*Requires new subscription attempt with failing test card*

---

## 🧪 TEST SCENARIO 6: Webhook Delivery Failures

### Status: ⏸️ PENDING
*Requires Stripe CLI or manual webhook testing*

---

## 🧪 TEST SCENARIO 7: Edge Cases

### Status: ⏸️ PENDING
*Requires specific test scenarios and database manipulation*

---

## 🧪 TEST SCENARIO 8: Usage Limit Edge Cases

### Status: ⏸️ PENDING
*Requires precise usage count manipulation and boundary testing*

---

## 📊 OVERALL TEST RESULTS

### Summary Statistics
- **Scenarios Completed:** 0 / 8
- **Total Tests Passed:** 0
- **Total Tests Failed:** 0
- **Warnings/Issues:** 0

### Critical Blockers
*List any issues that prevent further testing*
1. _______________

### Test Coverage
- [ ] Free Tier Limits
- [ ] Upgrade Flow
- [ ] Subscription Management
- [ ] Expiration Handling
- [ ] Payment Failures
- [ ] Webhook Reliability
- [ ] Edge Cases
- [ ] Security

### Recommendations
*Based on test results, list recommended fixes/improvements*
1. _______________
2. _______________

---

## 📝 Notes & Observations

### General Notes
- _______________

### Performance Observations
- _______________

### UX Issues
- _______________

### Security Concerns
- _______________

---

**Test Log End**
*Update this document as testing progresses*
