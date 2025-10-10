/**
 * Billing and Pricing Types
 */

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string | null;
  features: {
    projects: number | 'unlimited';
    aiInteractions: number | 'unlimited';
    memoryType: string;
    support: string;
    exportFormats?: string[];
    collaboration?: boolean;
    adminDashboard?: boolean;
    usageAnalytics?: boolean;
    customBranding?: boolean;
    sso?: boolean;
    seats?: number | 'unlimited';
    savings?: string;
  };
  limits: {
    maxProjects: number;
    monthlyAiInteractions: number;
    maxSourcesPerProject: number;
    maxFileSize: number;
  };
  requirements?: {
    universityEmail?: boolean;
    verification?: string;
  };
}

export type SubscriptionInterval = 'month' | 'year' | null;

export type ResourceType = 'ai_interactions' | 'projects' | 'storage' | 'exports';

export interface UsageStats {
  aiInteractions: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  projects: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  storage: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  exports: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  tier: string;
  periodStart: string;
  periodEnd: string;
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  usage: number;
  limit: number;
  percentage: number;
  unlimited: boolean;
}

export interface BillingEvent {
  id: string;
  user_id: string;
  event_type: 'subscription_created' | 'subscription_updated' | 'payment_succeeded' | 'payment_failed' | 'subscription_cancelled';
  stripe_event_id?: string;
  amount?: number;
  currency?: string;
  subscription_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: 'free' | 'student_pro' | 'researcher';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Usage tracking record from usage_tracking table
 * Tracks monthly usage for tier limit enforcement
 */
export interface UsageData {
  id: string;
  user_id: string;
  month: string; // Format: 'YYYY-MM'
  ai_interactions_count: number;
  active_projects_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payment history record from payment_history table
 */
export interface PaymentHistory {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  stripe_payment_intent_id: string | null;
  amount_paid: number; // In cents
  currency: 'eur' | 'usd' | 'gbp';
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  paid_at: string | null;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription with computed status fields
 */
export interface SubscriptionWithStatus extends Subscription {
  isActive: boolean;
  isTrialing: boolean;
  willCancel: boolean;
  daysRemaining: number | null;
}

/**
 * Usage data with tier limits for comparison
 */
export interface UsageWithLimits extends UsageData {
  tier: 'free' | 'student_pro' | 'researcher';
  ai_interactions_limit: number | null;
  active_projects_limit: number | null;
  ai_interactions_exceeded: boolean;
  active_projects_exceeded: boolean;
  ai_interactions_percentage: number;
  active_projects_percentage: number;
}

/**
 * Complete billing status for a user
 */
export interface UserBillingStatus {
  subscription: SubscriptionWithStatus;
  usage: UsageWithLimits;
  recentPayments: PaymentHistory[];
}

/**
 * Limit check result
 */
export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number | null;
  exceeded: boolean;
  percentageUsed: number | null;
  tier: 'free' | 'student_pro' | 'researcher';
  suggestion?: string;
}