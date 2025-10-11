/**
 * LimitReached Component
 *
 * Displayed when a user hits their tier limit for a specific feature
 * Blocks the action and provides clear upgrade path
 *
 * Usage: <LimitReached feature="ai_chat" resetDate={new Date('2025-02-01')} />
 */

'use client';

import { useMemo } from 'react';

export type LimitFeature = 'ai_chat' | 'projects' | 'storage' | 'sources';

export interface LimitReachedProps {
  feature: LimitFeature;
  resetDate?: Date; // When the limit resets (for monthly limits)
  onUpgradeClick?: () => void;
  className?: string;
}

export default function LimitReached({
  feature,
  resetDate,
  onUpgradeClick,
  className = ''
}: LimitReachedProps) {
  const featureInfo = useMemo(() => {
    switch (feature) {
      case 'ai_chat':
        return {
          title: 'AI Interaction Limit Reached',
          icon: '🤖',
          description: 'You\'ve used all 50 AI interactions this month on the Free tier.',
          benefits: [
            '500 AI interactions per month',
            'Priority response times',
            'Advanced AI capabilities',
            'Unlimited conversation history'
          ],
          proLimit: '500/month'
        };
      case 'projects':
        return {
          title: 'Project Limit Reached',
          icon: '📁',
          description: 'Free tier allows 1 active project. Upgrade to create more.',
          benefits: [
            'Unlimited active projects',
            'Advanced project templates',
            'Team collaboration features',
            'Priority support'
          ],
          proLimit: 'Unlimited'
        };
      case 'storage':
        return {
          title: 'Storage Limit Reached',
          icon: '💾',
          description: 'You\'ve reached the 500MB storage limit on the Free tier.',
          benefits: [
            '10GB storage space',
            'Priority file processing',
            'Advanced file formats',
            'Automatic backups'
          ],
          proLimit: '10GB'
        };
      case 'sources':
        return {
          title: 'Source Limit Reached',
          icon: '📚',
          description: 'Free tier supports up to 3 sources for analysis.',
          benefits: [
            'Unlimited sources',
            'Advanced gap analysis',
            'Citation management',
            'Automated literature mapping'
          ],
          proLimit: 'Unlimited'
        };
      default:
        return {
          title: 'Limit Reached',
          icon: '⚠️',
          description: 'You\'ve reached your tier limit.',
          benefits: ['Upgrade to continue'],
          proLimit: 'More'
        };
    }
  }, [feature]);

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      window.location.href = '/settings?tab=billing';
    }
  };

  const formatResetDate = () => {
    if (!resetDate) return null;
    return resetDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        border: '2px solid #e5e7eb',
        textAlign: 'center'
      }}
    >
      {/* Icon */}
      <div style={{
        fontSize: '4rem',
        marginBottom: '1.5rem',
        filter: 'grayscale(100%)',
        opacity: 0.5
      }}>
        {featureInfo.icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '0.75rem'
      }}>
        {featureInfo.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '1rem',
        color: '#6b7280',
        lineHeight: '1.6',
        marginBottom: '1.5rem',
        maxWidth: '500px'
      }}>
        {featureInfo.description}
      </p>

      {/* Reset Date */}
      {resetDate && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          📅 Limit resets on <strong>{formatResetDate()}</strong>
        </div>
      )}

      {/* Upgrade Benefits */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        padding: '1.5rem',
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
        textAlign: 'left'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🚀</span>
          <h4 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1e40af',
            margin: 0
          }}>
            Upgrade to Student Pro
          </h4>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          {featureInfo.benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem',
                color: '#1e40af'
              }}
            >
              <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
              <span style={{ fontWeight: '500' }}>{benefit}</span>
            </div>
          ))}
        </div>

        <div style={{
          padding: '0.75rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#1e40af',
          textAlign: 'center'
        }}>
          <strong>Only €7.99/month</strong> · Cancel anytime
        </div>
      </div>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <button
          onClick={handleUpgrade}
          style={{
            flex: 1,
            padding: '1rem 2rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.target as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <span>⬆️</span>
          <span>Upgrade to Pro</span>
        </button>

        {resetDate && (
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'white';
            }}
          >
            Go Back
          </button>
        )}
      </div>

      {/* Fine Print */}
      <p style={{
        fontSize: '0.75rem',
        color: '#9ca3af',
        marginTop: '1.5rem',
        maxWidth: '500px'
      }}>
        By upgrading, you'll get instant access to all Pro features.
        No long-term commitment required.
      </p>
    </div>
  );
}
