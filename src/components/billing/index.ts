/**
 * Billing Components Export Index
 *
 * Centralized exports for all billing and subscription components.
 * Provides clean imports for subscription management and payment processing UI.
 *
 * @location src/components/billing/index.ts
 */

// Billing and subscription components
export { SubscriptionManager } from './SubscriptionManager';

// Re-export types for convenience
export type {
  SubscriptionPlan,
} from './SubscriptionManager';

/**
 * TODO: Additional billing components to implement
 *
 * 1. PaymentMethodManager - Payment method setup and management
 * 2. InvoiceViewer - Invoice history and download interface
 * 3. UsageAnalytics - Detailed usage tracking and analytics
 * 4. BillingAlerts - Usage alerts and notifications
 * 5. CorporateBilling - Enterprise billing and team management
 * 6. TaxCalculator - Tax calculation and compliance
 * 7. CouponManager - Discount codes and promotional pricing
 * 8. BillingSupport - Billing help and support interface
 */