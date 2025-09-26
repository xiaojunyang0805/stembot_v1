'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  label: string
  icon: string
  path: string
}

interface QuickActionsBarProps {
  actions?: QuickAction[]
}

const defaultActions: QuickAction[] = [
  {
    id: 'browse',
    label: 'Browse Projects',
    icon: '📚',
    path: '/projects/browse'
  },
  {
    id: 'mentor',
    label: 'Ask AI Mentor',
    icon: '💬',
    path: '/mentor'
  },
  {
    id: 'progress',
    label: 'Progress Report',
    icon: '📈',
    path: '/progress'
  }
]

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  actions = defaultActions
}) => {
  const router = useRouter()

  const handleActionClick = (path: string) => {
    router.push(path)
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleActionClick(action.path)}
          style={{
            backgroundColor: '#f3f4f6',
            color: '#374151',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb'
            e.currentTarget.style.borderColor = '#9ca3af'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
            e.currentTarget.style.borderColor = '#d1d5db'
          }}
        >
          <span style={{ marginRight: '8px', fontSize: '16px' }}>
            {action.icon}
          </span>
          {action.label}
        </button>
      ))}
    </div>
  )
}