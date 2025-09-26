/**
 * Quick Actions Component
 * Prominent buttons for common research actions
 */

'use client'

import { QuickAction } from '../../types/dashboard'

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
}

export default function QuickActions({
  actions,
  title = ''
}: QuickActionsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div style={{
      marginBottom: '32px'
    }}>
      {/* Header */}
      {title && (
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 16px 0'
        }}>{title}</h3>
      )}

      {/* Actions Grid */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {actions.map((action) => {
          const IconComponent = action.icon

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              style={{
                backgroundColor: action.color,
                color: 'white',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                flex: '1',
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(-2px)'
                target.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.2)'
                target.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = 'none'
                target.style.opacity = '1'
              }}
            >
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}