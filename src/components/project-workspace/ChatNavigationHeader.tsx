'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'

interface ChatNavigationHeaderProps {
  currentPhase: 'workspace' | 'literature' | 'methodology' | 'writing'
}

export default function ChatNavigationHeader({ currentPhase }: ChatNavigationHeaderProps) {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const navigationButtons = [
    { id: 'workspace', label: 'Workspace', path: `/projects/${projectId}` },
    { id: 'literature', label: 'Literature', path: `/projects/${projectId}/literature` },
    { id: 'methodology', label: 'Methodology', path: `/projects/${projectId}/methodology` },
    { id: 'writing', label: 'Writing', path: `/projects/${projectId}/writing` }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 20px',
      display: 'flex',
      gap: '8px'
    }}>
      {navigationButtons.map((button) => {
        const isActive = currentPhase === button.id
        const isWorkspace = button.id === 'workspace'

        return (
          <button
            key={button.id}
            onClick={() => handleNavigation(button.path)}
            disabled={isWorkspace}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isWorkspace ? 'default' : 'pointer',
              backgroundColor: isActive
                ? '#f3f4f6'
                : 'transparent',
              color: isWorkspace
                ? '#9ca3af'
                : isActive
                  ? '#374151'
                  : '#6b7280',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isWorkspace && !isActive) {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.color = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (!isWorkspace && !isActive) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            {button.label}
          </button>
        )
      })}
    </div>
  )
}