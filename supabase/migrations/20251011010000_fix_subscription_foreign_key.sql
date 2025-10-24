-- =====================================================
-- FIX SUBSCRIPTION FOREIGN KEY
-- Change subscription.user_id to reference public.users instead of auth.users
-- This supports both custom JWT auth and Supabase OAuth auth
-- =====================================================

-- Drop the old foreign key constraint
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Add new foreign key constraint pointing to public.users
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Also update usage_tracking and payment_history tables for consistency
ALTER TABLE public.usage_tracking
DROP CONSTRAINT IF EXISTS usage_tracking_user_id_fkey;

ALTER TABLE public.usage_tracking
ADD CONSTRAINT usage_tracking_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.payment_history
DROP CONSTRAINT IF EXISTS payment_history_user_id_fkey;

ALTER TABLE public.payment_history
ADD CONSTRAINT payment_history_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT subscriptions_user_id_fkey ON public.subscriptions
IS 'References public.users to support both custom auth and Supabase OAuth';
