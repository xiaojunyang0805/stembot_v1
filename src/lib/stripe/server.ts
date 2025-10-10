/**
 * Stripe Server-Side Configuration
 * WP6.2: Stripe Helper Libraries
 *
 * This module initializes the Stripe server-side SDK and exports
 * tier limit configurations for subscription management.
 *
 * IMPORTANT: Only use this module in server-side code (API routes, server components)
 * Never import this in client-side components as it exposes the secret key.
 */

import Stripe from 'stripe';

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    '❌ STRIPE_SECRET_KEY is missing from environment variables. ' +
      'Please add it to your .env.local file. ' +
      'See STRIPE_SETUP.md for configuration instructions.'
  );
}

if (!stripeSecretKey.startsWith('sk_')) {
  throw new Error(
    '❌ Invalid STRIPE_SECRET_KEY format. ' +
      'Secret key should start with sk_test_ or sk_live_'
  );
}

// =====================================================
// STRIPE CLIENT INITIALIZATION
// =====================================================

/**
 * Stripe server-side client instance
 * Configured with API version 2023-10-16 for consistency
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  // Enable automatic retries for network errors
  maxNetworkRetries: 3,
  // Timeout after 10 seconds
  timeout: 10000,
});

// =====================================================
// SUBSCRIPTION TIER DEFINITIONS
// =====================================================

/**
 * Available subscription tiers in StemBot
 */
export type SubscriptionTier = 'free' | 'student_pro' | 'researcher';

/**
 * Tier limits configuration
 * null = unlimited
 */
export interface TierLimits {
  /** Maximum number of active projects */
  projects: number | null;
  /** Maximum AI interactions per month */
  aiInteractions: number | null;
  /** Memory retention in days (null = unlimited) */
  memoryRetention: number | null;
  /** Displayable tier name */
  displayName: string;
  /** Price in EUR (for display purposes) */
  priceEur: number;
  /** Feature descriptions */
  features: string[];
}

/**
 * Tier limits for each subscription level
 *
 * Usage:
 * ```typescript
 * const userTier = 'free';
 * const limit = TIER_LIMITS[userTier];
 * if (limit.projects !== null && userProjectCount >= limit.projects) {
 *   // User has reached project limit
 * }
 * ```
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    projects: 1,
    aiInteractions: 30,
    memoryRetention: 7, // 7 days
    displayName: 'Free',
    priceEur: 0,
    features: [
      '1 active project',
      '30 AI interactions/month',
      '7 days memory retention',
      'Basic research tools',
    ],
  },
  student_pro: {
    projects: 10,
    aiInteractions: null, // Unlimited
    memoryRetention: null, // Unlimited
    displayName: 'Student Pro',
    priceEur: 10,
    features: [
      'Up to 10 active projects',
      'Unlimited AI interactions',
      'Unlimited memory retention',
      'Priority support',
      'Advanced research tools',
    ],
  },
  researcher: {
    projects: null, // Unlimited
    aiInteractions: null, // Unlimited
    memoryRetention: null, // Unlimited
    displayName: 'Researcher',
    priceEur: 25,
    features: [
      'Unlimited active projects',
      'Unlimited AI interactions',
      'Unlimited memory retention',
      'Priority support',
      'Advanced research tools',
      'Collaboration features',
      'Export to multiple formats',
      'API access',
    ],
  },
};

// =====================================================
// STRIPE PRICE IDS
// =====================================================

/**
 * Stripe Price IDs for subscription products
 * These are created in the Stripe Dashboard
 */
export const STRIPE_PRICE_IDS: Record<Exclude<SubscriptionTier, 'free'>, string> = {
  student_pro: process.env.STRIPE_STUDENT_PRO_PRICE_ID || '',
  researcher: process.env.STRIPE_RESEARCHER_PRICE_ID || '',
};

// Validate that Price IDs are configured
if (!STRIPE_PRICE_IDS.student_pro) {
  console.warn(
    '⚠️  STRIPE_STUDENT_PRO_PRICE_ID is missing. Checkout will fail for Student Pro tier.'
  );
}

if (!STRIPE_PRICE_IDS.researcher) {
  console.warn(
    '⚠️  STRIPE_RESEARCHER_PRICE_ID is missing. Checkout will fail for Researcher tier.'
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get tier limits for a specific subscription tier
 * @param tier - Subscription tier
 * @returns Tier limits configuration
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a tier has unlimited access to a feature
 * @param tier - Subscription tier
 * @param feature - Feature to check ('projects', 'aiInteractions', 'memoryRetention')
 * @returns true if unlimited, false if limited
 */
export function isUnlimited(
  tier: SubscriptionTier,
  feature: keyof Omit<TierLimits, 'displayName' | 'priceEur' | 'features'>
): boolean {
  return TIER_LIMITS[tier][feature] === null;
}

/**
 * Get the Stripe Price ID for a tier
 * @param tier - Subscription tier (cannot be 'free')
 * @returns Stripe Price ID
 * @throws Error if tier is 'free' or Price ID is not configured
 */
export function getPriceId(tier: Exclude<SubscriptionTier, 'free'>): string {
  const priceId = STRIPE_PRICE_IDS[tier];

  if (!priceId) {
    throw new Error(
      `Stripe Price ID not configured for tier: ${tier}. ` +
        'Please add STRIPE_STUDENT_PRO_PRICE_ID and STRIPE_RESEARCHER_PRICE_ID to your environment variables.'
    );
  }

  return priceId;
}

/**
 * Validate if a tier string is a valid SubscriptionTier
 * @param tier - String to validate
 * @returns true if valid tier, false otherwise
 */
export function isValidTier(tier: string): tier is SubscriptionTier {
  return tier === 'free' || tier === 'student_pro' || tier === 'researcher';
}

// =====================================================
// LOGGING
// =====================================================

// Log Stripe configuration on module load (server-side only)
if (typeof window === 'undefined') {
  const mode = stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`✅ Stripe initialized in ${mode} mode`);

  if (mode === 'LIVE') {
    console.warn('⚠️  Running Stripe in LIVE mode - real charges will be processed!');
  }
}
