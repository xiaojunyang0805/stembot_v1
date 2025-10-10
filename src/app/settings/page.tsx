'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { getUserProfile, updateUserProfile } from '../../lib/database/users';
import StorageIndicator from '../../components/storage/StorageIndicator';
import BillingPage from './billing/page';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    institution: '',
    researchAreas: ''
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    research: true,
    collaboration: false,
    updates: true
  });

  const userName = user?.email?.split('@')[0] || 'Research User';
  const userEmail = user?.email || 'user@example.com';
  const userId = user?.id || 'guest';

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        const { data: userProfile, error } = await getUserProfile();

        if (error) {
          console.warn('Error loading user profile:', error);
          // Set default values from auth user
          setProfileData({
            displayName: userName,
            email: userEmail,
            institution: '',
            researchAreas: ''
          });
        } else if (userProfile) {
          // Populate form with existing profile data
          const profileData = userProfile.profile_data as any;
          setProfileData({
            displayName: profileData?.name || userName,
            email: userProfile.email,
            institution: userProfile.university || '',
            researchAreas: userProfile.research_interests?.join(', ') || ''
          });

          // Update notifications from user settings
          if (userProfile.settings) {
            const settings = userProfile.settings as any;
            setNotifications({
              email: settings.email_updates ?? true,
              research: settings.notifications ?? true,
              collaboration: settings.collaboration_notifications ?? false,
              updates: settings.product_updates ?? true
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [user, userName, userEmail]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      // Prepare update data
      const updateData = {
        university: profileData.institution.trim() || null,
        research_interests: profileData.researchAreas
          .split(',')
          .map(area => area.trim())
          .filter(area => area.length > 0),
        profile_data: {
          name: profileData.displayName.trim() || userName,
          avatar_url: user.user_metadata?.avatar_url
        },
        settings: {
          notifications: notifications.research,
          email_updates: notifications.email,
          collaboration_notifications: notifications.collaboration,
          product_updates: notifications.updates,
          theme: 'light'
        }
      };

      const { error } = await updateUserProfile(updateData);

      if (error) {
        setSaveError('Failed to save settings. Please try again.');
        console.error('Error saving settings:', error);
      } else {
        setSaveMessage('Settings saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveError('An unexpected error occurred. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
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
              { id: 'storage', label: 'Storage & Usage', icon: '💾' },
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
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
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
                      value={profileData.email}
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
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      Email cannot be changed here. Contact support if needed.
                    </div>
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
                      value={profileData.institution}
                      onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
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
                      value={profileData.researchAreas}
                      onChange={(e) => setProfileData(prev => ({ ...prev, researchAreas: e.target.value }))}
                      placeholder="Your primary research interests and areas of expertise (separate with commas)"
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

            {/* Storage & Usage Tab */}
            {activeTab === 'storage' && (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  💾 Storage & Usage
                </h2>

                <StorageIndicator showDetails={true} />
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <BillingPage />
            )}

            {/* Other Tabs Placeholder */}
            {['research', 'privacy'].includes(activeTab) && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {activeTab === 'research' ? '🔬' : '🔒'}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  {activeTab === 'research' ? 'Research Preferences' : 'Privacy & Security'}
                </div>
                <div style={{ fontSize: '1rem' }}>
                  Advanced {activeTab} settings are being developed.
                  These features will be available in the next update.
                </div>
              </div>
            )}

            {/* Save Button */}
            {['profile', 'notifications', 'storage'].includes(activeTab) && (
              <div style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                {/* Success/Error Messages */}
                {(saveMessage || saveError) && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: saveMessage ? '#d1fae5' : '#fee2e2',
                    color: saveMessage ? '#065f46' : '#991b1b',
                    border: `1px solid ${saveMessage ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {saveMessage ? '✅ ' + saveMessage : '❌ ' + saveError}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{
                          width: '1rem',
                          height: '1rem',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Saving...
                      </>
                    ) : (
                      <>💾 Save Changes</>
                    )}
                  </button>
                </div>

                {/* CSS for spinner animation */}
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}