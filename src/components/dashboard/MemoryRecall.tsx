/**
 * Memory Recall Component
 * Resume where you left off section with AI memory integration
 */

'use client'

import { ArrowRight } from 'lucide-react'
import { MemorySession } from '../../types/dashboard'

interface MemoryRecallProps {
  memorySession: MemorySession | null
  onContinueResearch: (projectId: string) => void
}

export default function MemoryRecall({
  memorySession,
  onContinueResearch
}: MemoryRecallProps) {
  if (!memorySession) {
    return (
      <div style={{
        backgroundColor: '#f0f8ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '20px' }}>🧠</span>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>Resume where you left off</h3>
        </div>

        <p style={{
          color: '#374151',
          fontSize: '14px',
          margin: '0 0 16px 0',
          lineHeight: '1.5'
        }}>
          No previous sessions found. Create your first research project to get started with AI-powered research mentoring.
        </p>

        <button
          onClick={() => window.location.href = '/projects/create'}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
        >
          Create First Project →
        </button>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#f0f8ff',
      border: '1px solid #bfdbfe',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '20px' }}>🧠</span>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>Resume where you left off</h3>
      </div>

      <div style={{
        marginBottom: '16px'
      }}>
        <p style={{
          color: '#374151',
          fontSize: '14px',
          margin: '0 0 12px 0',
          lineHeight: '1.5'
        }}>
          <strong>Last session:</strong> "{memorySession.summary}"
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '16px', marginTop: '2px' }}>⭐</span>
          <p style={{
            color: '#374151',
            fontSize: '14px',
            margin: '0',
            fontWeight: '500'
          }}>
            <strong>Next suggested action:</strong> {memorySession.suggestedNextAction}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => onContinueResearch(memorySession.projectId)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
        >
          Continue Research →
        </button>
      </div>
    </div>
  )
}