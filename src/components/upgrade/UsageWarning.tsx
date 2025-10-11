/**
 * UsageWarning Component
 *
 * Displays usage statistics with visual progress indicators
 * Shows warnings when approaching limits
 * Provides upgrade prompts for Free tier users
 *
 * Usage: <UsageWarning current={45} limit={50} tier="free" feature="ai_chat" />
 */

'use client';

import { useMemo } from 'react';

export type UsageFeature = 'ai_chat' | 'projects' | 'storage' | 'sources';

export interface UsageWarningProps {
  current: number;
  limit: number | null; // null = unlimited
  tier: 'free' | 'student_pro' | 'researcher';
  feature: UsageFeature;
  showUpgradeButton?: boolean;
  onUpgradeClick?: () => void;
  compact?: boolean; // Compact mode for sidebars/small spaces
  className?: string;
}

export default function UsageWarning({
  current,
  limit,
  tier,
  feature,
  showUpgradeButton = true,
  onUpgradeClick,
  compact = false,
  className = ''
}: UsageWarningProps) {
  const unlimited = limit === null;
  const percentage = unlimited ? 0 : Math.min((current / limit) * 100, 100);

  const status = useMemo(() => {
    if (unlimited) return 'unlimited';
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'approaching';
    return 'normal';
  }, [percentage, unlimited]);

  const getStatusColor = () => {
    switch (status) {
      case 'exceeded':
        return { bg: '#fee2e2', bar: '#ef4444', text: '#991b1b' };
      case 'warning':
        return { bg: '#fef3c7', bar: '#eab308', text: '#92400e' };
      case 'approaching':
        return { bg: '#dbeafe', bar: '#3b82f6', text: '#1e40af' };
      case 'unlimited':
        return { bg: '#d1fae5', bar: '#22c55e', text: '#065f46' };
      default:
        return { bg: '#f3f4f6', bar: '#22c55e', text: '#374151' };
    }
  };

  const getFeatureLabel = () => {
    switch (feature) {
      case 'ai_chat':
        return 'AI Interactions';
      case 'projects':
        return 'Projects';
      case 'storage':
        return 'Storage';
      case 'sources':
        return 'Sources';
      default:
        return 'Usage';
    }
  };

  const getStatusMessage = () => {
    if (unlimited) {
      return 'Unlimited usage';
    }
    if (status === 'exceeded') {
      return `Limit reached! Upgrade to continue.`;
    }
    if (status === 'warning') {
      return `Almost at limit - ${limit - current} remaining`;
    }
    if (status === 'approaching') {
      return `${limit - current} remaining this month`;
    }
    return `${limit - current} remaining`;
  };

  const colors = getStatusColor();
  const isFree = tier === 'free';
  const shouldShowUpgrade = isFree && showUpgradeButton && (status === 'warning' || status === 'exceeded');

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      window.location.href = '/settings?tab=billing';
    }
  };

  // COMPACT MODE (for sidebars, memory panels, etc.)
  if (compact) {
    return (
      <div
        className={className}
        style={{
          padding: '0.75rem',
          backgroundColor: colors.bg,
          borderRadius: '0.375rem',
          border: `1px solid ${colors.bar}`
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: colors.text
          }}>
            {getFeatureLabel()}
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: colors.text,
            fontWeight: '600'
          }}>
            {unlimited ? `${current} used` : `${current}/${limit}`}
          </span>
        </div>

        {!unlimited && (
          <div style={{
            width: '100%',
            height: '0.375rem',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: colors.bar,
              transition: 'width 0.3s ease'
            }} />
          </div>
        )}

        <div style={{
          fontSize: '0.7rem',
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {status === 'exceeded' && <span>🚫</span>}
          {status === 'warning' && <span>⚠️</span>}
          {status === 'unlimited' && <span>✨</span>}
          {getStatusMessage()}
        </div>

        {shouldShowUpgrade && (
          <button
            onClick={handleUpgrade}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
          >
            Upgrade
          </button>
        )}
      </div>
    );
  }

  // FULL MODE (for dashboard cards, settings pages, etc.)
  return (
    <div
      className={className}
      style={{
        padding: '1rem',
        backgroundColor: 'white',
        border: `2px solid ${colors.bar}`,
        borderRadius: '0.5rem'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {getFeatureLabel()}
          </h4>
          <p style={{
            fontSize: '0.75rem',
            color: colors.text,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {status === 'exceeded' && <span>🚫</span>}
            {status === 'warning' && <span>⚠️</span>}
            {status === 'unlimited' && <span>✨</span>}
            {getStatusMessage()}
          </p>
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: colors.text
        }}>
          {unlimited ? '∞' : `${current}/${limit}`}
        </div>
      </div>

      {!unlimited && (
        <div style={{
          width: '100%',
          height: '0.5rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: colors.bar,
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}

      {status === 'exceeded' && isFree && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          borderRadius: '0.375rem',
          marginBottom: '0.75rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#991b1b',
            margin: 0,
            lineHeight: '1.4'
          }}>
            You've reached your {getFeatureLabel().toLowerCase()} limit for the Free tier.
            {feature === 'ai_chat' && ' Upgrade to continue getting AI assistance.'}
            {feature === 'projects' && ' Upgrade to create more projects.'}
          </p>
        </div>
      )}

      {status === 'warning' && isFree && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fffbeb',
          borderRadius: '0.375rem',
          marginBottom: '0.75rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#92400e',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Running low on {getFeatureLabel().toLowerCase()}. Upgrade for {feature === 'ai_chat' ? '500/month' : 'unlimited'} →
          </p>
        </div>
      )}

      {shouldShowUpgrade && (
        <button
          onClick={handleUpgrade}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
          }}
        >
          ⬆️ Upgrade to Pro
        </button>
      )}
    </div>
  );
}
