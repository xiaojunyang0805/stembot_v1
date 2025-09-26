/**
 * User Profile Page
 * User profile management with mock information
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    university: 'Stanford University',
    major: 'Computer Science',
    year: 'Graduate Student',
    researchInterests: 'Machine Learning, AI Ethics, Educational Technology',
    bio: 'I am a graduate student passionate about using AI to improve educational outcomes while maintaining ethical standards.',
    joinDate: 'September 2024'
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
    console.log('Profile saved:', profile)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6b7280',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              ← Back
            </button>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              Profile
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Profile Picture & Basic Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: '600'
            }}>
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                {profile.name}
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                margin: '0 0 4px 0'
              }}>
                {profile.year} • {profile.major}
              </p>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0
              }}>
                Joined {profile.joinDate}
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              ) : (
                <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                  {profile.email}
                </p>
              )}
            </div>

            {/* University */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                University
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              ) : (
                <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                  {profile.university}
                </p>
              )}
            </div>

            {/* Research Interests */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Research Interests
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.researchInterests}
                  onChange={(e) => handleInputChange('researchInterests', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              ) : (
                <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                  {profile.researchInterests}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <p style={{ color: '#111827', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px'
          }}>
            Research Activity
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#3b82f6',
                marginBottom: '4px'
              }}>
                3
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Active Projects
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '4px'
              }}>
                47
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Sources Reviewed
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#f59e0b',
                marginBottom: '4px'
              }}>
              154
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Hours Logged
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}