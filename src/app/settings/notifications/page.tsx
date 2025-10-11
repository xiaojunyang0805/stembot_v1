'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { getUserPreferences, updateNotificationSettings, getDefaultPreferences, type NotificationSettings } from '../../../lib/database/userPreferences';
import ToggleSwitch from '../../../components/settings/ToggleSwitch';

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function NotificationsSettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      project_deadlines: {
        '7_days': true,
        '3_days': true,
        '1_day': true
      },
      weekly_summary: true,
      announcements: true,
      tips: true
    },
    in_app: {
      ai_suggestions: true,
      milestones: true,
      health_checks: true
    }
  });

  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const { data: preferences, error } = await getUserPreferences();

        if (error) {
          console.warn('Error loading preferences:', error);
        } else if (preferences) {
          setSettings(preferences.notification_settings);
        } else {
          // Use default settings
          const defaults = getDefaultPreferences(user.id);
          setSettings(defaults.notification_settings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
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
      const { error } = await updateNotificationSettings(settings);

      if (error) {
        setSaveError('Failed to save notification settings. Please try again.');
        console.error('Error saving settings:', error);
      } else {
        setSaveMessage('Notification preferences saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveError('An unexpected error occurred. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmailSetting = (key: string, value: boolean) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          [parent]: {
            ...(prev.email[parent as keyof typeof prev.email] as any),
            [child]: value
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          [key]: value
        }
      }));
    }
  };

  const updateInAppSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      in_app: {
        ...prev.in_app,
        [key]: value
      }
    }));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '0.5rem'
      }}>
        🔔 Notification Preferences
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Manage how and when you receive notifications about your research projects.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Email Notifications Section */}
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
            📧 Email Notifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Project Deadline Reminders */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.75rem'
              }}>
                Project Deadline Reminders
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingLeft: '1rem'
              }}>
                <ToggleSwitch
                  checked={settings.email.project_deadlines['7_days']}
                  onChange={(checked) => updateEmailSetting('project_deadlines.7_days', checked)}
                  label="7 days before"
                  description="Receive reminder one week before deadline"
                />
                <ToggleSwitch
                  checked={settings.email.project_deadlines['3_days']}
                  onChange={(checked) => updateEmailSetting('project_deadlines.3_days', checked)}
                  label="3 days before"
                  description="Receive reminder three days before deadline"
                />
                <ToggleSwitch
                  checked={settings.email.project_deadlines['1_day']}
                  onChange={(checked) => updateEmailSetting('project_deadlines.1_day', checked)}
                  label="1 day before"
                  description="Receive reminder one day before deadline"
                />
              </div>
            </div>

            {/* Other Email Notifications */}
            <ToggleSwitch
              checked={settings.email.weekly_summary}
              onChange={(checked) => updateEmailSetting('weekly_summary', checked)}
              label="Weekly Progress Summary"
              description="Receive a weekly email summarizing your research progress"
            />
            <ToggleSwitch
              checked={settings.email.announcements}
              onChange={(checked) => updateEmailSetting('announcements', checked)}
              label="New Feature Announcements"
              description="Stay updated on new features and improvements"
            />
            <ToggleSwitch
              checked={settings.email.tips}
              onChange={(checked) => updateEmailSetting('tips', checked)}
              label="Tips and Research Guidance"
              description="Receive helpful tips for conducting better research"
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#e5e7eb'
        }} />

        {/* In-App Notifications Section */}
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
            🔔 In-App Notification Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ToggleSwitch
              checked={settings.in_app.ai_suggestions}
              onChange={(checked) => updateInAppSetting('ai_suggestions', checked)}
              label="AI Suggestions and Prompts"
              description="Show proactive AI suggestions while you work"
            />
            <ToggleSwitch
              checked={settings.in_app.milestones}
              onChange={(checked) => updateInAppSetting('milestones', checked)}
              label="Milestone Completions"
              description="Get notified when you complete project milestones"
            />
            <ToggleSwitch
              checked={settings.in_app.health_checks}
              onChange={(checked) => updateInAppSetting('health_checks', checked)}
              label="Design Health Check Reminders"
              description="Periodic reminders to validate your research design"
            />
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
            <span>💡</span>
            <div>
              <strong>Tip:</strong> Enable email notifications to stay on track with your research deadlines.
              You can always adjust these settings later.
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
              <>💾 Save Preferences</>
            )}
          </button>
        </div>
      </div>

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
