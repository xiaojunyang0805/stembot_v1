/**
 * PricingCard Component
 * Displays pricing tier information with upgrade/subscribe buttons
 */

'use client';

import { useState } from 'react';
import { Check, Crown, Users, Building } from 'lucide-react';
import type { PricingTier } from '../../types/billing';

interface PricingCardProps {
  tier: PricingTier;
  currentTier?: string;
  isPopular?: boolean;
  onSubscribe: (priceId: string) => void;
  loading?: boolean;
}

export function PricingCard({
  tier,
  currentTier,
  isPopular = false,
  onSubscribe,
  loading = false,
}: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const getIcon = () => {
    switch (tier.id) {
      case 'pro_monthly':
      case 'pro_annual':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'department_license':
        return <Users className="w-6 h-6 text-blue-500" />;
      case 'institution_license':
        return <Building className="w-6 h-6 text-purple-500" />;
      default:
        return null;
    }
  };

  const isCurrentTier = currentTier === tier.id;
  const isFree = tier.price === 0;

  return (
    <div
      className={`
        relative rounded-2xl border-2 p-8 transition-all duration-300
        ${isPopular
          ? 'border-blue-500 bg-blue-50 shadow-xl scale-105'
          : 'border-gray-200 bg-white hover:border-blue-300'
        }
        ${isHovered && !isPopular ? 'shadow-lg' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex justify-center items-center mb-4">
          {getIcon()}
          <h3 className="text-2xl font-bold ml-2">{tier.name}</h3>
        </div>

        {tier.requirements?.universityEmail && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-4">
            University Email Required
          </div>
        )}

        <div className="mb-2">
          {isFree ? (
            <span className="text-4xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-4xl font-bold">
                {formatPrice(tier.price, tier.currency)}
              </span>
              <span className="text-gray-600 ml-1">
                {tier.interval && `/${tier.interval}`}
              </span>
            </>
          )}
        </div>

        {tier.features.savings && (
          <div className="text-green-600 font-medium text-sm">
            {tier.features.savings}
          </div>
        )}

        {!isFree && (
          <div className="text-gray-600 text-sm mt-2">
            7-day free trial
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span>
            {typeof tier.features.projects === 'number'
              ? `${tier.features.projects} project${tier.features.projects !== 1 ? 's' : ''}`
              : 'Unlimited projects'
            }
          </span>
        </div>

        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span>
            {typeof tier.features.aiInteractions === 'number'
              ? `${tier.features.aiInteractions} AI interactions/month`
              : 'Unlimited AI interactions'
            }
          </span>
        </div>

        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span>{tier.features.memoryType === 'basic' ? 'Basic' : 'Advanced'} memory system</span>
        </div>

        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span>
            {tier.limits.maxSourcesPerProject === -1
              ? 'Unlimited sources per project'
              : `${tier.limits.maxSourcesPerProject} sources per project`
            }
          </span>
        </div>

        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span>
            {tier.limits.maxFileSize === -1
              ? 'Unlimited file size'
              : `${Math.round(tier.limits.maxFileSize / (1024 * 1024))}MB max file size`
            }
          </span>
        </div>

        {tier.features.exportFormats && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>Export to {tier.features.exportFormats.join(', ')}</span>
          </div>
        )}

        {tier.features.collaboration && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>Team collaboration</span>
          </div>
        )}

        {tier.features.adminDashboard && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>Admin dashboard</span>
          </div>
        )}

        {tier.features.usageAnalytics && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>Usage analytics & reporting</span>
          </div>
        )}

        {tier.features.customBranding && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>Custom branding</span>
          </div>
        )}

        {tier.features.sso && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>Single Sign-On (SSO)</span>
          </div>
        )}

        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span>
            {tier.features.support === 'community' ? 'Community support' :
             tier.features.support === 'priority' ? 'Priority support' :
             tier.features.support === 'dedicated' ? 'Dedicated success manager' :
             tier.features.support}
          </span>
        </div>

        {tier.features.seats && (
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>
              {typeof tier.features.seats === 'number'
                ? `${tier.features.seats} student seats`
                : 'Unlimited student seats'
              }
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSubscribe(tier.id)}
        disabled={loading || isCurrentTier}
        className={`
          w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
          ${isCurrentTier
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isFree
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {loading ? 'Processing...' :
         isCurrentTier ? 'Current Plan' :
         isFree ? 'Get Started' :
         'Start Free Trial'}
      </button>

      {!isFree && !isCurrentTier && (
        <p className="text-xs text-gray-500 text-center mt-3">
          No commitment. Cancel anytime.
        </p>
      )}
    </div>
  );
}