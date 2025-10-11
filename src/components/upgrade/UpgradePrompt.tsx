/**
 * UpgradePrompt Component
 *
 * Reusable component for displaying upgrade prompts throughout the application
 * Supports multiple variants: banner, modal, card, inline
 *
 * Features:
 * - Non-intrusive dismissible prompts
 * - localStorage tracking to prevent repeated displays
 * - Analytics tracking for conversion optimization
 * - Clear value propositions with CTA buttons
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export type UpgradePromptVariant = 'banner' | 'modal' | 'card' | 'inline';
export type UpgradePromptLocation =
  | 'dashboard_resume'
  | 'workspace_memory'
  | 'project_creation'
  | 'chat_interface'
  | 'literature_review'
  | 'literature_review_gap_analysis'
  | 'settings_nav'
  | 'post_milestone';

export interface UpgradePromptProps {
  variant: UpgradePromptVariant;
  location: UpgradePromptLocation;
  title?: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  onCTAClick?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  showOnce?: boolean; // Show max 1x per session
  features?: string[]; // Feature list for card/modal variants
  className?: string;
}

export default function UpgradePrompt({
  variant,
  location,
  title = '⬆️ Upgrade to Pro',
  message,
  ctaText = 'View Plans',
  ctaLink = '/settings?tab=billing',
  onCTAClick,
  onDismiss,
  dismissible = true,
  showOnce = true,
  features,
  className = ''
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const storageKey = `upgrade_prompt_dismissed_${location}`;
  const sessionKey = `upgrade_prompt_shown_${location}`;

  useEffect(() => {
    // Check if prompt should be shown
    const checkVisibility = () => {
      if (typeof window === 'undefined') return false;

      // Check if permanently dismissed (localStorage)
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') return false;

      // Check if already shown this session (sessionStorage)
      if (showOnce) {
        const shownThisSession = sessionStorage.getItem(sessionKey);
        if (shownThisSession === 'true') return false;
      }

      return true;
    };

    setIsVisible(checkVisibility());

    // Mark as shown in session
    if (showOnce && typeof window !== 'undefined') {
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [location, showOnce, storageKey, sessionKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);

    // Track dismiss event
    trackUpgradePromptEvent('dismissed', location, variant);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }

    onDismiss?.();
  };

  const handleCTAClick = () => {
    // Track click event
    trackUpgradePromptEvent('clicked', location, variant);

    if (onCTAClick) {
      onCTAClick();
    } else if (ctaLink) {
      window.location.href = ctaLink;
    }
  };

  if (!isVisible || isDismissed) return null;

  // BANNER VARIANT
  if (variant === 'banner') {
    return (
      <div
        className={className}
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <span style={{ fontSize: '1.25rem' }}>⚡</span>
          <p style={{
            fontSize: '0.875rem',
            color: '#1e40af',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCTAClick}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
          >
            {ctaText}
          </button>
          {dismissible && (
            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#6b7280';
              }}
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // CARD VARIANT
  if (variant === 'card') {
    return (
      <div
        className={className}
        style={{
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          position: 'relative' as const,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        {dismissible && (
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute' as const,
              top: '0.75rem',
              right: '0.75rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.color = '#6b7280';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.color = '#9ca3af';
            }}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🚀</span> {title}
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: '1.5',
            margin: 0
          }}>
            {message}
          </p>
        </div>

        {features && features.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}
                >
                  <span style={{ color: '#22c55e', fontSize: '1rem' }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleCTAClick}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
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
          {ctaText}
        </button>
      </div>
    );
  }

  // INLINE VARIANT
  if (variant === 'inline') {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #fde047',
          borderRadius: '0.375rem'
        }}
      >
        <span style={{ fontSize: '1rem' }}>💎</span>
        <p style={{
          fontSize: '0.875rem',
          color: '#92400e',
          margin: 0,
          flex: 1
        }}>
          {message}
        </p>
        <button
          onClick={handleCTAClick}
          style={{
            backgroundColor: 'transparent',
            color: '#2563eb',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.25rem',
            border: '1px solid #2563eb',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          {ctaText}
        </button>
        {dismissible && (
          <button
            onClick={handleDismiss}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#92400e',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  // MODAL VARIANT
  if (variant === 'modal') {
    return (
      <div
        style={{
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}
        onClick={dismissible ? handleDismiss : undefined}
      >
        <div
          className={className}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            position: 'relative' as const,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {dismissible && (
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute' as const,
                top: '1rem',
                right: '1rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#6b7280';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#9ca3af';
              }}
              aria-label="Close"
            >
              <X size={24} />
            </button>
          )}

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.75rem'
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: '1.6',
              margin: 0
            }}>
              {message}
            </p>
          </div>

          {features && features.length > 0 && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}
                  >
                    <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleCTAClick}
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '1rem',
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
              {ctaText}
            </button>
            {dismissible && (
              <button
                onClick={handleDismiss}
                style={{
                  padding: '0.875rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
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
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Track upgrade prompt events for analytics
 */
function trackUpgradePromptEvent(
  action: 'clicked' | 'dismissed' | 'shown',
  location: UpgradePromptLocation,
  variant: UpgradePromptVariant
) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Upgrade Prompt Analytics] ${action}`, { location, variant });
  }

  // Track with analytics service (placeholder for future implementation)
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('upgrade_prompt_interaction', {
      action,
      location,
      variant,
      timestamp: new Date().toISOString()
    });
  }

  // Store in localStorage for internal tracking
  try {
    const eventsKey = 'upgrade_prompt_events';
    const events = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    events.push({
      action,
      location,
      variant,
      timestamp: new Date().toISOString()
    });
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    localStorage.setItem(eventsKey, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to track upgrade prompt event:', error);
  }
}
