-- =====================================================
-- BILLING SYSTEM SCHEMA FOR STEMBOT
-- WP6.1: Stripe Foundation & Database Schema
-- Created: 2025-10-10
-- =====================================================

-- =====================================================
-- 1. SUBSCRIPTIONS TABLE
-- =====================================================
-- Stores user subscription information and Stripe metadata
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe identifiers
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Subscription details
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'student_pro', 'researcher')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- =====================================================
-- 2. USAGE TRACKING TABLE
-- =====================================================
-- Tracks monthly usage metrics for tier limits enforcement
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Time period (format: 'YYYY-MM')
  month TEXT NOT NULL,

  -- Usage metrics
  ai_interactions_count INTEGER DEFAULT 0 CHECK (ai_interactions_count >= 0),
  active_projects_count INTEGER DEFAULT 0 CHECK (active_projects_count >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_month UNIQUE (user_id, month)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON public.usage_tracking(month);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON public.usage_tracking(user_id, month);

-- =====================================================
-- 3. PAYMENT HISTORY TABLE
-- =====================================================
-- Records all payment transactions for audit trail
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe identifiers
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,

  -- Payment details
  amount_paid INTEGER NOT NULL CHECK (amount_paid >= 0), -- In cents
  currency TEXT DEFAULT 'eur' CHECK (currency IN ('eur', 'usd', 'gbp')),

  -- Payment status
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'pending', 'refunded')),
  paid_at TIMESTAMPTZ,

  -- Additional metadata
  description TEXT,
  receipt_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice_id ON public.payment_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_paid_at ON public.payment_history(paid_at);

-- =====================================================
-- 4. UPDATED_AT TRIGGERS
-- =====================================================
-- Automatically update updated_at timestamp on row changes

-- Trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTIONS POLICIES
-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhook handlers)
CREATE POLICY "Service role can manage all subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- USAGE TRACKING POLICIES
-- Users can read their own usage data
CREATE POLICY "Users can read own usage tracking"
  ON public.usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all usage data
CREATE POLICY "Service role can manage all usage tracking"
  ON public.usage_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

-- PAYMENT HISTORY POLICIES
-- Users can read their own payment history
CREATE POLICY "Users can read own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all payment history
CREATE POLICY "Service role can manage all payment history"
  ON public.payment_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function to atomically increment AI interaction count
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id UUID,
  p_month TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- Insert or update usage record
  INSERT INTO public.usage_tracking (user_id, month, ai_interactions_count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    ai_interactions_count = public.usage_tracking.ai_interactions_count + 1,
    updated_at = NOW()
  RETURNING ai_interactions_count INTO v_new_count;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage for a user
CREATE OR REPLACE FUNCTION public.get_current_usage(
  p_user_id UUID
)
RETURNS TABLE (
  ai_interactions_count INTEGER,
  active_projects_count INTEGER,
  month TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ut.ai_interactions_count,
    ut.active_projects_count,
    ut.month
  FROM public.usage_tracking ut
  WHERE ut.user_id = p_user_id
    AND ut.month = TO_CHAR(NOW(), 'YYYY-MM')
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached tier limits
CREATE OR REPLACE FUNCTION public.check_tier_limits(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_tier TEXT;
  v_usage RECORD;
  v_ai_limit INTEGER;
  v_projects_limit INTEGER;
  v_result JSON;
BEGIN
  -- Get user's tier
  SELECT tier INTO v_tier
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Default to free tier if no subscription
  v_tier := COALESCE(v_tier, 'free');

  -- Get current usage
  SELECT * INTO v_usage
  FROM public.get_current_usage(p_user_id);

  -- Set limits based on tier
  CASE v_tier
    WHEN 'free' THEN
      v_ai_limit := 30;
      v_projects_limit := 1;
    WHEN 'student_pro' THEN
      v_ai_limit := -1; -- Unlimited
      v_projects_limit := 10;
    WHEN 'researcher' THEN
      v_ai_limit := -1; -- Unlimited
      v_projects_limit := -1; -- Unlimited
  END CASE;

  -- Build result
  v_result := json_build_object(
    'tier', v_tier,
    'ai_interactions', json_build_object(
      'current', COALESCE(v_usage.ai_interactions_count, 0),
      'limit', v_ai_limit,
      'exceeded', CASE
        WHEN v_ai_limit = -1 THEN FALSE
        ELSE COALESCE(v_usage.ai_interactions_count, 0) >= v_ai_limit
      END
    ),
    'active_projects', json_build_object(
      'current', COALESCE(v_usage.active_projects_count, 0),
      'limit', v_projects_limit,
      'exceeded', CASE
        WHEN v_projects_limit = -1 THEN FALSE
        ELSE COALESCE(v_usage.active_projects_count, 0) >= v_projects_limit
      END
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. DEFAULT FREE TIER FOR EXISTING USERS
-- =====================================================
-- Create default free tier subscriptions for users without one
INSERT INTO public.subscriptions (user_id, tier, status)
SELECT
  u.id,
  'free',
  'active'
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription tiers and Stripe billing information';
COMMENT ON TABLE public.usage_tracking IS 'Tracks monthly usage metrics for enforcing tier limits';
COMMENT ON TABLE public.payment_history IS 'Audit trail of all payment transactions';

COMMENT ON FUNCTION public.increment_ai_usage IS 'Atomically increments AI interaction count for the current month';
COMMENT ON FUNCTION public.get_current_usage IS 'Retrieves current month usage statistics for a user';
COMMENT ON FUNCTION public.check_tier_limits IS 'Checks if user has exceeded their tier limits';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
