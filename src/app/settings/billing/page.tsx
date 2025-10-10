'use client';

/**
 * Billing & Plans Settings Page
 * WP6.6: Complete billing management interface
 *
 * Displays:
 * - Current subscription plan and status
 * - Usage statistics with visual indicators
 * - Available upgrade plans
 * - Payment history
 * - University licensing information
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface BillingData {
  subscription: {
    id: string;
    tier: string;
    status: string;
    displayName: string;
    priceEur: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };
  usage: {
    aiInteractions: {
      current: number;
      limit: number | null;
      percentage: number;
      color: string;
      unlimited: boolean;
    };
    activeProjects: {
      current: number;
      limit: number | null;
      percentage: number;
      color: string;
      unlimited: boolean;
    };
    period: {
      start: string;
      end: string;
    };
  };
  tierInfo: {
    features: string[];
    allTiers: Array<{
      id: string;
      displayName: string;
      priceEur: number;
      features: string[];
      current: boolean;
    }>;
  };
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    pdfUrl: string | null;
    hostedUrl: string | null;
    description: string;
  }>;
  warnings: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get auth token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch('/api/billing/status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch billing data');
        }

        const result = await response.json();
        setBillingData(result.data);
      } catch (err: any) {
        console.error('Error fetching billing data:', err);
        setError(err.message || 'Failed to load billing information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [user]);

  // Handle upgrade button click
  const handleUpgrade = async (tier: string) => {
    if (!user) return;

    try {
      setIsUpgrading(true);
      setUpgradeMessage(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          successUrl: `${window.location.origin}/settings?tab=billing&upgrade=success`,
          cancelUrl: `${window.location.origin}/settings?tab=billing&upgrade=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setUpgradeMessage(err.message || 'Failed to start upgrade process');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Handle manage subscription button click
  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      setIsUpgrading(true);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings?tab=billing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const result = await response.json();

      // Open customer portal in new tab
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err: any) {
      console.error('Error opening customer portal:', err);
      setUpgradeMessage(err.message || 'Failed to open customer portal');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    };

    switch (status) {
      case 'active':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'trialing':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'past_due':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'canceled':
        return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  // Get progress bar color
  const getProgressBarColor = (color: string) => {
    switch (color) {
      case 'green':
        return '#22c55e';
      case 'yellow':
        return '#eab308';
      case 'red':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <div>Loading billing information...</div>
        </div>
      </div>
    );
  }

  if (error || !billingData) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        color: '#991b1b'
      }}>
        <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Failed to Load Billing Information
        </div>
        <div>{error || 'Unknown error occurred'}</div>
      </div>
    );
  }

  const { subscription, usage, tierInfo, paymentHistory, warnings } = billingData;
  const isFree = subscription.tier === 'free';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          💳 Billing & Plans
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Manage your subscription, view usage, and upgrade your plan
        </p>
      </div>

      {/* Upgrade Messages */}
      {upgradeMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          color: '#991b1b',
          fontSize: '0.875rem'
        }}>
          {upgradeMessage}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {warnings.map((warning, index) => (
            <div
              key={index}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: warning.severity === 'error' ? '#fee2e2' : '#fef3c7',
                border: `1px solid ${warning.severity === 'error' ? '#fecaca' : '#fde68a'}`,
                borderRadius: '0.375rem',
                color: warning.severity === 'error' ? '#991b1b' : '#92400e',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{warning.severity === 'error' ? '⚠️' : '⚡'}</span>
              {warning.message}
            </div>
          ))}
        </div>
      )}

      {/* SECTION 1: Current Plan Card */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>📋</span> Current Plan
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                {subscription.displayName}
              </h4>
              <span style={getStatusBadgeStyle(subscription.status)}>
                {subscription.status}
              </span>
            </div>
            {!isFree && (
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Billed €{subscription.priceEur}/month
              </div>
            )}
            {subscription.currentPeriodEnd && !isFree && (
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {subscription.cancelAtPeriodEnd ? 'Expires on' : 'Renews on'}{' '}
                {formatDate(subscription.currentPeriodEnd)}
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Plan Features:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {tierInfo.features.map((feature, index) => (
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

        {/* Action Button */}
        {isFree ? (
          <button
            onClick={() => handleUpgrade('student_pro')}
            disabled={isUpgrading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: isUpgrading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isUpgrading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isUpgrading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpgrading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }
            }}
          >
            {isUpgrading ? 'Processing...' : '⬆️ Upgrade to Pro'}
          </button>
        ) : (
          <button
            onClick={handleManageSubscription}
            disabled={isUpgrading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isUpgrading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isUpgrading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpgrading) {
                (e.target as HTMLButtonElement).style.backgroundColor = 'white';
              }
            }}
          >
            {isUpgrading ? 'Opening...' : '⚙️ Manage Subscription'}
          </button>
        )}
      </div>

      {/* SECTION 2: Usage This Month */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>📊</span> Usage This Month
        </h3>

        {/* AI Interactions */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
              AI Interactions
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {usage.aiInteractions.unlimited
                ? `${usage.aiInteractions.current} used (Unlimited)`
                : `${usage.aiInteractions.current} / ${usage.aiInteractions.limit} used`}
            </span>
          </div>
          {!usage.aiInteractions.unlimited && (
            <div style={{
              width: '100%',
              height: '0.5rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(usage.aiInteractions.percentage, 100)}%`,
                height: '100%',
                backgroundColor: getProgressBarColor(usage.aiInteractions.color),
                transition: 'width 0.3s ease'
              }} />
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
              Active Projects
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {usage.activeProjects.unlimited
                ? `${usage.activeProjects.current} active (Unlimited)`
                : `${usage.activeProjects.current} / ${usage.activeProjects.limit} active`}
            </span>
          </div>
          {!usage.activeProjects.unlimited && (
            <div style={{
              width: '100%',
              height: '0.5rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(usage.activeProjects.percentage, 100)}%`,
                height: '100%',
                backgroundColor: getProgressBarColor(usage.activeProjects.color),
                transition: 'width 0.3s ease'
              }} />
            </div>
          )}
        </div>

        {/* Billing Period */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Billing period: {formatDate(usage.period.start)} - {formatDate(usage.period.end)}
        </div>
      </div>

      {/* SECTION 3: Available Plans (Show only on Free tier) */}
      {isFree && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🚀</span> Upgrade Your Plan
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {tierInfo.allTiers
              .filter((tier) => tier.id !== 'free')
              .map((tier) => (
                <div
                  key={tier.id}
                  style={{
                    border: tier.id === 'student_pro' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    backgroundColor: tier.id === 'student_pro' ? '#eff6ff' : 'white',
                    position: 'relative' as const
                  }}
                >
                  {tier.id === 'student_pro' && (
                    <div style={{
                      position: 'absolute' as const,
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      POPULAR
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      {tier.displayName}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                        €{tier.priceEur}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>/month</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    {tier.features.map((feature, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <span style={{ color: '#22c55e', fontSize: '1rem' }}>✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isUpgrading}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: isUpgrading ? '#9ca3af' : (tier.id === 'student_pro' ? '#2563eb' : 'white'),
                      color: tier.id === 'student_pro' ? 'white' : '#2563eb',
                      border: tier.id === 'student_pro' ? 'none' : '1px solid #2563eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: isUpgrading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpgrading) {
                        if (tier.id === 'student_pro') {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                        } else {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpgrading) {
                        if (tier.id === 'student_pro') {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                        } else {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                        }
                      }
                    }}
                  >
                    {isUpgrading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Payment History (Show only if has payment history) */}
      {paymentHistory.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🧾</span> Payment History
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                    Date
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                    Description
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                    Amount
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6b7280', fontWeight: '600' }}>
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.slice(0, 5).map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem', color: '#374151' }}>
                      {formatDate(payment.date)}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#374151' }}>
                      {payment.description}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#374151' }}>
                      €{payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: payment.status === 'paid' ? '#d1fae5' : '#fee2e2',
                        color: payment.status === 'paid' ? '#065f46' : '#991b1b'
                      }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {payment.pdfUrl && (
                        <a
                          href={payment.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '0.875rem'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.textDecoration = 'none';
                          }}
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isFree && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={handleManageSubscription}
                style={{
                  color: '#2563eb',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                View all invoices in Stripe portal →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: University Licensing */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🎓</span> University & Institutional Licensing
        </h3>

        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          padding: '1.25rem',
          marginBottom: '1rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#374151',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            Looking to provide StemBot to your entire department or institution?
            Our enterprise licenses offer:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              'Unlimited students and researchers',
              'Centralized admin dashboard',
              'Usage analytics and reporting',
              'Priority technical support',
              'Custom onboarding and training',
              'Single Sign-On (SSO) integration',
              'Custom branding options',
              'Dedicated account manager'
            ].map((benefit, index) => (
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
                <span style={{ color: '#2563eb', fontSize: '1rem' }}>✓</span>
                {benefit}
              </div>
            ))}
          </div>

          <div style={{
            padding: '0.75rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            color: '#1e40af',
            marginTop: '1rem'
          }}>
            <strong>Special Academic Pricing:</strong> Contact us for volume discounts
            and flexible payment options tailored to your institution's budget.
          </div>
        </div>

        <button
          onClick={() => window.open('mailto:sales@stembot.io?subject=University License Inquiry', '_blank')}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
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
          📧 Contact Sales Team
        </button>
      </div>
    </div>
  );
}
