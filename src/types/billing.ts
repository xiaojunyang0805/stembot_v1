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
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  tier: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}