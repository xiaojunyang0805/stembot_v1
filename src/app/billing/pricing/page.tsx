// src/app/(billing)/pricing/page.tsx
/**
 * Pricing plans page
 * Displays subscription tiers and features comparison
 * Located at: src/app/(billing)/pricing/page.tsx
 * URL: /pricing
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - StemBot',
  description: 'Choose the perfect plan for your STEM learning journey',
};

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  buttonText: string;
  buttonStyle: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for getting started with AI tutoring",
    features: [
      "100 AI queries per month",
      "Local AI processing (privacy-first)",
      "Basic project creation",
      "Progress tracking",
      "Dutch/English support",
      "Community support"
    ],
    limitations: [
      "Limited to 3 projects",
      "Basic AI models only",
      "No collaboration features"
    ],
    buttonText: "Get Started Free",
    buttonStyle: "bg-gray-600 text-white hover:bg-gray-700"
  },
  {
    name: "Hobby",
    price: "€15",
    period: "per month",
    description: "For students serious about STEM learning",
    features: [
      "1,000 AI queries per month",
      "Advanced AI models",
      "Unlimited projects",
      "Advanced progress analytics",
      "Collaboration features",
      "Priority support",
      "Export learning reports",
      "Custom learning paths"
    ],
    popular: true,
    buttonText: "Start Free Trial",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700"
  },
  {
    name: "Pro",
    price: "€75",
    period: "per month",
    description: "For educators and institutions",
    features: [
      "10,000 AI queries per month",
      "All Hobby features",
      "Class management tools",
      "Student progress monitoring",
      "Lesson plan generator",
      "Parent/guardian reports",
      "Advanced analytics dashboard",
      "API access",
      "Custom integrations",
      "Dedicated support"
    ],
    buttonText: "Contact Sales",
    buttonStyle: "bg-purple-600 text-white hover:bg-purple-700"
  }
];

export default function PricingPage() {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Learning Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Start with our free tier and upgrade when you need more. All plans include our privacy-first approach with local AI processing.
        </p>
      </div>

      {/* Privacy Banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">🔒</span>
          <h3 className="text-lg font-semibold text-violet-900">Privacy-First Promise</h3>
        </div>
        <p className="text-violet-800">
          All plans process your data locally. Your learning conversations never leave your device.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <div key={tier.name} className={`relative bg-white rounded-xl shadow-lg border-2 ${tier.popular ? 'border-blue-500' : 'border-gray-200'} p-8`}>
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-gray-600 ml-2">/{tier.period}</span>
              </div>
              <p className="text-gray-600">{tier.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
              {tier.limitations && tier.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-3 mt-0.5">×</span>
                  <span className="text-gray-500 text-sm">{limitation}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.name === 'Free' ? '/auth/register' : '/billing/checkout'}
              className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${tier.buttonStyle}`}
            >
              {tier.buttonText}
            </Link>

            {tier.name === 'Hobby' && (
              <p className="text-center text-sm text-gray-500 mt-3">
                14-day free trial, then {tier.price}/{tier.period}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How does local AI processing work?
            </h3>
            <p className="text-gray-600 text-sm">
              We use Ollama to run AI models directly on your device or our secure servers. Your conversations never go to external AI services, ensuring complete privacy.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I upgrade or downgrade anytime?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at your next billing cycle.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What happens to my data if I cancel?
            </h3>
            <p className="text-gray-600 text-sm">
              Since your data is processed locally, you keep everything. You can export your learning history and continue using the free tier.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a student discount?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes! Students get 50% off Hobby plans with valid student ID verification. Contact support for details.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center bg-gray-100 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Need a custom solution?
        </h2>
        <p className="text-gray-600 mb-4">
          We offer custom plans for schools, districts, and large organizations.
        </p>
        <Link
          href="mailto:sales@stembot.nl"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
        >
          Contact Sales
        </Link>
      </div>
    </div>
  );
}
