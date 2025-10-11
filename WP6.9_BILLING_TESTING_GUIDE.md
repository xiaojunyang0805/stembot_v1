# WP6.9: Complete Billing System End-to-End Testing Guide

**Date:** 2025-10-11
**Purpose:** Comprehensive testing protocol for Stripe billing integration
**Environment:** https://stembotv1.vercel.app

---

## 📋 TIER LIMITS REFERENCE

| Feature | Free | Student Pro (€10) | Researcher (€25) |
|---------|------|-------------------|------------------|
| Projects | 1 | 10 | Unlimited |
| AI Interactions/Month | 30 | Unlimited | Unlimited |
| Memory Retention | 7 days | Unlimited | Unlimited |

---

## 🧪 TEST SCENARIO 1: New User Signup → Free Tier

### **Objective:** Verify default free tier initialization and limit enforcement

### **Test Steps:**

#### 1.1 Create New Account
```
Action: Sign up with new email (use Gmail + trick: yourname+test1@gmail.com)
Expected: Account created successfully
Verify: Redirect to dashboard
```

#### 1.2 Verify Default Subscription Created
```
Database Check (SQL):
SELECT * FROM subscriptions WHERE user_id = '{new_user_id}';

Expected:
- tier = 'free'
- status = 'active'
- stripe_customer_id = NULL
- stripe_subscription_id = NULL
```

#### 1.3 Verify Usage Tracking Initialized
```
Database Check (SQL):
SELECT * FROM usage_tracking
WHERE user_id = '{new_user_id}'
AND month = '2025-10';

Expected:
- ai_interactions_count = 0
- active_projects_count = 0
```

#### 1.4 Create First Project (Should Succeed)
```
Action: Go to /projects/create
       Fill in project details
       Submit

Expected: Project created successfully
Verify:
- Project appears in dashboard
- active_projects_count = 1 in usage_tracking
- Can access project workspace
```

#### 1.5 Try to Create Second Project (Should Block)
```
Action: Try to create another project

Expected:
❌ BLOCKED with upgrade prompt
Message: "Project limit reached (1/1 active projects)"
Upgrade CTA: "Upgrade to Student Pro for up to 10 active projects at €10/month"

Verify:
- Cannot proceed without upgrade
- Clear upgrade button visible
- Upgrade prompt shows benefit (10 projects)
```

#### 1.6 Use AI Interactions (First 30 Should Succeed)
```
Action: Go to project workspace
       Use AI chat assistant
       Make 30 interactions

Expected: All 30 interactions work
Verify:
- ai_interactions_count increments correctly
- No errors in console
- At 25/30: Warning appears ("Only 5 AI interactions remaining this month")
```

#### 1.7 Try 31st AI Interaction (Should Block)
```
Action: Attempt 31st AI interaction

Expected:
❌ BLOCKED with upgrade message
Message: "AI interaction limit reached (30/30 this month)"
Upgrade CTA: "Upgrade to Student Pro for unlimited AI interactions at €10/month"

Verify:
- Request not processed
- Clear upgrade button visible
- Usage counter shows 30/30
```

### **✅ Pass Criteria:**
- [ ] Default free subscription created automatically
- [ ] Usage tracking initialized at 0/0
- [ ] First project creation succeeds
- [ ] Second project creation blocked with upgrade prompt
- [ ] First 30 AI interactions succeed
- [ ] 31st AI interaction blocked with upgrade message
- [ ] All upgrade CTAs redirect to /settings/billing

### **📝 Edge Cases to Check:**
- Multiple rapid project creation attempts → Race conditions handled?
- AI interaction while exactly at limit (30/30) → Allowed or blocked?
- Delete project then create new one → Counter decrements?

---

## 🧪 TEST SCENARIO 2: Free → Student Pro Upgrade

### **Objective:** Test complete upgrade flow with Stripe Checkout

### **Test Steps:**

#### 2.1 Navigate to Billing Settings
```
Action: Click upgrade button from any limit prompt
       OR navigate directly to /settings/billing

Expected: Billing page loads with plan comparison
Verify:
- Current plan shows "Free" tier
- Student Pro plan shows "€10/month"
- Researcher plan shows "€25/month"
- "Upgrade" buttons visible for paid tiers
```

#### 2.2 Click "Upgrade to Student Pro"
```
Action: Click upgrade button for Student Pro plan

Expected:
- API call to /api/billing/create-checkout
- Redirect to Stripe Checkout page
- Checkout shows €10/month subscription
- Checkout pre-filled with user email

Verify:
- Stripe logo visible (secure payment)
- Correct price displayed
- Payment methods available (card, Apple Pay, Google Pay)
```

#### 2.3 Complete Payment with Test Card
```
Action: Fill in test card details
       Card: 4242 4242 4242 4242
       Expiry: 12/34
       CVC: 123
       ZIP: 12345
       Click "Subscribe"

Expected:
- Payment processed successfully
- Redirect to /settings/billing?session_id={checkout_session_id}
- Success message displayed
```

#### 2.4 Verify Redirect to Success Page
```
Expected:
- URL: /settings/billing?session_id={session_id}
- Success banner: "Subscription activated! Welcome to Student Pro"
- Plan card shows "Student Pro" tier
- Limits updated in UI

Verify:
- No loading spinners stuck
- No console errors
```

#### 2.5 Verify Subscription Updated in Database
```
Database Check (SQL):
SELECT * FROM subscriptions WHERE user_id = '{user_id}';

Expected:
- tier = 'student_pro'
- status = 'active'
- stripe_customer_id = 'cus_...' (populated)
- stripe_subscription_id = 'sub_...' (populated)
- current_period_start = (recent timestamp)
- current_period_end = (start + 1 month)
- cancel_at_period_end = false
```

#### 2.6 Verify Can Now Create Multiple Projects
```
Action: Try to create 2nd, 3rd... up to 10th project

Expected: All project creations succeed
Verify:
- No limit warnings until 10th project
- active_projects_count increments correctly
- At 10th project: Sees warning "Last project slot available (9/10)"
```

#### 2.7 Verify AI Limit Increased to Unlimited
```
Action: Make 31st, 32nd... 50th AI interaction

Expected: All interactions succeed
Verify:
- No limit warnings
- No upgrade prompts
- ai_interactions_count increments past 30
- Usage UI shows "Unlimited" or "∞" symbol
```

#### 2.8 Verify Payment Recorded in History
```
Database Check (SQL):
SELECT * FROM payment_history
WHERE user_id = '{user_id}'
ORDER BY created_at DESC
LIMIT 1;

Expected:
- amount = 1000 (€10 in cents)
- currency = 'eur'
- status = 'succeeded'
- stripe_payment_intent_id populated
- invoice_url populated

UI Check:
- Go to /settings/billing
- Scroll to "Payment History" section
- See first payment listed with date, amount, status
```

### **✅ Pass Criteria:**
- [ ] Upgrade button redirects to Stripe Checkout
- [ ] Checkout session contains correct price and metadata
- [ ] Payment with test card succeeds
- [ ] Redirect back to app after payment
- [ ] Subscription updated to student_pro in database
- [ ] Stripe customer_id and subscription_id stored
- [ ] Can now create up to 10 projects
- [ ] AI interactions now unlimited
- [ ] Payment appears in payment history
- [ ] Webhook processes the subscription update

### **📝 Edge Cases to Check:**
- User closes Stripe Checkout without paying → Returns to billing page with "Checkout cancelled" message?
- User presses "Back" button on Stripe → Can restart checkout?
- Payment fails (use test card 4000 0000 0000 0341) → Error message shown?

---

## 🧪 TEST SCENARIO 3: Subscription Management

### **Objective:** Test customer portal, payment method changes, cancellation

### **Test Steps:**

#### 3.1 Open Customer Portal from Settings
```
Action: Go to /settings/billing
       Click "Manage Subscription" button

Expected:
- API call to /api/billing/portal
- Redirect to Stripe Customer Portal
- Portal shows current subscription
- Portal shows payment method
- Portal shows invoice history

Verify:
- User email matches
- Subscription tier correct
- Next payment date visible
```

#### 3.2 Change Payment Method
```
Action: In Customer Portal, click "Update payment method"
       Add new test card: 5555 5555 5555 4444
       Set as default

Expected:
- Card updated successfully
- New card shown in portal
- Confirmation message displayed

Verify:
- Return to /settings/billing
- Updated card last 4 digits visible
```

#### 3.3 Download Invoice
```
Action: In Customer Portal, find latest invoice
       Click "Download" or "View Invoice"

Expected:
- PDF invoice opens in new tab
- Invoice shows:
  - StemBot branding
  - Correct amount (€10)
  - User details
  - Payment method
  - Invoice number

Verify:
- PDF downloads correctly
- All details match subscription
```

#### 3.4 Cancel Subscription
```
Action: In Customer Portal, click "Cancel Subscription"
       Confirm cancellation
       Select reason (optional)
       Complete cancellation

Expected:
- Cancellation confirmed
- Message: "Your subscription will remain active until [end date]"
- Can still use paid features until period end

Verify:
- Stripe shows subscription with cancel_at_period_end=true
- Return to /settings/billing
- Banner shows "Subscription ending on [date]"
- Features still work
```

#### 3.5 Verify Still Works Until Period End
```
Database Check:
SELECT * FROM subscriptions WHERE user_id = '{user_id}';

Expected:
- status = 'active' (still active)
- cancel_at_period_end = true
- canceled_at = (timestamp of cancellation)

Functionality Check:
- Can still create projects (up to 10)
- Can still make unlimited AI interactions
- No feature restrictions until period_end

UI Check:
- Banner visible: "Subscription ends on {date}. Reactivate or switch to Free tier."
```

#### 3.6 Check Cancel_At_Period_End Flag Set
```
Stripe Dashboard Check:
1. Login to Stripe Dashboard
2. Find customer
3. Check subscription shows "Canceling on {date}"

Database Check:
SELECT cancel_at_period_end, canceled_at, current_period_end
FROM subscriptions
WHERE user_id = '{user_id}';

Expected:
- cancel_at_period_end = true
- canceled_at populated
- current_period_end in future
```

### **✅ Pass Criteria:**
- [ ] Customer portal link generated successfully
- [ ] Portal opens with correct user data
- [ ] Payment method can be updated
- [ ] Invoice downloads correctly
- [ ] Cancellation completes successfully
- [ ] cancel_at_period_end flag set correctly
- [ ] Features remain available until period end
- [ ] Cancellation banner shown in UI
- [ ] Can reactivate subscription before period end

### **📝 Edge Cases to Check:**
- Reactivate subscription after canceling (before period end) → cancel_at_period_end resets to false?
- Portal session expires → Returns to app gracefully?
- Update card to invalid card → Stripe rejects with clear error?

---

## 🧪 TEST SCENARIO 4: Subscription Expiration

### **Objective:** Test downgrade logic after subscription period ends

### **Test Steps:**

#### 4.1 Simulate Subscription Period Ending
```
Manual Test Option 1 (Stripe CLI):
stripe trigger subscription_schedule.expiring

Manual Test Option 2 (Database):
UPDATE subscriptions
SET current_period_end = NOW() - INTERVAL '1 day',
    cancel_at_period_end = true,
    status = 'canceled'
WHERE user_id = '{test_user_id}';

Expected:
- Subscription status changes to 'canceled'
- Webhook fired: subscription.deleted
```

#### 4.2 Verify Downgrade to Free Tier
```
Database Check:
SELECT tier, status FROM subscriptions WHERE user_id = '{user_id}';

Expected:
- tier = 'free'
- status = 'canceled' or deleted and new free subscription created

Webhook Processing:
- Check webhook logs in Stripe Dashboard
- Verify webhook processed successfully
- Check app logs for subscription.deleted event
```

#### 4.3 Check Projects >1 Become Read-Only or Archived
```
Database Check:
SELECT id, title, status FROM projects
WHERE user_id = '{user_id}'
ORDER BY created_at;

Expected Options:
Option A: Projects 2-10 status = 'archived' or 'read_only'
Option B: Projects 2-10 are hidden in UI
Option C: Warning shown: "Free tier allows 1 project. Archive 9 projects to create new ones."

UI Check:
- Go to dashboard
- Count visible projects
- Try to access 2nd project
- Verify appropriate message/restriction
```

#### 4.4 Verify AI Usage Respects Free Limits
```
Reset Usage (Admin Function):
UPDATE usage_tracking
SET ai_interactions_count = 0
WHERE user_id = '{user_id}' AND month = '2025-10';

Action: Make AI interactions
Expected:
- Limited to 30 interactions/month
- 31st interaction blocked
- Upgrade prompt appears

Verify:
- Usage tracking works correctly
- Limits enforced at free tier
```

#### 4.5 Verify UI Shows Downgrade Notification
```
UI Check:
- Go to /settings/billing
- Look for notification banner

Expected Message:
"Your subscription has ended. You're now on the Free plan."
OR
"Your Student Pro subscription ended on {date}. Resubscribe to unlock premium features."

Verify:
- Plan card shows "Free" tier
- Upgrade options visible
- Payment history still accessible
```

### **✅ Pass Criteria:**
- [ ] Subscription period end detected
- [ ] Webhook processes expiration correctly
- [ ] Tier downgrades to 'free' in database
- [ ] Projects beyond limit are archived or restricted
- [ ] AI usage limited to 30/month
- [ ] User notified of downgrade
- [ ] Can re-subscribe at any time
- [ ] No data loss during downgrade

### **📝 Edge Cases to Check:**
- User has 10 projects, downgrades → Which project remains active? (Newest? Oldest? User choice?)
- Mid-month downgrade → AI usage resets or carries over partial count?
- Re-upgrade after downgrade → Archived projects restored?

---

## 🧪 TEST SCENARIO 5: Failed Payment

### **Objective:** Test handling of payment failures and grace period

### **Test Steps:**

#### 5.1 Use Failing Test Card
```
Action: Try to upgrade using failing test card
       Card: 4000 0000 0000 0341 (Stripe test card for "charge declined")
       OR
       Use 4000 0000 0000 0002 (card declined)

Expected:
- Stripe Checkout shows error
- Payment not processed
- User not upgraded
- Redirect back to /settings/billing with error

Error Message:
"Your card was declined. Please try a different payment method."
```

#### 5.2 Verify Subscription Goes to Past_Due (Recurring Payment Fails)
```
Simulate Scenario:
1. User has active Student Pro subscription
2. Renewal date arrives
3. Card on file fails (expired, insufficient funds, etc.)

Stripe Webhook: invoice.payment_failed

Database Update:
UPDATE subscriptions
SET status = 'past_due'
WHERE user_id = '{user_id}';

Expected:
- Subscription status = 'past_due'
- User receives email notification (Stripe auto-sends)
```

#### 5.3 Check User Notified
```
Email Check:
- Check user's email inbox
- Stripe sends automatic "Payment Failed" email
- Contains link to update payment method

UI Check:
- Login to app
- Banner displayed: "Payment failed. Please update your payment method to avoid service interruption."
- Click banner → Redirects to Customer Portal

Database Check:
SELECT status, current_period_end
FROM subscriptions
WHERE user_id = '{user_id}';

Expected:
- status = 'past_due'
- current_period_end unchanged (grace period active)
```

#### 5.4 Verify Features Still Work for Grace Period (7 Days)
```
Grace Period Test:
Day 1-7 after failed payment:

Expected:
✅ Can still create projects (within Student Pro limit)
✅ Can still make unlimited AI interactions
✅ All Student Pro features active
⚠️  Warning banner visible

UI Check:
- Banner: "Your payment failed. You have X days to update your payment method."
- Features unrestricted
- Countdown timer on banner (optional)
```

#### 5.5 After Grace Period → Downgrade to Free
```
Simulate:
UPDATE subscriptions
SET status = 'canceled',
    tier = 'free'
WHERE user_id = '{user_id}'
  AND status = 'past_due'
  AND current_period_end < NOW() - INTERVAL '7 days';

OR wait for Stripe webhook: subscription.deleted

Expected:
- Tier changes to 'free'
- Status changes to 'canceled'
- User downgraded to free limits
- Notification sent

Verify Limits:
- Project creation limited to 1
- AI interactions limited to 30/month
- Excess projects archived
```

### **✅ Pass Criteria:**
- [ ] Payment failure handled gracefully
- [ ] User sees clear error message
- [ ] Subscription status changes to past_due
- [ ] User notified via email and UI banner
- [ ] Features continue working during 7-day grace period
- [ ] After grace period, automatic downgrade to free
- [ ] User can update payment method to reactivate
- [ ] No data loss during past_due period

### **📝 Edge Cases to Check:**
- User updates payment method during grace period → Subscription reactivates?
- Multiple failed payment attempts → Retry logic works?
- Grace period on last day → Clear countdown shown?

---

## 🧪 TEST SCENARIO 6: Webhook Delivery Failures

### **Objective:** Test webhook reliability and retry mechanisms

### **Test Steps:**

#### 6.1 Simulate Webhook Not Received
```
Test Setup:
1. Temporarily break webhook endpoint (comment out code)
2. Trigger subscription event in Stripe
3. Watch webhook fail

Stripe Dashboard Check:
- Go to Developers → Webhooks
- Find failed webhook event
- Status: "Failed" with retry count
```

#### 6.2 Check Retry Mechanism
```
Stripe Automatic Retries:
- Stripe retries failed webhooks automatically
- Retry schedule:
  - After 1 hour
  - After 3 hours
  - After 9 hours
  - After 27 hours (total ~40 hours)

Expected:
- Multiple retry attempts visible in Stripe Dashboard
- Each attempt logged with timestamp
- Status shows "Retrying..."

Fix Webhook:
- Restore webhook endpoint code
- Wait for next retry
- Verify webhook processes successfully
```

#### 6.3 Verify Manual Sync Option in Admin
```
Admin Panel Creation (If Needed):
Create /api/admin/sync-subscription endpoint

Test:
1. Webhook fails to deliver
2. Admin notices subscription not updated
3. Admin calls manual sync API:

POST /api/admin/sync-subscription
{
  "userId": "{user_id}"
}

Expected:
- API fetches subscription from Stripe
- Updates local database
- Returns sync status

Verify:
- Database matches Stripe data after sync
```

#### 6.4 Test Idempotency (Same Webhook Twice)
```
Scenario: Webhook delivered twice due to network issue

Test:
1. Process webhook: subscription.updated (tier change)
2. Replay same webhook with identical payload
3. Check database

Expected:
✅ Idempotency key prevents duplicate processing
✅ Database unchanged on second webhook
✅ No duplicate payment records
✅ No duplicate emails sent

Code Check:
// In webhook handler
const idempotencyKey = req.headers['stripe-signature'];
// Check if already processed
const existing = await db.processedWebhooks.findOne({ idempotencyKey });
if (existing) {
  return res.status(200).send('Already processed');
}
```

### **✅ Pass Criteria:**
- [ ] Webhook failures logged in Stripe Dashboard
- [ ] Automatic retry mechanism works
- [ ] Retries succeed after endpoint fixed
- [ ] Manual sync API available for admins
- [ ] Manual sync updates database correctly
- [ ] Idempotency prevents duplicate processing
- [ ] Webhook signature validation works
- [ ] No duplicate charges from webhook replays

### **📝 Edge Cases to Check:**
- Webhook arrives before Stripe Checkout redirect completes → Handled gracefully?
- Multiple webhooks arrive out of order → Latest event wins?
- Webhook arrives for deleted user → Handled without error?

---

## 🧪 TEST SCENARIO 7: Edge Cases

### **Objective:** Test boundary conditions and error handling

### **Test Steps:**

#### 7.1 User with No Subscription Record
```
Scenario: New user, no subscription created yet

Setup:
DELETE FROM subscriptions WHERE user_id = '{user_id}';

Action: User logs in, tries to create project

Expected:
✅ System defaults to free tier
✅ Project creation enforces free tier limits (1 project)
✅ No errors thrown
✅ Subscription record auto-created on first action

Code Check:
// In getUserSubscription()
if (!subscription) {
  return { tier: 'free', status: 'active' };
}
```

#### 7.2 Deleted Stripe Customer
```
Scenario: User's Stripe customer deleted (refund, fraud, etc.)

Setup:
1. Stripe Dashboard → Delete customer
2. Database still has stripe_customer_id

Action: User tries to access billing settings

Expected:
✅ Graceful fallback to free tier
✅ Error logged (but not shown to user)
✅ Prompt to re-subscribe
✅ No crash

Error Handling:
try {
  const customer = await stripe.customers.retrieve(customerId);
} catch (error) {
  if (error.code === 'resource_missing') {
    // Customer deleted, downgrade to free
    await downgradeToFree(userId);
  }
}
```

#### 7.3 Concurrent Requests to Increment Usage
```
Scenario: User makes 5 AI requests simultaneously

Test:
const promises = Array(5).fill(null).map(() =>
  fetch('/api/ai/chat', { method: 'POST', body: {...} })
);
await Promise.all(promises);

Expected:
✅ All 5 requests processed
✅ ai_interactions_count increments by exactly 5 (no race condition)
✅ No duplicate increments
✅ No lost increments

Database Function (Atomic Increment):
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_month TEXT
)
RETURNS INTEGER AS $$
  -- Atomic increment
  UPDATE usage_tracking
  SET ai_interactions_count = ai_interactions_count + 1
  WHERE user_id = p_user_id AND month = p_month
  RETURNING ai_interactions_count;
$$ LANGUAGE sql;
```

#### 7.4 Usage Tracking Month Rollover
```
Scenario: Month changes from October to November

Test Date: Oct 31, 23:59 → Nov 1, 00:01

Setup:
- User has 29/30 AI interactions in October
- User makes request at 23:59 on Oct 31 (interaction #30)
- User makes request at 00:01 on Nov 1 (should be #1 for November)

Expected:
✅ October usage: ai_interactions_count = 30
✅ November usage: new row created with ai_interactions_count = 1
✅ Limits reset correctly
✅ No carryover from October

Database Check:
SELECT month, ai_interactions_count
FROM usage_tracking
WHERE user_id = '{user_id}'
ORDER BY month DESC
LIMIT 2;

Expected:
| month   | ai_interactions_count |
|---------|-----------------------|
| 2025-11 | 1                     |
| 2025-10 | 30                    |
```

#### 7.5 Timezone Handling for Subscription Periods
```
Scenario: User in different timezone, subscription period ends

User Timezone: UTC+8 (Beijing)
Server Timezone: UTC+0
Subscription Period End: 2025-11-01 00:00:00 UTC

Test:
1. Nov 1, 08:00 in Beijing = Nov 1, 00:00 UTC
2. User tries to use paid features at 07:59 Beijing time

Expected:
✅ Features work until 08:00 Beijing time
✅ At 08:00 Beijing time, features restricted
✅ All times consistent with UTC
✅ No early or late cutoff

Code Check:
const periodEnd = new Date(subscription.current_period_end);
const now = new Date();
const isActive = now < periodEnd; // Both in UTC
```

### **✅ Pass Criteria:**
- [ ] Missing subscription defaults to free tier gracefully
- [ ] Deleted Stripe customer handled without crash
- [ ] Concurrent usage increments are atomic (no race conditions)
- [ ] Month rollover resets usage correctly
- [ ] Timezone handling consistent across all users
- [ ] No off-by-one errors in limit checks
- [ ] All edge cases logged for monitoring

### **📝 Additional Edge Cases:**
- User has subscription but Stripe subscription deleted → Sync mismatch?
- User changes email in Stripe vs app → Which is source of truth?
- Daylight saving time transition → Subscription timing correct?

---

## 🧪 TEST SCENARIO 8: Usage Limit Edge Cases

### **Objective:** Test boundary conditions for usage limits

### **Test Steps:**

#### 8.1 Exactly at Limit (30/30) - Allow or Block?
```
Setup:
UPDATE usage_tracking
SET ai_interactions_count = 30
WHERE user_id = '{user_id}' AND month = '2025-10';

Action: User makes 1 AI request

Code Decision:
Option A: allowed = usage < limit   // 30 < 30 = false → BLOCK
Option B: allowed = usage <= limit  // 30 <= 30 = true → ALLOW

Current Implementation Check:
// src/lib/stripe/subscriptionHelpers.ts:399
const allowed = usage.ai_interactions_count < usage.ai_interactions_limit;

Expected with Current Code:
❌ BLOCKED at 30/30
✅ Last allowed interaction is 29/30

Test:
1. Set count to 29
2. Make request → Should succeed (30/30)
3. Make request → Should block (30/30)
```

#### 8.2 Usage Increment Fails - Retry or Fail Silently?
```
Scenario: Database error during usage increment

Test:
1. Disconnect database temporarily
2. User makes AI request
3. AI response succeeds but usage increment fails

Current Implementation:
try {
  const response = await callAI(prompt);
  await incrementAIUsage(userId); // Fails here
  return response;
} catch (error) {
  // What happens?
}

Options:
Option A: Retry increment 3 times, then fail silently (log error)
Option B: Rollback AI response, show error to user
Option C: Queue increment for later processing

Expected Behavior:
✅ User gets AI response (they paid for it)
✅ Increment queued for retry
⚠️  Monitor shows missed increment
✅ Next request includes retry of previous increment
```

#### 8.3 Subscription Changes Mid-Month - Prorate Usage Limits?
```
Scenario: User on free tier (30/30 limit reached) upgrades to Student Pro mid-month

Current State:
- Month: 2025-10
- ai_interactions_count: 30
- tier: free (limit: 30)

Action: User upgrades to Student Pro

Options:
Option A: Unlimited immediately (30 already used doesn't matter)
Option B: Prorate: grant extra 15 for remaining half month
Option C: Wait until next month for unlimited

Recommended Implementation:
✅ Option A: Unlimited immediately (best UX)

Test:
1. Reach free limit (30/30)
2. Upgrade to Student Pro
3. Immediately make AI request

Expected:
✅ Request succeeds
✅ No limit message
✅ Usage UI shows "Unlimited" or "∞"
✅ ai_interactions_count continues incrementing (for stats) but no limit enforced
```

### **✅ Pass Criteria:**
- [ ] Limit enforcement uses strict inequality (< not <=)
- [ ] User gets 30 interactions on free tier (0-29)
- [ ] Increment failures handled gracefully
- [ ] Failed increments queued for retry
- [ ] Mid-month upgrade grants immediate full access
- [ ] No partial month prorating complexity
- [ ] All boundary conditions tested

### **📝 Additional Edge Cases:**
- User at 29/30, makes 2 simultaneous requests → Only 1 succeeds?
- Downgrade mid-month from unlimited to free (already used 50) → Immediately limited or grace period?
- Month rollover while request in flight → Which month's quota used?

---

## 🧪 ERROR HANDLING TESTS

### **Objective:** Test resilience and error recovery

### **Test Steps:**

#### E.1 Stripe API Down - Graceful Fallback
```
Simulate: Stripe API returns 500 Internal Server Error

Action: User tries to upgrade

Expected:
✅ User-friendly error message: "Payment service temporarily unavailable. Please try again in a few minutes."
✅ No app crash
✅ Error logged to monitoring system
✅ User can retry after Stripe recovers

Code:
try {
  const session = await stripe.checkout.sessions.create({...});
} catch (error) {
  if (error.type === 'StripeAPIError') {
    return res.status(503).json({
      error: 'Payment service unavailable',
      retryAfter: 60
    });
  }
}
```

#### E.2 Database Connection Lost During Checkout - Recovery
```
Simulate: Database goes down after Stripe Checkout succeeds but before webhook processes

Sequence:
1. User completes payment ✅
2. Stripe webhook fires ✅
3. Webhook tries to update database ❌ (connection lost)
4. Webhook retry 1 hour later ✅

Expected:
✅ User sees loading state in app
✅ Webhook retries automatically
✅ Database updates on retry
✅ User subscription activated (delayed but successful)

Monitoring Alert:
⚠️  Webhook processing failed due to database error - will retry
```

#### E.3 Webhook Signature Invalid - Reject Safely
```
Attack Scenario: Malicious actor sends fake webhook

Test:
curl -X POST https://stembotv1.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription.updated","data":{"object":{"id":"fake"}}}'

Expected:
❌ Request rejected
❌ Status 400 Bad Request
✅ Error: "Invalid webhook signature"
✅ No database changes
✅ Security alert logged

Code:
const sig = req.headers['stripe-signature'];
try {
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
} catch (err) {
  console.error('⚠️  Webhook signature verification failed:', err.message);
  return res.status(400).send(`Webhook Error: ${err.message}`);
}
```

#### E.4 Missing Environment Variables - Clear Error Messages
```
Test: Remove Stripe keys from environment

Action: Restart server

Expected Error Logs:
❌ STRIPE_SECRET_KEY is missing from environment variables
❌ Stripe initialization failed
💡 Please add it to your .env.local file
💡 See STRIPE_SETUP.md for instructions

Test in UI:
- Navigate to /settings/billing
- Expected: Error banner: "Billing features unavailable. Contact support."
- No sensitive error details exposed to user
```

### **✅ Pass Criteria:**
- [ ] Stripe API errors don't crash app
- [ ] User-friendly error messages shown
- [ ] Errors logged to monitoring system
- [ ] Webhook signature validation prevents fake webhooks
- [ ] Database errors trigger automatic retries
- [ ] Missing environment variables caught on startup
- [ ] All errors have clear resolution paths

---

## 🧪 PERFORMANCE TESTS

### **Objective:** Test system under load

### **Test Steps:**

#### P.1 Load Settings Page with Large Payment History
```
Setup: Create 100+ payment records for user

Test:
1. Navigate to /settings/billing
2. Measure page load time
3. Check payment history pagination

Expected:
✅ Page loads in < 3 seconds
✅ Payment history paginated (10-20 per page)
✅ No memory leaks
✅ Smooth scrolling

Performance Metrics:
- Time to First Byte (TTFB): < 500ms
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
```

#### P.2 Multiple Users Upgrading Simultaneously
```
Load Test: 10 concurrent users upgrade at same time

Test Script:
for i in {1..10}; do
  curl -X POST https://stembotv1.vercel.app/api/billing/create-checkout &
done
wait

Expected:
✅ All requests succeed
✅ No database deadlocks
✅ No race conditions
✅ All webhooks processed correctly

Monitor:
- Vercel function execution time
- Supabase connection pool usage
- Stripe API rate limits not hit
```

#### P.3 Usage Increment Performance Under Load
```
Load Test: 100 AI requests in 10 seconds

Test:
for i in {1..100}; do
  curl -X POST https://stembotv1.vercel.app/api/ai/chat &
  sleep 0.1
done

Expected:
✅ All increments processed
✅ Final count = 100 (no lost increments)
✅ Response time < 2s per request
✅ No database lock timeouts

Database Check:
SELECT ai_interactions_count FROM usage_tracking WHERE user_id = '{user_id}';
Expected: Exactly 100
```

### **✅ Pass Criteria:**
- [ ] Billing page loads quickly with large history
- [ ] Pagination works correctly
- [ ] Concurrent checkouts don't cause race conditions
- [ ] Usage increments are atomic and accurate
- [ ] No performance degradation under load
- [ ] Database connection pool sized appropriately

---

## 🧪 SECURITY TESTS

### **Objective:** Verify authorization and security controls

### **Test Steps:**

#### S.1 Attempt to Upgrade Another User's Subscription
```
Attack Scenario: User A tries to upgrade User B's subscription

Test:
POST /api/billing/create-checkout
Headers: Authorization: Bearer {user_a_token}
Body: { "userId": "{user_b_id}", "tier": "student_pro" }

Expected:
❌ Request rejected
❌ Status 403 Forbidden
✅ Error: "Unauthorized"
✅ User B subscription unchanged

Code Check:
const session = await getServerSession(req);
const userId = session.user.id;
// NEVER trust userId from request body
```

#### S.2 Tamper with Checkout Session Metadata
```
Attack Scenario: Modify Stripe Checkout session metadata

Attempt:
1. Intercept checkout session creation
2. Modify metadata: tier: "free" or price: "0"
3. Complete checkout

Expected:
✅ Stripe validates session server-side
✅ Metadata cannot be tampered (signed by Stripe)
✅ Webhook uses Stripe data as source of truth (not request data)

Webhook Code:
// ALWAYS use Stripe event data, not request body
const subscription = event.data.object;
const tier = subscription.metadata.tier; // From Stripe, not tampered
```

#### S.3 Access Customer Portal Without Subscription
```
Attack Scenario: Free user tries to access portal

Test:
POST /api/billing/portal
Headers: Authorization: Bearer {free_user_token}

Expected:
❌ Status 400 Bad Request
✅ Error: "No active subscription"
OR
✅ Redirect to upgrade page

Code:
const subscription = await getUserSubscription(userId);
if (!subscription.stripe_customer_id) {
  return res.status(400).json({ error: 'No active subscription' });
}
```

#### S.4 Direct Database Manipulation - Prevented by RLS
```
Attack Scenario: User tries to modify subscription directly via Supabase client

Test (Client-Side):
const { error } = await supabase
  .from('subscriptions')
  .update({ tier: 'researcher' })
  .eq('user_id', '{own_user_id}');

Expected:
❌ Error: "new row violates row-level security policy"
✅ RLS policy blocks unauthorized update
✅ Only server with service role key can update

RLS Policy Check:
-- On subscriptions table
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (false) -- No client-side updates allowed
  WITH CHECK (false);
```

### **✅ Pass Criteria:**
- [ ] Users can only manage their own subscriptions
- [ ] Checkout session metadata cannot be tampered
- [ ] Webhooks validate Stripe signatures
- [ ] RLS prevents direct subscription modifications
- [ ] All API routes check authentication
- [ ] All API routes validate user ownership
- [ ] Sensitive errors don't leak information

---

## 📊 TEST RESULTS DOCUMENTATION TEMPLATE

```markdown
## WP6.9 Testing Results - {Date}

### Environment
- Testing URL: https://stembotv1.vercel.app
- Stripe Mode: TEST
- Tester: {Name}
- Test Duration: {Hours}

### Scenario Results

#### ✅ TEST SCENARIO 1: New User Signup → Free Tier
- [x] Default subscription created
- [x] Usage tracking initialized
- [x] First project creation succeeded
- [x] Second project blocked correctly
- [x] 30 AI interactions allowed
- [x] 31st interaction blocked
- **Issues Found:** None
- **Edge Cases Discovered:** {Details}

#### ✅ TEST SCENARIO 2: Free → Student Pro Upgrade
- [x] Checkout flow completed
- [x] Payment processed successfully
- [x] Database updated correctly
- [ ] Minor UI glitch on redirect (non-blocking)
- **Issues Found:** Success banner flashes briefly
- **Edge Cases Discovered:** {Details}

#### ⚠️  TEST SCENARIO 3: Subscription Management
- [x] Customer portal opened
- [x] Payment method updated
- [ ] Invoice download failed (404 error)
- [x] Cancellation worked correctly
- **Issues Found:** Invoice URL incorrect
- **Fix Required:** Update invoice_url logic in webhook
- **Edge Cases Discovered:** {Details}

... continue for all scenarios ...

### Summary Statistics
- Total Tests: 75
- Passed: 68
- Failed: 4
- Blocked: 3

### Critical Issues
1. **Invoice URL Generation** (Priority: High)
   - Impact: Users cannot download invoices
   - Fix: Update webhook to store correct invoice URL

2. **Concurrent Project Creation** (Priority: Medium)
   - Impact: Race condition allows 2 projects on free tier
   - Fix: Add database lock or atomic check-and-insert

### Recommendations
1. Add automated tests for all scenarios
2. Implement monitoring for webhook failures
3. Add admin dashboard for subscription management
4. Create runbook for common billing issues

### Test Evidence
- Screenshots: {Folder path}
- Database snapshots: {Folder path}
- Webhook logs: {Folder path}
- Stripe Dashboard screenshots: {Folder path}
```

---

## 🚀 QUICK TEST CHECKLIST (30 Minutes)

For rapid smoke testing of billing system:

```
□ Sign up new user → defaults to free tier
□ Create 1 project → succeeds
□ Try to create 2nd project → blocked with upgrade prompt
□ Click upgrade → redirects to Stripe Checkout
□ Complete payment with 4242 4242 4242 4242 → succeeds
□ Redirect back to app → shows Student Pro tier
□ Create 2nd project → now succeeds
□ Make 31+ AI interactions → no limit enforced
□ Open customer portal → shows correct subscription
□ Cancel subscription → cancel_at_period_end set
□ Check /settings/billing → payment history visible
```

---

## 🛠️ DEBUGGING TOOLS

### Useful SQL Queries

```sql
-- Check user's subscription
SELECT * FROM subscriptions WHERE user_id = '{user_id}';

-- Check current usage
SELECT * FROM usage_tracking
WHERE user_id = '{user_id}'
ORDER BY month DESC LIMIT 3;

-- Check payment history
SELECT * FROM payment_history
WHERE user_id = '{user_id}'
ORDER BY created_at DESC LIMIT 10;

-- Find users with past_due subscriptions
SELECT u.email, s.*
FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE s.status = 'past_due';

-- Reset user's usage (testing only!)
UPDATE usage_tracking
SET ai_interactions_count = 0,
    active_projects_count = 0
WHERE user_id = '{user_id}' AND month = '2025-10';
```

### Stripe CLI Commands

```bash
# Listen to webhooks locally
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger subscription.created
stripe trigger subscription.updated
stripe trigger subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# View recent events
stripe events list --limit 10

# Retrieve specific subscription
stripe subscriptions retrieve sub_xxxxxxxxxxxxx

# Cancel subscription
stripe subscriptions cancel sub_xxxxxxxxxxxxx
```

### Chrome DevTools Checks

```javascript
// Check for console errors
console.log('Checking for errors...');
// Look for red errors in console

// Check Supabase client warnings
// Look for "Multiple GoTrueClient instances" warning

// Monitor network requests
// Filter by: billing, stripe, checkout, webhook

// Check localStorage for cached data
localStorage.getItem('supabase.auth.token');
```

---

## 📞 SUPPORT CONTACT

If you encounter issues during testing:

- **Stripe Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq
- **Vercel Logs:** https://vercel.com/stembot/logs
- **Test Cards:** https://docs.stripe.com/testing#cards

---

**End of Testing Guide**

*Last Updated: 2025-10-11*
*WP6.9: Complete Billing System Testing*
