/**
 * Dashboard Header Component
 * Navigation bar with logo, university selector, and user profile
 */

'use client'

import { useState } from 'react'

import { ChevronDown, Settings, LogOut, User, University as UniversityIcon } from 'lucide-react'

import { University, User as UserType } from '../../types/dashboard'

interface HeaderProps {
  user: UserType
  universities: University[]
  selectedUniversity?: University
  onUniversityChange?: (university: University) => void
  onProfileSettings?: () => void
  onLogout?: () => void
}

export default function Header({
  user,
  universities,
  selectedUniversity,
  onUniversityChange,
  onProfileSettings,
  onLogout
}: HeaderProps) {
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>

        {/* Logo and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>[StemBot]</span>
          <span style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#1f2937'
          }}>Research Mentor</span>
        </div>

        {/* Center - University Selector */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          {universities.length > 0 && (
            <button
              onClick={() => setShowUniversityDropdown(!showUniversityDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374051',
                cursor: 'pointer'
              }}
            >
              <UniversityIcon style={{ width: '16px', height: '16px' }} />
              <span>{selectedUniversity?.name || 'Select University'}</span>
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            </button>
          )}

          {/* University Dropdown */}
          {showUniversityDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              minWidth: '200px',
              zIndex: 50
            }}>
              {universities.map((university) => (
                <button
                  key={university.id}
                  onClick={() => {
                    onUniversityChange?.(university)
                    setShowUniversityDropdown(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#374051',
                    backgroundColor: selectedUniversity?.id === university.id ? '#f0f8ff' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: university === universities[0] ? '8px 8px 0 0' :
                              university === universities[universities.length - 1] ? '0 0 8px 8px' : '0'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUniversity?.id !== university.id) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f8fafc'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUniversity?.id !== university.id) {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {university.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right - User Profile */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              </div>
            )}
            <div style={{
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>{user.name}</div>
            </div>
            <ChevronDown style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              minWidth: '180px',
              zIndex: 50
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>{user.name}</div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>{user.email}</div>
              </div>

              <button
                onClick={() => {
                  onProfileSettings?.()
                  setShowProfileDropdown(false)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#374051',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                Settings
              </button>

              <button
                onClick={() => {
                  onLogout?.()
                  setShowProfileDropdown(false)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#dc2626',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '0 0 8px 8px'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                <LogOut style={{ width: '16px', height: '16px' }} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {(showUniversityDropdown || showProfileDropdown) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => {
            setShowUniversityDropdown(false)
            setShowProfileDropdown(false)
          }}
        />
      )}
    </header>
  )
}