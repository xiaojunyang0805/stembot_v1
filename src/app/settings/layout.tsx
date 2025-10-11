'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userTier, setUserTier] = useState<string>('free');

  const userName = user?.email?.split('@')[0] || 'Research User';

  // Fetch user tier
  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const billingResponse = await fetch('/api/billing/status', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (billingResponse.ok) {
            const result = await billingResponse.json();
            setUserTier(result.data.subscription.tier);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch user tier:', error);
      }
    };

    if (user) {
      fetchUserTier();
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', path: '/settings/profile' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/settings/notifications' },
    { id: 'storage', label: 'Storage & Usage', icon: '💾', path: '/settings/storage' },
    { id: 'research-preferences', label: 'Research Preferences', icon: '🔬', path: '/settings/research-preferences' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒', path: '/settings/privacy' },
    { id: 'billing', label: 'Billing & Plans', icon: '💳', path: '/settings/billing' }
  ];

  const isActive = (path: string) => {
    if (path === '/settings/profile' && pathname === '/settings') return true;
    return pathname === path;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2563eb'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#6b7280'; }}
            >
              ← Back to Dashboard
            </button>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb'
            }}>
              🧠 StemBot
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              borderLeft: '1px solid #d1d5db',
              paddingLeft: '1rem'
            }}>
              ⚙️ Settings
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem'
          }}>
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: '0.875rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '2rem'
        }}>
          {/* Sidebar Navigation */}
          <nav style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            padding: '1rem',
            height: 'fit-content'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Settings
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: isActive(tab.path) ? '#eff6ff' : 'transparent',
                  border: isActive(tab.path) ? '1px solid #bae6fd' : '1px solid transparent',
                  borderRadius: '0.375rem',
                  color: isActive(tab.path) ? '#1e40af' : '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: isActive(tab.path) ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(tab.path)) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(tab.path)) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                  {tab.label}
                </div>

                {/* Tier Badge for Billing & Plans */}
                {tab.id === 'billing' && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: '700',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: userTier === 'free' ? '#fef3c7' : userTier === 'student_pro' ? '#dbeafe' : '#dcfce7',
                    color: userTier === 'free' ? '#92400e' : userTier === 'student_pro' ? '#1e40af' : '#166534'
                  }}>
                    {userTier === 'free' ? 'Free' : userTier === 'student_pro' ? 'Pro' : 'Researcher'}
                  </span>
                )}

                {/* Upgrade Badge for Free Users */}
                {tab.id === 'billing' && userTier === 'free' && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: '700',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    animation: 'pulse 2s ease-in-out infinite',
                    marginLeft: '0.25rem'
                  }}>
                    ⬆️
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            minHeight: '500px'
          }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
