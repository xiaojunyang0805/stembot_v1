/**
 * Research Settings Page - Clean Inline Styles Version
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Shield,
  Brain,
  Bell,
  Palette,
  Download,
  Save,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'

interface UserSettings {
  profile: {
    name: string
    email: string
    institution: string
    field: string
  }
  preferences: {
    theme: string
    language: string
    aiMentorStyle: string
  }
  notifications: {
    email: boolean
    deadlines: boolean
    milestones: boolean
    weeklyDigest: boolean
  }
  privacy: {
    shareProjects: boolean
    showProfile: boolean
    analytics: boolean
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@university.edu',
      institution: 'Stanford University',
      field: 'Computer Science'
    },
    preferences: {
      theme: 'system',
      language: 'en',
      aiMentorStyle: 'collaborative'
    },
    notifications: {
      email: true,
      deadlines: true,
      milestones: true,
      weeklyDigest: false
    },
    privacy: {
      shareProjects: false,
      showProfile: true,
      analytics: true
    }
  })

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile & Institution',
      description: 'Manage your academic profile',
      icon: User,
      color: '#dbeafe',
      iconColor: '#2563eb'
    },
    {
      id: 'preferences',
      title: 'AI Mentoring',
      description: 'Customize AI research mentor',
      icon: Brain,
      color: '#e0e7ff',
      iconColor: '#4f46e5'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure alerts and updates',
      icon: Bell,
      color: '#fed7aa',
      iconColor: '#ea580c'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control data sharing settings',
      icon: Shield,
      color: '#dcfce7',
      iconColor: '#16a34a'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme and language settings',
      icon: Palette,
      color: '#f3e8ff',
      iconColor: '#9333ea'
    },
    {
      id: 'export',
      title: 'Data & Export',
      description: 'Backup and export options',
      icon: Download,
      color: '#fef3c7',
      iconColor: '#d97706'
    }
  ]

  const handleBack = () => {
    router.push('/dashboard')
  }

  const updateSetting = (section: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderProfileSection = () => (
    <div>
      <div style={{marginBottom: '24px'}}>
        <h3 style={{fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px'}}>
          Academic Profile
        </h3>
        <p style={{color: '#6b7280', fontSize: '14px'}}>
          Update your professional information and institutional affiliation
        </p>
      </div>

      <div style={{display: 'grid', gap: '20px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => updateSetting('profile', 'name', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateSetting('profile', 'email', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Institution
            </label>
            <input
              type="text"
              value={settings.profile.institution}
              onChange={(e) => updateSetting('profile', 'institution', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Research Field
            </label>
            <select
              value={settings.profile.field}
              onChange={(e) => updateSetting('profile', 'field', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="computer-science">Computer Science</option>
              <option value="biology">Biology</option>
              <option value="chemistry">Chemistry</option>
              <option value="physics">Physics</option>
              <option value="mathematics">Mathematics</option>
              <option value="psychology">Psychology</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPreferencesSection = () => (
    <div>
      <div style={{marginBottom: '24px'}}>
        <h3 style={{fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px'}}>
          AI Mentoring Preferences
        </h3>
        <p style={{color: '#6b7280', fontSize: '14px'}}>
          Customize how your AI research mentor interacts with you
        </p>
      </div>

      <div style={{display: 'grid', gap: '20px'}}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Mentoring Style
          </label>
          <select
            value={settings.preferences.aiMentorStyle}
            onChange={(e) => updateSetting('preferences', 'aiMentorStyle', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="collaborative">Collaborative - Work together through problems</option>
            <option value="directive">Directive - Provide clear guidance and suggestions</option>
            <option value="socratic">Socratic - Ask questions to guide your thinking</option>
            <option value="supportive">Supportive - Encourage and validate your approach</option>
          </select>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Theme
            </label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Language
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div>
      <div style={{marginBottom: '24px'}}>
        <h3 style={{fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px'}}>
          Notification Preferences
        </h3>
        <p style={{color: '#6b7280', fontSize: '14px'}}>
          Choose which updates and alerts you'd like to receive
        </p>
      </div>

      <div style={{display: 'grid', gap: '16px'}}>
        {Object.entries({
          email: 'Email notifications for important updates',
          deadlines: 'Deadline reminders and milestone alerts',
          milestones: 'Project milestone completion notifications',
          weeklyDigest: 'Weekly research progress summary'
        }).map(([key, label]) => (
          <div key={key} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0'}}>
            <div>
              <div style={{fontSize: '14px', fontWeight: '500', color: '#111827'}}>
                {label}
              </div>
            </div>
            <label style={{position: 'relative', display: 'inline-block', width: '44px', height: '24px'}}>
              <input
                type="checkbox"
                checked={settings.notifications[key as keyof typeof settings.notifications]}
                onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                style={{opacity: 0, width: 0, height: 0}}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.notifications[key as keyof typeof settings.notifications] ? '#2563eb' : '#d1d5db',
                borderRadius: '24px',
                transition: 'all 0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.notifications[key as keyof typeof settings.notifications] ? '23px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}></span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPrivacySection = () => (
    <div>
      <div style={{marginBottom: '24px'}}>
        <h3 style={{fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px'}}>
          Privacy & Security
        </h3>
        <p style={{color: '#6b7280', fontSize: '14px'}}>
          Control your data sharing and privacy settings
        </p>
      </div>

      <div style={{display: 'grid', gap: '16px'}}>
        {Object.entries({
          shareProjects: 'Allow others to view my public research projects',
          showProfile: 'Show my profile in the research community',
          analytics: 'Help improve the platform with anonymous usage data'
        }).map(([key, label]) => (
          <div key={key} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0'}}>
            <div>
              <div style={{fontSize: '14px', fontWeight: '500', color: '#111827'}}>
                {label}
              </div>
            </div>
            <label style={{position: 'relative', display: 'inline-block', width: '44px', height: '24px'}}>
              <input
                type="checkbox"
                checked={settings.privacy[key as keyof typeof settings.privacy]}
                onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                style={{opacity: 0, width: 0, height: 0}}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.privacy[key as keyof typeof settings.privacy] ? '#16a34a' : '#d1d5db',
                borderRadius: '24px',
                transition: 'all 0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.privacy[key as keyof typeof settings.privacy] ? '23px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}></span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection()
      case 'preferences': return renderPreferencesSection()
      case 'notifications': return renderNotificationsSection()
      case 'privacy': return renderPrivacySection()
      default: return (
        <div style={{textAlign: 'center', padding: '48px'}}>
          <h3 style={{fontSize: '18px', color: '#6b7280', marginBottom: '8px'}}>
            {activeSection === 'appearance' ? 'Appearance Settings' :
             activeSection === 'export' ? 'Data Export' : 'Settings Section'}
          </h3>
          <p style={{color: '#9ca3af', fontSize: '14px'}}>
            This section is coming soon!
          </p>
        </div>
      )
    }
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>

        {/* Header */}
        <div style={{marginBottom: '32px'}}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            <ArrowLeft style={{width: '16px', height: '16px'}} />
            Back to Dashboard
          </button>

          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                Settings
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: '0'
              }}>
                Manage your account, preferences, and privacy settings
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#e5e7eb' : saved ? '#16a34a' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid #ffffff40',
                    borderTopColor: '#ffffff',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle style={{width: '16px', height: '16px'}} />
                  Saved!
                </>
              ) : (
                <>
                  <Save style={{width: '16px', height: '16px'}} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px'}}>
          {/* Sidebar */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {settingsSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: activeSection === section.id ? '#f8fafc' : '#ffffff',
                    border: 'none',
                    borderBottom: index < settingsSections.length - 1 ? '1px solid #e2e8f0' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    backgroundColor: section.color,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <section.icon style={{width: '16px', height: '16px', color: section.iconColor}} />
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '14px', fontWeight: '500', color: '#111827'}}>
                      {section.title}
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', marginTop: '2px'}}>
                      {section.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px'
          }}>
            {renderSection()}
          </div>
        </div>

      </div>
    </div>
  )
}