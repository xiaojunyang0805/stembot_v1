# Stripe Setup Guide for StemBot
**WP6.1: Stripe Foundation & Database Schema**

This guide walks through the complete Stripe configuration for StemBot's billing system.

---

## 📋 Prerequisites

- Stripe account (test mode for development)
- Supabase project configured
- Vercel deployment URL: `https://stembotv1.vercel.app`

---

## 🛍️ Step 1: Create Subscription Products

### Navigate to Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure you're in **Test Mode** (toggle in top right)
3. Navigate to **Products** → **Add Product**

### Product 1: StemBot Student Pro

**Product Details:**
- **Name:** `StemBot Student Pro`
- **Description:** `Unlimited AI tutoring, up to 10 active research projects, priority support`
- **Pricing Model:** Recurring
- **Price:** `€10.00 EUR`
- **Billing Period:** Monthly
- **Payment Type:** Recurring

**After Creation:**
- Copy the **Price ID** (starts with `price_`)
- Save as: `STRIPE_STUDENT_PRO_PRICE_ID`

### Product 2: StemBot Researcher

**Product Details:**
- **Name:** `StemBot Researcher`
- **Description:** `Everything in Student Pro plus unlimited projects, advanced research tools, collaboration features`
- **Pricing Model:** Recurring
- **Price:** `€25.00 EUR`
- **Billing Period:** Monthly
- **Payment Type:** Recurring

**After Creation:**
- Copy the **Price ID** (starts with `price_`)
- Save as: `STRIPE_RESEARCHER_PRICE_ID`

---

## 🔔 Step 2: Configure Webhook Endpoint

### Create Webhook
1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**

### Webhook Configuration

**Endpoint URL:**
```
https://stembotv1.vercel.app/api/webhooks/stripe
```

**Events to Listen For:**
Select the following events:

- ✅ `checkout.session.completed` - When user completes checkout
- ✅ `customer.subscription.created` - New subscription created
- ✅ `customer.subscription.updated` - Subscription modified (tier change, payment method)
- ✅ `customer.subscription.deleted` - Subscription canceled
- ✅ `invoice.payment_succeeded` - Successful recurring payment
- ✅ `invoice.payment_failed` - Failed payment (trigger dunning flow)

**API Version:** Latest (Stripe will use your account's default API version)

### After Creation
1. Click on the webhook endpoint
2. Click **Reveal** under "Signing secret"
3. Copy the **Webhook signing secret** (starts with `whsec_`)
4. Save as: `STRIPE_WEBHOOK_SECRET`

---

## 🔑 Step 3: Retrieve API Keys

### Get Your API Keys
1. Navigate to **Developers** → **API keys**

### Copy Keys

**Secret Key (Server-Side):**
- Copy the **Secret key** (starts with `sk_test_` in test mode)
- Save as: `STRIPE_SECRET_KEY`
- ⚠️ **NEVER expose this in client-side code or commit to git**

**Publishable Key (Client-Side):**
- Copy the **Publishable key** (starts with `pk_test_` in test mode)
- Save as: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ Safe to expose in client-side code

---

## 🌍 Step 4: Configure Environment Variables

### Local Development (.env.local)

Create or update `.env.local` with:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Product Price IDs
STRIPE_STUDENT_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_RESEARCHER_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxx

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Existing Supabase Variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=https://kutpbtpdgptcmrlabekq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel Production Environment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project `stembot_v1`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (production) or `sk_test_...` (test) | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (production) or `pk_test_...` (test) | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `STRIPE_STUDENT_PRO_PRICE_ID` | `price_...` | Production |
| `STRIPE_RESEARCHER_PRICE_ID` | `price_...` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://stembotv1.vercel.app` | Production |

**Important Notes:**
- Use **test mode** keys for development/testing
- Use **live mode** keys only when ready for production
- Re-deploy after adding environment variables

---

## 🗄️ Step 5: Run Database Migration

### Apply the Migration

```bash
# Using Supabase CLI
npx supabase db push

# Or manually in Supabase Dashboard
# Go to SQL Editor → Copy contents of supabase/migrations/20251010000000_create_billing_schema.sql
# Execute the SQL
```

### Verify Migration Success

Run this query in Supabase SQL Editor:

```sql
-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscriptions', 'usage_tracking', 'payment_history');

-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('subscriptions', 'usage_tracking', 'payment_history');

-- Check functions created
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('increment_ai_usage', 'get_current_usage', 'check_tier_limits');
```

**Expected Results:**
- ✅ 3 tables created
- ✅ 6 RLS policies (2 per table)
- ✅ 3 functions created
- ✅ All existing users have a `free` tier subscription

---

## 🧪 Step 6: Test the Setup

### Test Webhook Locally (Using Stripe CLI)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

### Test Database Functions

```sql
-- Test increment_ai_usage
SELECT public.increment_ai_usage(
  (SELECT id FROM auth.users LIMIT 1),
  TO_CHAR(NOW(), 'YYYY-MM')
);

-- Test get_current_usage
SELECT * FROM public.get_current_usage(
  (SELECT id FROM auth.users LIMIT 1)
);

-- Test check_tier_limits
SELECT public.check_tier_limits(
  (SELECT id FROM auth.users LIMIT 1)
);
```

### Test Subscription Creation

```sql
-- Create a test Student Pro subscription
INSERT INTO public.subscriptions (
  user_id,
  tier,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'student_pro',
  'active',
  'cus_test_123',
  'sub_test_123',
  NOW(),
  NOW() + INTERVAL '1 month'
);

-- Verify tier limits updated
SELECT public.check_tier_limits(
  (SELECT id FROM auth.users LIMIT 1)
);
```

---

## 📊 Tier Limits Summary

| Feature | Free | Student Pro | Researcher |
|---------|------|-------------|------------|
| **Price** | €0 | €10/month | €25/month |
| **AI Interactions/month** | 30 | Unlimited | Unlimited |
| **Active Projects** | 1 | 10 | Unlimited |
| **Priority Support** | ❌ | ✅ | ✅ |
| **Advanced Tools** | ❌ | ❌ | ✅ |
| **Collaboration** | ❌ | ❌ | ✅ |

---

## 🔒 Security Checklist

- ✅ `.env.local` added to `.gitignore`
- ✅ `STRIPE_SECRET_KEY` never exposed in client code
- ✅ `STRIPE_WEBHOOK_SECRET` used to verify webhook signatures
- ✅ RLS policies enable users to only see their own data
- ✅ Service role required for subscription management
- ✅ All database functions use `SECURITY DEFINER`

---

## 🚨 Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct in Stripe Dashboard
2. Ensure Vercel deployment is live
3. Check webhook signing secret matches environment variable
4. Review webhook logs in Stripe Dashboard → Developers → Webhooks

### Database Migration Fails
1. Check for existing tables with same names
2. Verify Supabase connection
3. Review migration file for syntax errors
4. Check Supabase logs for detailed error messages

### Environment Variables Not Loading
1. Restart Next.js dev server after adding `.env.local`
2. Re-deploy Vercel after adding environment variables
3. Check variable names match exactly (case-sensitive)

---

## 📚 Next Steps

After completing this setup:

1. ✅ **WP6.2:** Create Stripe checkout flow API routes
2. ✅ **WP6.3:** Build subscription management UI
3. ✅ **WP6.4:** Implement usage tracking middleware
4. ✅ **WP6.5:** Add billing page and payment history

---

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Dashboard](https://app.supabase.com)

---

**Setup completed!** 🎉

Your Stripe billing foundation is now ready for integration with the StemBot application.
