# Stripe Billing System Setup Guide

This guide will help you set up the complete Stripe billing system for StemBot, including products, pricing, webhooks, and usage tracking.

## 🚀 Quick Setup Steps

### 1. Stripe Account Setup

1. **Create Stripe Account**: Go to https://stripe.com and create an account
2. **Get API Keys**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your Publishable key (`pk_test_...`) and Secret key (`sk_test_...`)
   - Update `.env.local` with these keys

### 2. Database Migration

Run the billing database migration:

```bash
# Apply the billing and usage tracking schema
# Run this SQL in your Supabase SQL Editor or via CLI:
supabase db push --file supabase/migrations/002_billing_usage_tracking.sql
```

### 3. Create Stripe Products

Run the product setup script:

```bash
node scripts/setup-stripe-products.js
```

This will create all products and prices in Stripe and output the price IDs to add to your `.env.local`.

### 4. Update Environment Variables

Add the generated price IDs to your `.env.local`:

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_xyz123
STRIPE_STUDENT_MONTHLY_PRICE_ID=price_abc456
# ... etc
```

### 5. Deploy and Test

1. Push changes to Git
2. Deploy to Vercel (environment variables will be automatically synced)
3. Test the billing flow on your live site

---

## 📊 Pricing Structure

### Individual Plans

- **Free Tier**: €0/month
  - 1 project, 50 AI interactions/month, basic memory

- **Pro Monthly**: €15/month
  - Unlimited projects & interactions, advanced memory, priority support

- **Student Monthly**: €10/month (university email required)
  - Same as Pro but with student discount

- **Pro Annual**: €120/year
  - Same as Pro Monthly but save 2 months (17% discount)

### Institution Plans

- **Department License**: €500/year
  - 50 student seats, admin dashboard, usage analytics

- **Institution License**: €2000/year
  - Unlimited seats, SSO, custom branding, dedicated support

---

## 🔄 Usage Tracking System

### Tracked Resources

1. **AI Interactions**: Chat messages, research queries, analysis requests
2. **Projects**: Active research projects created by user
3. **Storage**: Files, documents, and data storage usage
4. **Exports**: PDF, Word, LaTeX exports generated

### Usage Enforcement

- **Soft Limits**: Warning at 80% usage
- **Hard Limits**: Block action when limit exceeded
- **Upgrade Prompts**: Show upgrade options when limits are reached

### Database Functions

```sql
-- Check if user can perform action
SELECT check_usage_limits('user-id', 'ai_interactions');

-- Increment usage counter
SELECT increment_usage('user-id', 'ai_interactions', 1);

-- Get current usage stats
SELECT * FROM get_user_usage('user-id');
```

---

## 🎯 Revenue Analytics

### Tracked Metrics

- **MRR/ARR**: Monthly/Annual Recurring Revenue
- **Churn Rate**: Customer cancellation rate
- **Conversion Rate**: Free to paid conversion
- **ARPU**: Average Revenue Per User
- **Customer Acquisition**: New subscriptions per day

### Dashboard Queries

```sql
-- Get today's revenue metrics
SELECT * FROM revenue_metrics
WHERE date = CURRENT_DATE;

-- Calculate conversion rate
SELECT
  (paying_customers::float / total_customers) * 100 as conversion_rate
FROM revenue_metrics
WHERE date = CURRENT_DATE;
```

---

## 🔧 API Endpoints

### Billing APIs

- `POST /api/stripe/create-checkout-session` - Create subscription checkout
- `GET /api/billing/usage` - Get user usage statistics
- `GET /api/billing/subscription` - Get user subscription details
- `POST /api/billing/portal` - Create customer portal session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Usage Examples

```javascript
// Create checkout session
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: 'price_123' })
});

// Get usage stats
const usage = await fetch('/api/billing/usage').then(r => r.json());

// Check usage limit before AI interaction
import { checkUsageLimit, incrementUsage } from '@/lib/usage/tracking';

const canUse = await checkUsageLimit(userId, 'ai_interactions');
if (canUse.allowed) {
  // Perform AI interaction
  await incrementUsage(userId, 'ai_interactions', 1, {
    projectId,
    modelUsed: 'gpt-4',
    tokensUsed: 150
  });
}
```

---

## 🎨 Frontend Components

### Pricing Page

- **Location**: `/pricing`
- **Features**:
  - Interactive pricing cards
  - Monthly/Annual toggle
  - Student verification
  - Institution plans
  - FAQ section

### Usage Dashboard

```jsx
import { UsageDisplay } from '@/components/billing/UsageDisplay';

<UsageDisplay
  className="mb-6"
  showUpgradePrompt={true}
  onUpgrade={() => router.push('/pricing')}
/>
```

### Pricing Cards

```jsx
import { PricingCard } from '@/components/billing/PricingCard';

<PricingCard
  tier={pricingTier}
  currentTier="free"
  isPopular={true}
  onSubscribe={handleSubscribe}
/>
```

---

## 🔒 Security Considerations

### Environment Variables

- **Never commit** Stripe secret keys to Git
- **Use test keys** for development
- **Rotate keys** regularly
- **Verify webhooks** with signing secret

### Webhook Security

```javascript
// Always verify webhook signatures
const signature = headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### Database Security

- **RLS policies** enforce user data isolation
- **Service role** used only for admin operations
- **Usage limits** prevent resource abuse
- **Audit trail** for all billing events

---

## 📈 Testing Strategy

### Test Cases

1. **Subscription Flow**
   - Free trial signup
   - Payment method addition
   - Subscription activation
   - Usage tracking begins

2. **Usage Limits**
   - Warning at 80% usage
   - Block at 100% usage
   - Upgrade prompt display
   - Limit reset on new period

3. **Webhook Processing**
   - Subscription created
   - Payment succeeded/failed
   - Subscription canceled
   - Customer updated

4. **Edge Cases**
   - Failed payments
   - Dunning management
   - Subscription downgrades
   - Refund processing

### Test Commands

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created

# Test usage tracking
curl -X GET http://localhost:3000/api/billing/usage \
  -H "Cookie: your-session-cookie"
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Webhook 400 Errors**
   - Check webhook secret in environment
   - Verify signature validation
   - Ensure correct endpoint URL

2. **Usage Not Tracking**
   - Check database functions exist
   - Verify user has subscription record
   - Confirm RLS policies allow access

3. **Checkout Session Fails**
   - Verify price IDs are correct
   - Check Stripe key configuration
   - Ensure customer creation succeeds

4. **Revenue Metrics Empty**
   - Check webhook processing
   - Verify billing events are recorded
   - Confirm daily metrics calculation

### Debug Commands

```sql
-- Check user subscription
SELECT * FROM subscriptions WHERE user_id = 'user-uuid';

-- Verify usage tracking
SELECT * FROM usage_tracking WHERE user_id = 'user-uuid';

-- Check billing events
SELECT * FROM billing_events
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📚 Next Steps

1. **Set up monitoring** for failed payments and webhooks
2. **Implement email notifications** for billing events
3. **Add dunning management** for failed payments
4. **Create admin dashboard** for revenue analytics
5. **Implement usage-based pricing** for enterprise plans
6. **Add invoice customization** with company branding

## 🎉 Success!

Your Stripe billing system is now ready for production! Users can:

- ✅ Sign up for free trials
- ✅ Subscribe to paid plans
- ✅ Manage their subscriptions
- ✅ Track usage in real-time
- ✅ Receive usage warnings
- ✅ Upgrade seamlessly

The system automatically handles billing, usage enforcement, and revenue tracking.

<!-- Trigger Vercel build -->