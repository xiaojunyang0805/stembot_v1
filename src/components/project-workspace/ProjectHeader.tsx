/**
 * Project Header Component
 * Top navigation for project workspace
 */

'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Settings,
  Share2,
  Menu,
  MoreVertical,
  Download,
  Star,
  Archive
} from 'lucide-react'
import { ProjectDetails } from '../../types/project-workspace'

interface ProjectHeaderProps {
  project: ProjectDetails
  onBackToDashboard: () => void
  onToggleSidebar: () => void
  onSettings: () => void
  onShare: () => void
  onExport: () => void
  isSidebarCollapsed: boolean
  isMobile?: boolean
}

export default function ProjectHeader({
  project,
  onBackToDashboard,
  onToggleSidebar,
  onSettings,
  onShare,
  onExport,
  isSidebarCollapsed,
  isMobile = false
}: ProjectHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        {/* Left Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Dashboard Button */}
          <button
            onClick={onBackToDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.color = '#1f2937'
              ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.color = '#4b5563'
              ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            <ArrowLeft style={{width: '16px', height: '16px'}} />
            Dashboard
          </button>

          {/* Sidebar Toggle (Mobile/Tablet) */}
          {(isMobile || isSidebarCollapsed) && (
            <button
              onClick={onToggleSidebar}
              style={{
                padding: '6px',
                color: '#4b5563',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: window.innerWidth >= 1024 ? 'none' : 'block'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#1f2937'
                ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#4b5563'
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              <Menu style={{width: '20px', height: '20px'}} />
            </button>
          )}

          {/* Project Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{fontSize: '20px'}}>{project.subjectEmoji}</span>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.25',
                margin: 0
              }}>
                {project.title}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <span style={{textTransform: 'capitalize'}}>{project.subject}</span>
                <span>•</span>
                <span style={{textTransform: 'capitalize'}}>{project.currentPhase} Phase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Desktop Actions */}
          <div style={{
            display: window.innerWidth >= 768 ? 'flex' : 'none',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={onShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374051',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'white'
              }}
            >
              <Share2 style={{width: '16px', height: '16px'}} />
              Share
            </button>

            <button
              onClick={onExport}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374051',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'white'
              }}
            >
              <Download style={{width: '16px', height: '16px'}} />
              Export
            </button>

            <button
              onClick={onSettings}
              style={{
                padding: '6px',
                color: '#4b5563',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#1f2937'
                ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#4b5563'
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              <Settings style={{width: '20px', height: '20px'}} />
            </button>
          </div>

          {/* Mobile More Menu */}
          <div style={{
            position: 'relative',
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                padding: '6px',
                color: '#4b5563',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#1f2937'
                ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#4b5563'
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              <MoreVertical style={{width: '20px', height: '20px'}} />
            </button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 40
                  }}
                  onClick={() => setShowMoreMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '192px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  zIndex: 50
                }}>
                  <div style={{padding: '4px 0'}}>
                    <button
                      onClick={() => {
                        onShare()
                        setShowMoreMenu(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#374051',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <Share2 style={{width: '16px', height: '16px'}} />
                      Share Project
                    </button>
                    <button
                      onClick={() => {
                        onExport()
                        setShowMoreMenu(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#374051',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <Download style={{width: '16px', height: '16px'}} />
                      Export Project
                    </button>
                    <button
                      onClick={() => {
                        onSettings()
                        setShowMoreMenu(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#374051',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <Settings style={{width: '16px', height: '16px'}} />
                      Settings
                    </button>
                    <div style={{
                      borderTop: '1px solid #e5e7eb',
                      margin: '4px 0'
                    }} />
                    <button
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#374051',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <Star style={{width: '16px', height: '16px'}} />
                      Add to Favorites
                    </button>
                    <button
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#374051',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <Archive style={{width: '16px', height: '16px'}} />
                      Archive Project
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Project Status Bar (Optional) */}
      {!project.isActive && (
        <div style={{
          backgroundColor: '#fefce8',
          borderTop: '1px solid #fde047',
          padding: '8px 16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#a16207'
          }}>
            <Archive style={{width: '16px', height: '16px'}} />
            This project is archived. Reactivate to continue working.
            <button
              style={{
                marginLeft: 'auto',
                color: '#a16207',
                fontWeight: '500',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#854d0e'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#a16207'
              }}
            >
              Reactivate
            </button>
          </div>
        </div>
      )}
    </header>
  )
}