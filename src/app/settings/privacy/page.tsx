'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getUserPreferences, updatePrivacySettings, getDefaultPreferences, type PrivacySettings } from '../../../lib/database/userPreferences';
import ToggleSwitch from '../../../components/settings/ToggleSwitch';
import ConfirmationModal from '../../../components/settings/ConfirmationModal';
import { createClientComponentClient } from '../../../lib/supabase';

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSessions, setActiveSessions] = useState<number>(1);

  const [settings, setSettings] = useState<PrivacySettings>({
    analytics: true,
    research_sharing: false,
    chat_history: true,
    chat_history_days: 30
  });

  // Load privacy settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const { data: preferences, error } = await getUserPreferences();

        if (error) {
          console.warn('Error loading preferences:', error);
        } else if (preferences) {
          setSettings(preferences.privacy_settings);
        } else {
          // Use defaults
          const defaults = getDefaultPreferences(user.id);
          setSettings(defaults.privacy_settings);
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const { error } = await updatePrivacySettings(settings);

      if (error) {
        setSaveError('Failed to save privacy settings. Please try again.');
        console.error('Error saving settings:', error);
      } else {
        setSaveMessage('Privacy settings saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveError('An unexpected error occurred. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const supabase = createClientComponentClient();

      // Fetch all user data (GDPR compliance)
      const [projects, documents, conversations, profile, preferences] = await Promise.all([
        supabase.from('research_projects').select('*').eq('user_id', user.id),
        supabase.from('project_documents').select('*'),
        supabase.from('conversations').select('*').eq('user_id', user.id),
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single()
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile: profile.data,
        preferences: preferences.data,
        projects: projects.data,
        documents: documents.data,
        conversations: conversations.data
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stembot-personal-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveMessage('Personal data exported successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveError('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const supabase = createClientComponentClient();

      // Delete all user data
      await Promise.all([
        supabase.from('research_projects').delete().eq('user_id', user.id),
        supabase.from('conversations').delete().eq('user_id', user.id),
        supabase.from('user_preferences').delete().eq('user_id', user.id),
        supabase.from('users').delete().eq('id', user.id)
      ]);

      // Sign out
      await supabase.auth.signOut();
      router.push('/?deleted=true');
    } catch (error) {
      console.error('Error deleting account:', error);
      setSaveError('Failed to delete account. Please contact support.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!user) return;

    setIsLoggingOut(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const supabase = createClientComponentClient();

      // Sign out from all sessions
      await supabase.auth.signOut({ scope: 'global' });

      setSaveMessage('Logged out from all devices. Redirecting...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('Error logging out:', error);
      setSaveError('Failed to log out from all devices.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '0.5rem'
      }}>
        🔒 Privacy & Security
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Manage your privacy settings, security options, and data.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Data Privacy Settings */}
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🛡️ Data Privacy Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ToggleSwitch
              checked={settings.analytics}
              onChange={(checked) => setSettings(prev => ({ ...prev, analytics: checked }))}
              label="Anonymous Usage Analytics"
              description="Help us improve by sharing anonymous usage data"
            />
            <ToggleSwitch
              checked={settings.research_sharing}
              onChange={(checked) => setSettings(prev => ({ ...prev, research_sharing: checked }))}
              label="Share De-identified Data for Research"
              description="Allow your anonymized research patterns to help improve the platform"
            />
            <ToggleSwitch
              checked={settings.chat_history}
              onChange={(checked) => setSettings(prev => ({ ...prev, chat_history: checked }))}
              label="Keep Chat History"
              description={`Save conversation history (auto-delete after ${settings.chat_history_days} days if disabled)`}
            />

            {/* Chat History Days Slider */}
            {settings.chat_history && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                marginLeft: '2rem'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.75rem'
                }}>
                  Chat History Retention: {settings.chat_history_days} days
                </label>
                <input
                  type="range"
                  min="7"
                  max="365"
                  step="1"
                  value={settings.chat_history_days}
                  onChange={(e) => setSettings(prev => ({ ...prev, chat_history_days: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    height: '0.5rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  <span>7 days</span>
                  <span>1 year</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />

        {/* Security Settings */}
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔐 Security
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Change Password */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.25rem'
                }}>
                  Password
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  Last changed: Never
                </div>
              </div>
              <button
                onClick={() => {
                  const supabase = createClientComponentClient();
                  supabase.auth.resetPasswordForEmail(user?.email || '', {
                    redirectTo: `${window.location.origin}/auth/reset-password`
                  });
                  setSaveMessage('Password reset link sent to your email!');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'white';
                }}
              >
                Change Password
              </button>
            </div>

            {/* Active Sessions */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    Active Sessions
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    You are currently signed in on {activeSessions} device{activeSessions !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogoutAllDevices}
                disabled={isLoggingOut}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: isLoggingOut ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isLoggingOut ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isLoggingOut) {
                    (e.target as HTMLElement).style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoggingOut) {
                    (e.target as HTMLElement).style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {isLoggingOut ? 'Logging Out...' : 'Log Out All Devices'}
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />

        {/* Data Export & Deletion */}
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📦 Data Export & Deletion
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Download Data */}
            <button
              onClick={handleExportData}
              disabled={isExporting}
              style={{
                padding: '1rem',
                backgroundColor: isExporting ? '#f3f4f6' : 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                textAlign: 'left',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                }
              }}
            >
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.25rem'
                }}>
                  📥 Download My Data (GDPR)
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  Export all your personal data in JSON format
                </div>
              </div>
              {isExporting && (
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </button>

            {/* Delete Account */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '0.5rem'
              }}>
                ⚠️ Delete My Account
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#991b1b',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                Permanently delete your account and all associated data including projects, documents, and conversations.
                <strong> This action cannot be undone.</strong>
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
                }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#1e40af',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <span>🔒</span>
            <div>
              <strong>Your Privacy Matters:</strong> We take your privacy seriously. Your data is encrypted,
              and we never share personally identifiable information with third parties. For more details,
              see our Privacy Policy.
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(saveMessage || saveError) && (
          <div style={{
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

        {/* Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
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
              <>💾 Save Privacy Settings</>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Account Permanently"
        message="Are you absolutely sure? This will permanently delete your account, all projects, documents, conversations, and settings. This action is irreversible and cannot be undone."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
