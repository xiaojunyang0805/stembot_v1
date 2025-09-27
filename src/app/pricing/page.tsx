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
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '3rem 0'}}>
      <div style={{margin: '0 auto', maxWidth: '80rem', padding: '0 1rem'}}>
        {/* Header */}
        <div style={{marginBottom: '3rem', textAlign: 'center'}}>
          <h1 style={{marginBottom: '1rem', fontSize: '2.25rem', fontWeight: 'bold', color: '#111827'}}>
            Choose Your Research Mentoring Plan
          </h1>
          <p style={{marginBottom: '2rem', fontSize: '1.25rem', color: '#4b5563'}}>
            Start with a 7-day free trial. No commitment required.
          </p>

          {/* Billing Toggle */}
          <div style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'}}>
            <span style={{fontSize: '0.875rem', fontWeight: '500', color: billingInterval === 'monthly' ? '#111827' : '#6b7280'}}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              style={{
                position: 'relative',
                display: 'inline-flex',
                height: '1.5rem',
                width: '2.75rem',
                alignItems: 'center',
                borderRadius: '9999px',
                backgroundColor: '#e5e7eb',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: '1rem',
                  width: '1rem',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'transform 0.2s',
                  transform: billingInterval === 'yearly' ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                }}
              />
            </button>
            <span style={{fontSize: '0.875rem', fontWeight: '500', color: billingInterval === 'yearly' ? '#111827' : '#6b7280'}}>
              Yearly
            </span>
            {billingInterval === 'yearly' && (
              <span style={{borderRadius: '9999px', backgroundColor: '#dcfce7', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '500', color: '#166534'}}>
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Individual Plans */}
        <div style={{marginBottom: '4rem'}}>
          <h2 style={{marginBottom: '2rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>Individual Plans</h2>
          <div style={{margin: '0 auto', display: 'grid', maxWidth: '72rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem'}}>
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
        <div style={{marginBottom: '4rem'}}>
          <h2 style={{marginBottom: '1rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>Institution Plans</h2>
          <p style={{margin: '0 auto', marginBottom: '2rem', maxWidth: '42rem', textAlign: 'center', color: '#4b5563'}}>
            Perfect for universities, departments, and educational institutions. Includes admin dashboard,
            usage analytics, and priority support.
          </p>
          <div style={{margin: '0 auto', display: 'grid', maxWidth: '56rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
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
        <div style={{margin: '0 auto', maxWidth: '56rem'}}>
          <h2 style={{marginBottom: '2rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>Frequently Asked Questions</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
            <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem', fontWeight: '600'}}>What happens after the 7-day free trial?</h3>
              <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                After your trial ends, you'll be automatically converted to a paid subscription.
                You can cancel anytime during the trial period with no charges.
              </p>
            </div>

            <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem', fontWeight: '600'}}>Can I change my plan later?</h3>
              <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated
                and reflected in your next billing cycle.
              </p>
            </div>

            <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem', fontWeight: '600'}}>What qualifies for student pricing?</h3>
              <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                Students with a valid university email address (.edu, .ac.uk, etc.) are eligible
                for student pricing. Verification is automatic during signup.
              </p>
            </div>

            <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem', fontWeight: '600'}}>Do you offer refunds?</h3>
              <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied with StemBot,
                contact us for a full refund within 30 days of purchase.
              </p>
            </div>

            <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem', fontWeight: '600'}}>What payment methods do you accept?</h3>
              <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                We accept all major credit cards, bank transfers, and digital wallets through Stripe.
                All payments are secure and encrypted.
              </p>
            </div>

            <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem', fontWeight: '600'}}>Is there a setup fee?</h3>
              <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                No setup fees, ever. You only pay the subscription price. Institution licenses
                include free onboarding and training sessions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{marginTop: '4rem', textAlign: 'center'}}>
          <h2 style={{marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold'}}>Ready to accelerate your research?</h2>
          <p style={{marginBottom: '2rem', color: '#4b5563'}}>
            Join thousands of researchers who are using StemBot to streamline their research process.
          </p>
          <button
            onClick={() => handleSubscribe('pro_monthly')}
            disabled={!!loading}
            style={{
              borderRadius: '0.5rem',
              backgroundColor: '#2563eb',
              padding: '0.75rem 2rem',
              fontWeight: '500',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              opacity: loading ? '0.5' : '1'
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        </div>
      </div>
    </div>
  );
}