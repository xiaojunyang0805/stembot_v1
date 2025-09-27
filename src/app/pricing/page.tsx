/**
 * Pricing Page
 * Display all pricing tiers with subscription options
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { PricingCard } from '../../components/billing/PricingCard';
import { loadStripe } from '../../lib/stripe';
import { PRICING, STRIPE_PRODUCTS } from '../../lib/stripe/config';
import type { PricingTier } from '../../types/billing';

const stripePromise = loadStripe();

export default function PricingPage() {
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  useEffect(() => {
    // Fetch user's current subscription
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      const data = await response.json();

      if (response.ok && data.subscription) {
        setCurrentTier(data.subscription.tier || 'free');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'free') {
      // Free tier doesn't require payment
      return;
    }

    setLoading(tierId);

    try {
      // Map tier ID to Stripe price ID
      let priceId = '';
      switch (tierId) {
        case 'pro_monthly':
          priceId = STRIPE_PRODUCTS.PRO_MONTHLY;
          break;
        case 'student_monthly':
          priceId = STRIPE_PRODUCTS.STUDENT_MONTHLY;
          break;
        case 'pro_annual':
          priceId = STRIPE_PRODUCTS.PRO_ANNUAL;
          break;
        case 'department_license':
          priceId = STRIPE_PRODUCTS.DEPARTMENT_LICENSE;
          break;
        case 'institution_license':
          priceId = STRIPE_PRODUCTS.INSTITUTION_LICENSE;
          break;
        default:
          throw new Error('Invalid tier ID');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Mock Stripe Checkout for UI demo
      console.log('Mock subscription created for tier:', tierId);
      alert('Subscription feature is in demo mode. In production, this would redirect to Stripe Checkout.');
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error.message || 'Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const individualTiers = [
    (PRICING as any).FREE || PRICING[0],
    billingInterval === 'monthly' ? (PRICING as any).PRO_MONTHLY || PRICING[1] : (PRICING as any).PRO_ANNUAL || PRICING[2],
    (PRICING as any).STUDENT_MONTHLY || PRICING[3],
  ];

  const institutionTiers = [
    (PRICING as any).DEPARTMENT_LICENSE || PRICING[4],
    (PRICING as any).INSTITUTION_LICENSE || PRICING[5],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Choose Your Research Mentoring Plan
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Start with a 7-day free trial. No commitment required.
          </p>

          {/* Billing Toggle */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingInterval === 'yearly' && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Individual Plans */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Individual Plans</h2>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {individualTiers.map((tier, index) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                currentTier={currentTier}
                isPopular={index === 1} // Make Pro plan popular
                onSubscribe={handleSubscribe}
                loading={loading === tier.id}
              />
            ))}
          </div>
        </div>

        {/* Institution Plans */}
        <div className="mb-16">
          <h2 className="mb-4 text-center text-2xl font-bold">Institution Plans</h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-gray-600">
            Perfect for universities, departments, and educational institutions. Includes admin dashboard,
            usage analytics, and priority support.
          </p>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {institutionTiers.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                currentTier={currentTier}
                onSubscribe={handleSubscribe}
                loading={loading === tier.id}
              />
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6">
              <h3 className="mb-2 font-semibold">What happens after the 7-day free trial?</h3>
              <p className="text-sm text-gray-600">
                After your trial ends, you'll be automatically converted to a paid subscription.
                You can cancel anytime during the trial period with no charges.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <h3 className="mb-2 font-semibold">Can I change my plan later?</h3>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated
                and reflected in your next billing cycle.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <h3 className="mb-2 font-semibold">What qualifies for student pricing?</h3>
              <p className="text-sm text-gray-600">
                Students with a valid university email address (.edu, .ac.uk, etc.) are eligible
                for student pricing. Verification is automatic during signup.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <h3 className="mb-2 font-semibold">Do you offer refunds?</h3>
              <p className="text-sm text-gray-600">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied with StemBot,
                contact us for a full refund within 30 days of purchase.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <h3 className="mb-2 font-semibold">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, bank transfers, and digital wallets through Stripe.
                All payments are secure and encrypted.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <h3 className="mb-2 font-semibold">Is there a setup fee?</h3>
              <p className="text-sm text-gray-600">
                No setup fees, ever. You only pay the subscription price. Institution licenses
                include free onboarding and training sessions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to accelerate your research?</h2>
          <p className="mb-8 text-gray-600">
            Join thousands of researchers who are using StemBot to streamline their research process.
          </p>
          <button
            onClick={() => handleSubscribe('pro_monthly')}
            disabled={!!loading}
            className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        </div>
      </div>
    </div>
  );
}