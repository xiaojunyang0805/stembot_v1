/**
 * Pricing Page
 * Display all pricing tiers with subscription options
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { PricingCard } from '../../components/billing/PricingCard';
import { PRICING, STRIPE_PRODUCTS } from '../../lib/stripe/config';
import type { PricingTier } from '../../types/billing';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error.message || 'Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const individualTiers = [
    PRICING.FREE,
    billingInterval === 'monthly' ? PRICING.PRO_MONTHLY : PRICING.PRO_ANNUAL,
    PRICING.STUDENT_MONTHLY,
  ];

  const institutionTiers = [
    PRICING.DEPARTMENT_LICENSE,
    PRICING.INSTITUTION_LICENSE,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Research Mentoring Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start with a 7-day free trial. No commitment required.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
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
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Individual Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Individual Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
          <h2 className="text-2xl font-bold text-center mb-4">Institution Plans</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Perfect for universities, departments, and educational institutions. Includes admin dashboard,
            usage analytics, and priority support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">What happens after the 7-day free trial?</h3>
              <p className="text-gray-600 text-sm">
                After your trial ends, you'll be automatically converted to a paid subscription.
                You can cancel anytime during the trial period with no charges.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated
                and reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">What qualifies for student pricing?</h3>
              <p className="text-gray-600 text-sm">
                Students with a valid university email address (.edu, .ac.uk, etc.) are eligible
                for student pricing. Verification is automatic during signup.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied with StemBot,
                contact us for a full refund within 30 days of purchase.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, bank transfers, and digital wallets through Stripe.
                All payments are secure and encrypted.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600 text-sm">
                No setup fees, ever. You only pay the subscription price. Institution licenses
                include free onboarding and training sessions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Ready to accelerate your research?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of researchers who are using StemBot to streamline their research process.
          </p>
          <button
            onClick={() => handleSubscribe('pro_monthly')}
            disabled={!!loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        </div>
      </div>
    </div>
  );
}