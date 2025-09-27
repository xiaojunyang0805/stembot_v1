/**
 * Pricing Card Component
 *
 * Revenue-ready billing component with tier comparison and upgrade prompts.
 * Designed for academic institutions with educational discounts.
 *
 * Features:
 * - Free vs Pro tier comparison with clear value proposition
 * - Usage limits display with progress tracking
 * - Strategic upgrade prompts and conversion optimization
 * - University discount options and institutional pricing
 * - Memory system integration for usage analytics
 *
 * @location src/components/ui/PricingCard.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';

import {
  Zap,
  Crown,
  Star,
  Check,
  X,
  ArrowRight,
  Brain,
  Sparkles,
  GraduationCap,
  Building,
  Users,
  Lock,
  Unlock,
  TrendingUp,
  Clock,
  Shield,
  Target,
  Award,
  Gift,
} from 'lucide-react';

/**
 * Subscription tier enumeration
 */
export type SubscriptionTier = 'free' | 'pro' | 'institutional' | 'enterprise';

/**
 * Pricing plan interface
 */
export interface PricingPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
    discount?: number; // percentage off yearly
  };
  features: PricingFeature[];
  limits: UsageLimits;
  highlights: string[];
  popular?: boolean;
  recommended?: boolean;
  cta: string;
  discounts?: {
    student: number;
    university: number;
    nonprofit: number;
  };
}

/**
 * Pricing feature interface
 */
export interface PricingFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number | 'unlimited';
  highlight?: boolean;
}

/**
 * Usage limits interface
 */
export interface UsageLimits {
  projects: number | 'unlimited';
  aiInteractions: number | 'unlimited';
  memoryStorage: number | 'unlimited'; // in GB
  collaborators: number | 'unlimited';
  exports: number | 'unlimited';
  support: 'community' | 'email' | 'priority' | 'dedicated';
}

/**
 * Current usage interface
 */
export interface CurrentUsage {
  projects: number;
  aiInteractions: number;
  memoryStorage: number;
  collaborators: number;
  exports: number;
  period: 'monthly' | 'yearly';
}

/**
 * Props for the PricingCard component
 */
export interface PricingCardProps {
  plans: PricingPlan[];
  currentTier: SubscriptionTier;
  currentUsage: CurrentUsage;
  billingPeriod: 'monthly' | 'yearly';
  isStudent?: boolean;
  isUniversity?: boolean;
  onPlanSelect?: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  onBillingPeriodChange?: (period: 'monthly' | 'yearly') => void;
  onContactSales?: () => void;
  showComparison?: boolean;
  className?: string;
}

/**
 * PricingCard component for subscription management
 */
export const PricingCard: React.FC<PricingCardProps> = ({
  plans,
  currentTier,
  currentUsage,
  billingPeriod,
  isStudent = false,
  isUniversity = false,
  onPlanSelect,
  onBillingPeriodChange,
  onContactSales,
  showComparison = true,
  className,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showYearlyDiscount, setShowYearlyDiscount] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowYearlyDiscount(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const tierConfig = {
    free: {
      color: 'text-academic-primary',
      bgColor: 'bg-academic-primary',
      borderColor: 'border-academic-primary',
      icon: Unlock,
    },
    pro: {
      color: 'text-academic-blue',
      bgColor: 'bg-academic-blue',
      borderColor: 'border-academic-blue',
      icon: Zap,
    },
    institutional: {
      color: 'text-memory-purple',
      bgColor: 'bg-memory-purple',
      borderColor: 'border-memory-purple',
      icon: Building,
    },
    enterprise: {
      color: 'text-semantic-warning',
      bgColor: 'bg-semantic-warning',
      borderColor: 'border-semantic-warning',
      icon: Crown,
    },
  };

  const getUsagePercentage = (used: number, limit: number | 'unlimited'): number => {
    if (limit === 'unlimited') {
return 0;
}
    return Math.min((used / limit) * 100, 100);
  };

  const formatPrice = (plan: PricingPlan): { amount: number; discount?: number } => {
    const basePrice = billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly;
    let finalPrice = basePrice;
    let discountPercent = 0;

    // Apply educational discounts
    if (isStudent && plan.discounts?.student) {
      discountPercent = plan.discounts.student;
      finalPrice = basePrice * (1 - discountPercent / 100);
    } else if (isUniversity && plan.discounts?.university) {
      discountPercent = plan.discounts.university;
      finalPrice = basePrice * (1 - discountPercent / 100);
    }

    return { amount: finalPrice, discount: discountPercent };
  };

  const getCurrentPlan = () => plans.find(plan => plan.tier === currentTier);
  const currentPlan = getCurrentPlan();

  return (
    <div className={`academic-container ${className}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="academic-heading-primary mb-4">
          Choose Your Research Plan
        </h2>
        <p className="academic-body-lead text-academic-secondary mb-6">
          Unlock advanced AI-powered research capabilities with our professional plans
        </p>

        {/* Billing Toggle */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-academic-primary' : 'text-academic-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => onBillingPeriodChange?.(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative h-6 w-12 rounded-full transition-colors ${
              billingPeriod === 'yearly' ? 'bg-academic-blue' : 'bg-academic-primary'
            }`}
          >
            <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
              billingPeriod === 'yearly' ? 'translate-x-6 transform' : ''
            }`} />
          </button>
          <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-academic-primary' : 'text-academic-muted'}`}>
            Yearly
          </span>
          {billingPeriod === 'yearly' && (
            <span className="bg-semantic-success animate-pulse rounded-full px-2 py-1 text-xs text-white">
              Save 20%
            </span>
          )}
        </div>

        {/* Educational Discounts Banner */}
        {(isStudent || isUniversity) && (
          <div className="bg-semantic-success mb-6 rounded-lg p-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <GraduationCap className="h-5 w-5 text-white" />
              <span className="font-medium text-white">
                {isStudent ? 'Student Discount' : 'University Discount'} Applied!
              </span>
            </div>
            <p className="text-sm text-white">
              {isStudent ? 'Save up to 50% with your student status' : 'Institutional pricing available'}
            </p>
          </div>
        )}
      </div>

      {/* Usage Overview for Current Plan */}
      {currentPlan && (
        <div className="academic-research-card mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${tierConfig[currentTier].bgColor}`}>
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="academic-heading-section mb-1">
                Current Usage - {currentPlan.name}
              </h3>
              <p className="text-academic-secondary text-sm">
                Track your research activity and plan utilization
              </p>
            </div>
          </div>

          <div className="academic-grid-2 gap-4">
            {[
              { label: 'Projects', used: currentUsage.projects, limit: currentPlan.limits.projects, icon: Target },
              { label: 'AI Interactions', used: currentUsage.aiInteractions, limit: currentPlan.limits.aiInteractions, icon: Brain },
              { label: 'Memory Storage', used: currentUsage.memoryStorage, limit: currentPlan.limits.memoryStorage, icon: Star, unit: 'GB' },
              { label: 'Exports', used: currentUsage.exports, limit: currentPlan.limits.exports, icon: ArrowRight },
            ].map((usage) => {
              const Icon = usage.icon;
              const percentage = getUsagePercentage(usage.used, usage.limit);
              const isNearLimit = percentage > 80;

              return (
                <div key={usage.label} className="bg-academic-primary rounded-lg p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="text-academic-blue h-4 w-4" />
                    <span className="text-academic-primary text-sm font-medium">
                      {usage.label}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-academic-primary text-lg font-bold">
                      {usage.used}{usage.unit && ` ${usage.unit}`}
                    </span>
                    <span className="text-academic-muted text-sm">
                      / {usage.limit === 'unlimited' ? '∞' : `${usage.limit}${usage.unit ? ` ${usage.unit}` : ''}`}
                    </span>
                  </div>
                  {usage.limit !== 'unlimited' && (
                    <div className="progress-bar h-2">
                      <div
                        className={`progress-fill ${isNearLimit ? 'bg-semantic-warning' : 'bg-academic-blue'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                  {isNearLimit && (
                    <p className="text-semantic-warning mt-1 text-xs">
                      Approaching limit - consider upgrading
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const config = tierConfig[plan.tier];
          const Icon = config.icon;
          const pricing = formatPrice(plan);
          const isCurrentPlan = plan.tier === currentTier;
          const isUpgrade = plans.findIndex(p => p.tier === currentTier) < plans.findIndex(p => p.tier === plan.tier);

          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 transition-all ${
                plan.popular ? 'border-academic-blue bg-academic-blue scale-105 transform' :
                plan.recommended ? 'border-memory-purple bg-white' :
                'border-academic-primary hover:border-academic-blue bg-white'
              } ${isCurrentPlan ? 'ring-semantic-success ring-2' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <span className="bg-semantic-warning flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <span className="bg-memory-purple flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-semantic-success rounded-full px-2 py-1 text-xs font-medium text-white">
                    Current
                  </span>
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'text-white' : ''}`}>
                {/* Plan Header */}
                <div className="mb-6 text-center">
                  <div className={`mb-3 inline-flex rounded-full p-3 ${
                    plan.popular ? 'bg-white bg-opacity-20' : config.bgColor
                  }`}>
                    <Icon className={`h-6 w-6 ${plan.popular ? 'text-white' : 'text-white'}`} />
                  </div>
                  <h3 className={`mb-2 text-xl font-bold ${
                    plan.popular ? 'text-white' : 'text-academic-primary'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${
                    plan.popular ? 'text-blue-100' : 'text-academic-secondary'
                  }`}>
                    {plan.tagline}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6 text-center">
                  {plan.tier === 'free' ? (
                    <div className={`text-3xl font-bold ${
                      plan.popular ? 'text-white' : 'text-academic-primary'
                    }`}>
                      Free
                    </div>
                  ) : plan.tier === 'enterprise' ? (
                    <div className={`text-2xl font-bold ${
                      plan.popular ? 'text-white' : 'text-academic-primary'
                    }`}>
                      Custom
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <span className={`text-3xl font-bold ${
                          plan.popular ? 'text-white' : 'text-academic-primary'
                        }`}>
                          ${Math.round(pricing.amount)}
                        </span>
                        <span className={`text-sm ${
                          plan.popular ? 'text-blue-100' : 'text-academic-muted'
                        }`}>
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>

                      {pricing.discount && pricing.discount > 0 && (
                        <div className="mt-1 flex items-center justify-center gap-2">
                          <span className={`text-sm line-through ${
                            plan.popular ? 'text-blue-200' : 'text-academic-muted'
                          }`}>
                            ${billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly}
                          </span>
                          <span className="bg-semantic-success rounded px-2 py-1 text-xs text-white">
                            {pricing.discount}% off
                          </span>
                        </div>
                      )}

                      {billingPeriod === 'yearly' && plan.price.discount && (
                        <p className={`mt-1 text-xs ${
                          plan.popular ? 'text-blue-100' : 'text-academic-muted'
                        }`}>
                          Save {plan.price.discount}% annually
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-6 space-y-3">
                  {plan.features.slice(0, 6).map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className={`mt-0.5 h-4 w-4 ${
                          plan.popular ? 'text-white' : 'text-semantic-success'
                        }`} />
                      ) : (
                        <X className={`mt-0.5 h-4 w-4 ${
                          plan.popular ? 'text-blue-200' : 'text-academic-muted'
                        }`} />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm ${
                          feature.included
                            ? (plan.popular ? 'text-white' : 'text-academic-primary')
                            : (plan.popular ? 'text-blue-200' : 'text-academic-muted')
                        } ${feature.highlight ? 'font-medium' : ''}`}>
                          {feature.name}
                        </span>
                        {feature.limit && feature.limit !== 'unlimited' && (
                          <span className={`ml-1 text-xs ${
                            plan.popular ? 'text-blue-100' : 'text-academic-muted'
                          }`}>
                            ({feature.limit})
                          </span>
                        )}
                        {feature.limit === 'unlimited' && (
                          <span className={`ml-1 text-xs ${
                            plan.popular ? 'text-blue-100' : 'text-semantic-success'
                          }`}>
                            (unlimited)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                {plan.highlights.length > 0 && (
                  <div className="mb-6">
                    {plan.highlights.map((highlight, index) => (
                      <div key={index} className={`mb-2 flex items-center gap-2 rounded p-2 ${
                        plan.popular ? 'bg-white bg-opacity-10' : 'bg-academic-primary'
                      }`}>
                        <Sparkles className={`h-3 w-3 ${
                          plan.popular ? 'text-white' : 'text-academic-blue'
                        }`} />
                        <span className={`text-xs ${
                          plan.popular ? 'text-white' : 'text-academic-primary'
                        }`}>
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (plan.tier === 'enterprise') {
                      onContactSales?.();
                    } else {
                      onPlanSelect?.(plan.id, billingPeriod);
                    }
                  }}
                  disabled={isCurrentPlan}
                  className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-semantic-success cursor-not-allowed text-white'
                      : plan.popular
                      ? 'text-academic-blue bg-white hover:bg-gray-100'
                      : 'academic-btn-primary hover:bg-academic-blue-700'
                  }`}
                >
                  {isCurrentPlan ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" />
                      Current Plan
                    </span>
                  ) : plan.tier === 'enterprise' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" />
                      Contact Sales
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isUpgrade ? (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          Upgrade to {plan.name}
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          {plan.cta}
                        </>
                      )}
                    </span>
                  )}
                </button>

                {/* Additional Info */}
                {plan.tier === 'free' && (
                  <p className="text-academic-muted mt-3 text-center text-xs">
                    No credit card required
                  </p>
                )}
                {plan.tier === 'pro' && (
                  <p className="text-academic-muted mt-3 text-center text-xs">
                    Cancel anytime
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      {showComparison && (
        <div className="academic-research-card">
          <h3 className="academic-heading-section mb-6 text-center">
            Detailed Feature Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-academic-primary border-b">
                  <th className="text-academic-primary py-3 pr-4 text-left text-sm font-medium">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-academic-primary px-4 py-3 text-center text-sm font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Get unique features across all plans */}
                {Array.from(new Set(plans.flatMap(plan => plan.features.map(f => f.name)))).map((featureName) => (
                  <tr key={featureName} className="border-academic-primary hover:bg-academic-primary border-b">
                    <td className="text-academic-primary py-3 pr-4 text-sm font-medium">
                      {featureName}
                    </td>
                    {plans.map((plan) => {
                      const feature = plan.features.find(f => f.name === featureName);
                      return (
                        <td key={plan.id} className="px-4 py-3 text-center">
                          {feature?.included ? (
                            feature.limit === 'unlimited' ? (
                              <div className="flex items-center justify-center gap-1">
                                <Check className="text-semantic-success h-4 w-4" />
                                <span className="text-semantic-success text-xs">Unlimited</span>
                              </div>
                            ) : feature.limit ? (
                              <div className="flex items-center justify-center gap-1">
                                <Check className="text-semantic-success h-4 w-4" />
                                <span className="text-academic-primary text-xs">{feature.limit}</span>
                              </div>
                            ) : (
                              <Check className="text-semantic-success mx-auto h-4 w-4" />
                            )
                          ) : (
                            <X className="text-academic-muted mx-auto h-4 w-4" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enterprise Contact */}
      <div className="mt-12 text-center">
        <div className="from-academic-blue to-memory-purple rounded-lg bg-gradient-to-r p-8 text-white">
          <Building className="mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-2xl font-bold">Enterprise & Institutional</h3>
          <p className="mb-4 text-blue-100">
            Custom solutions for universities, research institutions, and large organizations
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1 text-sm">
              <Shield className="h-4 w-4" />
              SSO Integration
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              Unlimited Users
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Award className="h-4 w-4" />
              Dedicated Support
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Lock className="h-4 w-4" />
              Advanced Security
            </span>
          </div>
          <button
            onClick={onContactSales}
            className="text-academic-blue rounded-lg bg-white px-6 py-2 font-medium transition-colors hover:bg-gray-100"
          >
            Contact Sales Team
          </button>
        </div>
      </div>

      {/* Discount Banner */}
      {showYearlyDiscount && billingPeriod === 'monthly' && (
        <div className="bg-semantic-warning animate-slide-in fixed bottom-4 right-4 z-50 max-w-sm rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <Gift className="mt-0.5 h-5 w-5" />
            <div>
              <h4 className="mb-1 font-medium">Save 20% with Yearly Billing</h4>
              <p className="mb-3 text-sm text-yellow-100">
                Switch to yearly billing and save on your subscription
              </p>
              <button
                onClick={() => onBillingPeriodChange?.('yearly')}
                className="text-semantic-warning rounded bg-white px-3 py-1 text-xs font-medium hover:bg-gray-100"
              >
                Switch to Yearly
              </button>
            </div>
            <button
              onClick={() => setShowYearlyDiscount(false)}
              className="text-yellow-100 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCard;