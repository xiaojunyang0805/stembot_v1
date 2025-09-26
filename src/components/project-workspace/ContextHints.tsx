/**
 * Context Hints Component
 * Bottom panel with contextual hints from memory
 */

'use client'

import { useState } from 'react'
import {
  Lightbulb,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info,
  Zap,
  Target,
  X,
  Sparkles
} from 'lucide-react'
import { ContextHint } from '../../types/project-workspace'

interface ContextHintsProps {
  hints: ContextHint[]
  onHintClick?: (hint: ContextHint) => void
  onDismissHint?: (hintId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  maxVisible?: number
}

export default function ContextHints({
  hints,
  onHintClick,
  onDismissHint,
  isCollapsed = false,
  onToggleCollapse,
  maxVisible = 4
}: ContextHintsProps) {
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set())

  const getHintIcon = (type: ContextHint['type']) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-4 h-4" />
      case 'reminder':
        return <AlertCircle className="w-4 h-4" />
      case 'insight':
        return <Sparkles className="w-4 h-4" />
      case 'warning':
        return <Info className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getHintStyle = (type: ContextHint['type']) => {
    switch (type) {
      case 'suggestion':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          button: 'hover:bg-blue-100'
        }
      case 'reminder':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          icon: 'text-yellow-600',
          button: 'hover:bg-yellow-100'
        }
      case 'insight':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          icon: 'text-purple-600',
          button: 'hover:bg-purple-100'
        }
      case 'warning':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          icon: 'text-red-600',
          button: 'hover:bg-red-100'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          icon: 'text-gray-600',
          button: 'hover:bg-gray-100'
        }
    }
  }

  const getPriorityOrder = (type: ContextHint['type']) => {
    switch (type) {
      case 'warning': return 0
      case 'reminder': return 1
      case 'insight': return 2
      case 'suggestion': return 3
      default: return 4
    }
  }

  const visibleHints = hints
    .filter(hint => !dismissedHints.has(hint.id))
    .sort((a, b) => {
      // Sort by relevance and type priority
      const priorityA = getPriorityOrder(a.type)
      const priorityB = getPriorityOrder(b.type)
      if (priorityA !== priorityB) return priorityA - priorityB
      return b.relevance - a.relevance
    })
    .slice(0, maxVisible)

  const handleDismiss = (hintId: string) => {
    setDismissedHints(prev => new Set(prev).add(hintId))
    onDismissHint?.(hintId)
  }

  if (visibleHints.length === 0) return null

  return (
    <div style={{
      backgroundColor: '#fffbeb',
      borderTop: '1px solid #fed7aa',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px' }}>💡</span>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#92400e',
          margin: 0
        }}>
          Context Hints
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibleHints.map((hint) => (
          <button
            key={hint.id}
            onClick={() => onHintClick?.(hint)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px 0',
              backgroundColor: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#fef3c7'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '14px', marginTop: '2px' }}>•</span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                color: '#92400e',
                lineHeight: '1.4',
                margin: 0
              }}>
                {hint.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}