'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    research: true,
    collaboration: false,
    updates: true
  });

  const userName = user?.email?.split('@')[0] || 'Research User';
  const userEmail = user?.email || 'user@example.com';
  const userId = user?.id || 'guest';

  const handleSave = () => {
    // Mock save functionality
    console.log('Settings saved');
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
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'research', label: 'Research Preferences', icon: '🔬' },
              { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
              { id: 'billing', label: 'Billing & Plans', icon: '💳' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                  border: activeTab === tab.id ? '1px solid #bae6fd' : '1px solid transparent',
                  borderRadius: '0.375rem',
                  color: activeTab === tab.id ? '#1e40af' : '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            padding: '2rem'
          }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  👤 Profile Information
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      User ID
                    </label>
                    <input
                      type="text"
                      value={userId.slice(0, 8) + '...'}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: '#f9fafb',
                        color: '#6b7280'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userName}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={userEmail}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Institution
                    </label>
                    <input
                      type="text"
                      placeholder="University or Research Institution"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Research Areas
                    </label>
                    <textarea
                      placeholder="Your primary research interests and areas of expertise"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  🔔 Notification Preferences
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { id: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                    { id: 'research', label: 'Research Updates', description: 'Notifications about your research progress' },
                    { id: 'collaboration', label: 'Collaboration Invites', description: 'Invitations to collaborate on projects' },
                    { id: 'updates', label: 'Product Updates', description: 'Information about new features and improvements' }
                  ].map((notification) => (
                    <div key={notification.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          marginBottom: '0.25rem'
                        }}>
                          {notification.label}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {notification.description}
                        </div>
                      </div>
                      <label style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '44px',
                        height: '24px'
                      }}>
                        <input
                          type="checkbox"
                          checked={notifications[notification.id as keyof typeof notifications]}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            [notification.id]: e.target.checked
                          }))}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: notifications[notification.id as keyof typeof notifications] ? '#2563eb' : '#d1d5db',
                          borderRadius: '24px',
                          transition: 'background-color 0.3s'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: notifications[notification.id as keyof typeof notifications] ? '23px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.3s'
                          }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Tabs Placeholder */}
            {['research', 'privacy', 'billing'].includes(activeTab) && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {activeTab === 'research' ? '🔬' : activeTab === 'privacy' ? '🔒' : '💳'}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  {activeTab === 'research' ? 'Research Preferences' :
                   activeTab === 'privacy' ? 'Privacy & Security' : 'Billing & Plans'}
                </div>
                <div style={{ fontSize: '1rem' }}>
                  Advanced {activeTab} settings are being developed.
                  These features will be available in the next update.
                </div>
              </div>
            )}

            {/* Save Button */}
            {['profile', 'notifications'].includes(activeTab) && (
              <div style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={handleSave}
                  style={{
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
                  💾 Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}