/**
 * Subscription Manager Component
 *
 * Comprehensive subscription management interface for research platform billing.
 * Handles plan selection, payment processing, and subscription lifecycle.
 *
 * Features:
 * - Plan comparison and selection
 * - Payment method management
 * - Usage tracking and limits
 * - Billing history and invoices
 * - Subscription lifecycle management
 *
 * @location src/components/billing/SubscriptionManager.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Settings,
  Calendar,
  DollarSign,
  Users,
  Zap,
  Star,
  Shield,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    projects: number;
    aiInteractions: number;
    storage: number; // GB
    collaborators: number;
  };
  popular?: boolean;
  recommended?: boolean;
}

/**
 * Props for the SubscriptionManager component
 */
export interface SubscriptionManagerProps {
  currentPlan?: SubscriptionPlan;
  onPlanChange?: (planId: string) => void;
  onCancelSubscription?: () => void;
  className?: string;
}

/**
 * SubscriptionManager component for billing management
 */
export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  currentPlan,
  onPlanChange,
  onCancelSubscription,
  className,
}) => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [usage, setUsage] = useState({
    projects: 2,
    aiInteractions: 145,
    storage: 0.8,
    collaborators: 1,
  });

  // Mock subscription plans
  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Research Starter',
      description: 'Perfect for individual researchers getting started',
      price: { monthly: 0, yearly: 0 },
      features: [
        '3 research projects',
        '100 AI interactions/month',
        '500MB storage',
        'Basic writing assistance',
        'Community support',
      ],
      limits: {
        projects: 3,
        aiInteractions: 100,
        storage: 0.5,
        collaborators: 0,
      },
    },
    {
      id: 'professional',
      name: 'Research Professional',
      description: 'For serious researchers and graduate students',
      price: { monthly: 29, yearly: 290 },
      features: [
        'Unlimited research projects',
        '1,000 AI interactions/month',
        '10GB storage',
        'Advanced writing assistance',
        'Citation management',
        'Collaboration tools',
        'Priority support',
      ],
      limits: {
        projects: -1,
        aiInteractions: 1000,
        storage: 10,
        collaborators: 5,
      },
      popular: true,
    },
    {
      id: 'institutional',
      name: 'Research Institution',
      description: 'For universities and research institutions',
      price: { monthly: 99, yearly: 990 },
      features: [
        'Everything in Professional',
        'Unlimited AI interactions',
        '100GB storage',
        'Advanced analytics',
        'Team management',
        'SSO integration',
        'Custom integrations',
        'Dedicated support',
      ],
      limits: {
        projects: -1,
        aiInteractions: -1,
        storage: 100,
        collaborators: -1,
      },
      recommended: true,
    },
  ];

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentPlan?.id === plan.id;
    const price = billingInterval === 'yearly' ? plan.price.yearly : plan.price.monthly;
    const yearlyDiscount = plan.price.monthly > 0
      ? Math.round((1 - plan.price.yearly / (plan.price.monthly * 12)) * 100)
      : 0;

    return (
      <Card
        key={plan.id}
        className={`p-6 relative ${
          isCurrentPlan
            ? 'ring-2 ring-blue-500 bg-blue-50'
            : plan.popular
            ? 'ring-2 ring-green-500'
            : ''
        }`}
      >
        {plan.popular && (
          <Badge variant="success" className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            Most Popular
          </Badge>
        )}

        {plan.recommended && (
          <Badge variant="info" className="absolute -top-2 right-4">
            Recommended
          </Badge>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(price)}
              {price > 0 && (
                <span className="text-lg font-normal text-gray-600">
                  /{billingInterval === 'yearly' ? 'year' : 'month'}
                </span>
              )}
            </div>
            {billingInterval === 'yearly' && yearlyDiscount > 0 && (
              <div className="text-sm text-green-600">
                Save {yearlyDiscount}% with yearly billing
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-sm font-medium text-gray-900">Usage Limits:</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              Projects: {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
            </div>
            <div>
              AI: {plan.limits.aiInteractions === -1 ? 'Unlimited' : `${plan.limits.aiInteractions}/mo`}
            </div>
            <div>
              Storage: {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`}
            </div>
            <div>
              Team: {plan.limits.collaborators === -1 ? 'Unlimited' : plan.limits.collaborators}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onPlanChange?.(plan.id)}
          disabled={isCurrentPlan}
          className={`w-full ${
            isCurrentPlan
              ? 'bg-gray-400 cursor-not-allowed'
              : plan.popular
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Subscription Management
          </h2>
          <p className="text-gray-600">
            Manage your research platform subscription and billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Download Invoice
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Billing Settings
          </Button>
        </div>
      </div>

      {/* Current Usage */}
      {currentPlan && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Usage</h3>
              <p className="text-gray-600">Your usage for the current billing period</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {currentPlan.name}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Projects</span>
                <span className="text-sm font-medium">
                  {usage.projects}/{currentPlan.limits.projects === -1 ? '∞' : currentPlan.limits.projects}
                </span>
              </div>
              <ProgressBar
                value={getUsagePercentage(usage.projects, currentPlan.limits.projects)}
                max={100}
                size="sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">AI Interactions</span>
                <span className="text-sm font-medium">
                  {usage.aiInteractions}/{currentPlan.limits.aiInteractions === -1 ? '∞' : currentPlan.limits.aiInteractions}
                </span>
              </div>
              <ProgressBar
                value={getUsagePercentage(usage.aiInteractions, currentPlan.limits.aiInteractions)}
                max={100}
                size="sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Storage</span>
                <span className="text-sm font-medium">
                  {usage.storage}GB/{currentPlan.limits.storage === -1 ? '∞' : `${currentPlan.limits.storage}GB`}
                </span>
              </div>
              <ProgressBar
                value={getUsagePercentage(usage.storage, currentPlan.limits.storage)}
                max={100}
                size="sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Collaborators</span>
                <span className="text-sm font-medium">
                  {usage.collaborators}/{currentPlan.limits.collaborators === -1 ? '∞' : currentPlan.limits.collaborators}
                </span>
              </div>
              <ProgressBar
                value={getUsagePercentage(usage.collaborators, currentPlan.limits.collaborators)}
                max={100}
                size="sm"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Billing Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="success" size="sm" className="ml-2">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(renderPlanCard)}
      </div>

      {/* Billing Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <CreditCard className="h-8 w-8 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
              <div className="text-sm text-gray-600">Expires 12/26</div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Update
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Billing</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Next charge</span>
              <span className="font-medium text-gray-900">$29.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Billing date</span>
              <span className="font-medium text-gray-900">Dec 1, 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment method</span>
              <span className="font-medium text-gray-900">•••• 4242</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Actions */}
      {currentPlan && currentPlan.id !== 'free' && (
        <Card className="p-6 border-red-200">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Cancel Subscription</h3>
              <p className="text-red-700 text-sm mb-4">
                You can cancel your subscription at any time. Your access will continue until the end of your current billing period.
              </p>
              <Button
                variant="outline"
                onClick={onCancelSubscription}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Payment Integration:
 *    - Stripe payment processing
 *    - Multiple payment methods (card, PayPal, bank)
 *    - International currency support
 *    - Payment retry and dunning management
 *
 * 2. Subscription Features:
 *    - Prorated upgrades and downgrades
 *    - Trial period management
 *    - Coupon and discount codes
 *    - Corporate billing and invoicing
 *
 * 3. Usage Tracking:
 *    - Real-time usage monitoring
 *    - Usage-based billing
 *    - Overage alerts and handling
 *    - Usage analytics and insights
 *
 * 4. Administrative Features:
 *    - Team and organization management
 *    - Billing permissions and roles
 *    - Automated invoicing
 *    - Tax calculation and compliance
 */