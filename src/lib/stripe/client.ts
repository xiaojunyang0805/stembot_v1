/**
 * Stripe Client-Side Configuration
 * WP6.2: Stripe Helper Libraries
 *
 * This module loads the Stripe.js library for client-side payment flows.
 * Safe to use in React components and client-side code.
 *
 * Usage:
 * ```typescript
 * import { getStripe } from '@/lib/stripe/client';
 *
 * const stripe = await getStripe();
 * if (stripe) {
 *   // Use stripe for checkout, etc.
 * }
 * ```
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error(
    '❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing from environment variables. ' +
      'Stripe checkout will not work. ' +
      'Please add it to your .env.local file. ' +
      'See STRIPE_SETUP.md for configuration instructions.'
  );
}

if (stripePublishableKey && !stripePublishableKey.startsWith('pk_')) {
  console.error(
    '❌ Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. ' +
      'Publishable key should start with pk_test_ or pk_live_'
  );
}

// =====================================================
// STRIPE CLIENT LOADER
// =====================================================

/**
 * Cached Stripe instance promise
 * We only want to load Stripe.js once per session
 */
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe.js client instance
 *
 * This function:
 * 1. Loads Stripe.js from Stripe's CDN (cached after first load)
 * 2. Initializes with your publishable key
 * 3. Returns null if publishable key is missing
 *
 * @returns Promise that resolves to Stripe instance or null
 *
 * @example
 * ```typescript
 * const stripe = await getStripe();
 * if (!stripe) {
 *   console.error('Stripe failed to load');
 *   return;
 * }
 *
 * // Redirect to Stripe Checkout
 * const { error } = await stripe.redirectToCheckout({
 *   sessionId: checkoutSessionId,
 * });
 * ```
 */
export const getStripe = (): Promise<Stripe | null> => {
  // Return cached promise if it exists
  if (stripePromise) {
    return stripePromise;
  }

  // If no publishable key, return null
  if (!stripePublishableKey) {
    console.error('Cannot load Stripe: publishable key is missing');
    return Promise.resolve(null);
  }

  // Load Stripe.js and cache the promise
  stripePromise = loadStripe(stripePublishableKey, {
    // Stripe.js locale (can be customized for i18n)
    locale: 'en',
  });

  return stripePromise;
};

/**
 * Reset the Stripe instance (useful for testing or switching environments)
 * @internal
 */
export const resetStripe = (): void => {
  stripePromise = null;
};

// =====================================================
// STRIPE ELEMENTS CONFIGURATION
// =====================================================

/**
 * Default Stripe Elements appearance theme
 * Matches StemBot's design system
 */
export const stripeElementsAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#3b82f6', // Blue-600 (primary brand color)
    colorBackground: '#ffffff',
    colorText: '#111827', // Gray-900
    colorDanger: '#ef4444', // Red-500
    fontFamily: 'system-ui, -apple-system, sans-serif',
    spacingUnit: '4px',
    borderRadius: '6px',
  },
  rules: {
    '.Input': {
      border: '1px solid #d1d5db', // Gray-300
      boxShadow: 'none',
      padding: '12px',
    },
    '.Input:focus': {
      border: '1px solid #3b82f6', // Blue-600
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    '.Input--invalid': {
      border: '1px solid #ef4444', // Red-500
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151', // Gray-700
      marginBottom: '8px',
    },
  },
};

/**
 * Stripe Elements options for Payment Element
 */
export const stripeElementsOptions = {
  appearance: stripeElementsAppearance,
  // Enable automatic payment method collection
  paymentMethodCreation: 'manual' as const,
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if Stripe is properly configured (client-side)
 * @returns true if publishable key is present and valid
 */
export function isStripeConfigured(): boolean {
  return !!(
    stripePublishableKey &&
    stripePublishableKey.startsWith('pk_')
  );
}

/**
 * Get the Stripe mode (test or live) based on publishable key
 * @returns 'test' | 'live' | 'unknown'
 */
export function getStripeMode(): 'test' | 'live' | 'unknown' {
  if (!stripePublishableKey) return 'unknown';
  if (stripePublishableKey.startsWith('pk_test_')) return 'test';
  if (stripePublishableKey.startsWith('pk_live_')) return 'live';
  return 'unknown';
}

// =====================================================
// LOGGING
// =====================================================

// Log Stripe configuration on module load (client-side only)
if (typeof window !== 'undefined') {
  const mode = getStripeMode();

  if (mode === 'unknown') {
    console.error('❌ Stripe publishable key is invalid or missing');
  } else {
    console.log(`✅ Stripe client loaded in ${mode.toUpperCase()} mode`);

    if (mode === 'live') {
      console.warn('⚠️  Running Stripe in LIVE mode - real charges will be processed!');
    }
  }
}
