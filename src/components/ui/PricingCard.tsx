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
    if (limit === 'unlimited') return 0;
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
      <div className="text-center mb-8">
        <h2 className="academic-heading-primary mb-4">
          Choose Your Research Plan
        </h2>
        <p className="academic-body-lead text-academic-secondary mb-6">
          Unlock advanced AI-powered research capabilities with our professional plans
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-academic-primary' : 'text-academic-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => onBillingPeriodChange?.(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              billingPeriod === 'yearly' ? 'bg-academic-blue' : 'bg-academic-primary'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              billingPeriod === 'yearly' ? 'transform translate-x-6' : ''
            }`} />
          </button>
          <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-academic-primary' : 'text-academic-muted'}`}>
            Yearly
          </span>
          {billingPeriod === 'yearly' && (
            <span className="px-2 py-1 bg-semantic-success text-white text-xs rounded-full animate-pulse">
              Save 20%
            </span>
          )}
        </div>

        {/* Educational Discounts Banner */}
        {(isStudent || isUniversity) && (
          <div className="p-4 bg-semantic-success rounded-lg mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-white" />
              <span className="text-white font-medium">
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
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${tierConfig[currentTier].bgColor}`}>
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="academic-heading-section mb-1">
                Current Usage - {currentPlan.name}
              </h3>
              <p className="text-sm text-academic-secondary">
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
                <div key={usage.label} className="p-3 bg-academic-primary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-academic-blue" />
                    <span className="text-sm font-medium text-academic-primary">
                      {usage.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-academic-primary">
                      {usage.used}{usage.unit && ` ${usage.unit}`}
                    </span>
                    <span className="text-sm text-academic-muted">
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
                    <p className="text-xs text-semantic-warning mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                'border-academic-primary bg-white hover:border-academic-blue'
              } ${isCurrentPlan ? 'ring-2 ring-semantic-success' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-semantic-warning text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-memory-purple text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="px-2 py-1 bg-semantic-success text-white text-xs font-medium rounded-full">
                    Current
                  </span>
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'text-white' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`p-3 rounded-full inline-flex mb-3 ${
                    plan.popular ? 'bg-white bg-opacity-20' : config.bgColor
                  }`}>
                    <Icon className={`h-6 w-6 ${plan.popular ? 'text-white' : 'text-white'}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
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
                <div className="text-center mb-6">
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
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className={`text-sm line-through ${
                            plan.popular ? 'text-blue-200' : 'text-academic-muted'
                          }`}>
                            ${billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly}
                          </span>
                          <span className="px-2 py-1 bg-semantic-success text-white text-xs rounded">
                            {pricing.discount}% off
                          </span>
                        </div>
                      )}

                      {billingPeriod === 'yearly' && plan.price.discount && (
                        <p className={`text-xs mt-1 ${
                          plan.popular ? 'text-blue-100' : 'text-academic-muted'
                        }`}>
                          Save {plan.price.discount}% annually
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.slice(0, 6).map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className={`h-4 w-4 mt-0.5 ${
                          plan.popular ? 'text-white' : 'text-semantic-success'
                        }`} />
                      ) : (
                        <X className={`h-4 w-4 mt-0.5 ${
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
                          <span className={`text-xs ml-1 ${
                            plan.popular ? 'text-blue-100' : 'text-academic-muted'
                          }`}>
                            ({feature.limit})
                          </span>
                        )}
                        {feature.limit === 'unlimited' && (
                          <span className={`text-xs ml-1 ${
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
                      <div key={index} className={`flex items-center gap-2 mb-2 p-2 rounded ${
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
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-semantic-success text-white cursor-not-allowed'
                      : plan.popular
                      ? 'bg-white text-academic-blue hover:bg-gray-100'
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
                  <p className="text-xs text-center mt-3 text-academic-muted">
                    No credit card required
                  </p>
                )}
                {plan.tier === 'pro' && (
                  <p className="text-xs text-center mt-3 text-academic-muted">
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
                <tr className="border-b border-academic-primary">
                  <th className="text-left py-3 pr-4 text-sm font-medium text-academic-primary">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4 text-sm font-medium text-academic-primary">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Get unique features across all plans */}
                {Array.from(new Set(plans.flatMap(plan => plan.features.map(f => f.name)))).map((featureName) => (
                  <tr key={featureName} className="border-b border-academic-primary hover:bg-academic-primary">
                    <td className="py-3 pr-4 text-sm text-academic-primary font-medium">
                      {featureName}
                    </td>
                    {plans.map((plan) => {
                      const feature = plan.features.find(f => f.name === featureName);
                      return (
                        <td key={plan.id} className="text-center py-3 px-4">
                          {feature?.included ? (
                            feature.limit === 'unlimited' ? (
                              <div className="flex items-center justify-center gap-1">
                                <Check className="h-4 w-4 text-semantic-success" />
                                <span className="text-xs text-semantic-success">Unlimited</span>
                              </div>
                            ) : feature.limit ? (
                              <div className="flex items-center justify-center gap-1">
                                <Check className="h-4 w-4 text-semantic-success" />
                                <span className="text-xs text-academic-primary">{feature.limit}</span>
                              </div>
                            ) : (
                              <Check className="h-4 w-4 text-semantic-success mx-auto" />
                            )
                          ) : (
                            <X className="h-4 w-4 text-academic-muted mx-auto" />
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
      <div className="text-center mt-12">
        <div className="p-8 bg-gradient-to-r from-academic-blue to-memory-purple rounded-lg text-white">
          <Building className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Enterprise & Institutional</h3>
          <p className="text-blue-100 mb-4">
            Custom solutions for universities, research institutions, and large organizations
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
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
            className="bg-white text-academic-blue py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Sales Team
          </button>
        </div>
      </div>

      {/* Discount Banner */}
      {showYearlyDiscount && billingPeriod === 'monthly' && (
        <div className="fixed bottom-4 right-4 p-4 bg-semantic-warning text-white rounded-lg shadow-lg max-w-sm animate-slide-in z-50">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Save 20% with Yearly Billing</h4>
              <p className="text-sm text-yellow-100 mb-3">
                Switch to yearly billing and save on your subscription
              </p>
              <button
                onClick={() => onBillingPeriodChange?.('yearly')}
                className="text-xs bg-white text-semantic-warning py-1 px-3 rounded font-medium hover:bg-gray-100"
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