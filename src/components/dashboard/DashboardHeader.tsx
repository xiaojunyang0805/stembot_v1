'use client'

import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'
// Mock import for UI-only components

interface Project {
  id: string
  title: string
}

interface DashboardHeaderProps {
  currentProject?: string
  userName?: string
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentProject = "My Project",
  userName = "Researcher"
}) => {
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const router = useRouter()

  // Mock supabase client for UI-only demo

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        const projectList = (data.projects || []).map((project: any) => ({
          id: project.id,
          title: project.title
        }))
        setProjects(projectList)
      }
    } catch (error) {
      console.error('Error fetching projects for header:', error)
    }
  }

  const handleLogoClick = () => {
    router.push('/dashboard')
  }

  const handleProjectSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`)
    setProjectsDropdownOpen(false)
  }

  const handleProfileClick = () => {
    router.push('/profile')
    setUserDropdownOpen(false)
  }

  const handleSettingsClick = () => {
    router.push('/settings')
    setUserDropdownOpen(false)
  }

  const handleSignOut = async () => {
    try {
      // Mock sign out for UI-only demo
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
    setUserDropdownOpen(false)
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        backgroundColor: 'white',
        borderBottom: '2px solid #e5e7eb',
        position: 'sticky',
        top: '0',
        zIndex: 50
      }}
    >
      {/* Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2563eb',
            marginRight: '16px',
            cursor: 'pointer'
          }}
          onClick={handleLogoClick}
        >
          🧠 StemBot
        </div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          Research Mentoring Platform
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Projects Dropdown */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
        >
          📁 {currentProject} ▼
          {projectsDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                zIndex: 100,
                minWidth: '200px'
              }}
            >
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}
                    onClick={() => handleProjectSelect(project.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                  >
                    {project.title}
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 16px', fontSize: '14px', color: '#6b7280' }}>
                  No projects yet
                </div>
              )}
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderTop: '1px solid #e5e7eb',
                  color: '#2563eb'
                }}
                onClick={() => {
                  router.push('/projects/create')
                  setProjectsDropdownOpen(false)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                + Create New Project
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div
          style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        >
          👤 {userName} ▼
          {userDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                minWidth: '160px',
                zIndex: 100
              }}
            >
              <div
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}
                onClick={handleProfileClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                Profile
              </div>
              <div
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}
                onClick={handleSettingsClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                Settings
              </div>
              <div
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid #e5e7eb' }}
                onClick={handleSignOut}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2'
                  e.currentTarget.style.color = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = 'inherit'
                }}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}