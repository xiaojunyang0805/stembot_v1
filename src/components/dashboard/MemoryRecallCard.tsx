'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface MemoryRecallCardProps {
  lastSession?: string
  nextStep?: string
  projectId?: string
}

export const MemoryRecallCard: React.FC<MemoryRecallCardProps> = ({
  lastSession = "You were analyzing sleep data patterns and identified a correlation between REM cycles and memory consolidation in adolescents.",
  nextStep = "Continue with statistical analysis of the consolidated data",
  projectId = "sleep-memory-study"
}) => {
  const router = useRouter()

  const handleContinue = () => {
    router.push(`/projects/${projectId}`)
  }

  return (
    <div
      style={{
        backgroundColor: '#f0f8ff',
        border: '2px solid #bfdbfe',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '24px', marginRight: '12px' }}>🧠</div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#1e40af' }}>
          Memory Recall
        </div>
      </div>

      {/* Last Session */}
      <div
        style={{
          fontSize: '16px',
          color: '#374151',
          lineHeight: '1.5',
          marginBottom: '8px'
        }}
      >
        <strong>Last session:</strong> {lastSession}
      </div>

      {/* Next Step */}
      <div
        style={{
          fontSize: '16px',
          color: '#059669',
          fontWeight: '500',
          marginBottom: '20px'
        }}
      >
        <strong>Next step:</strong> {nextStep}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d4ed8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb'
        }}
      >
        Continue Research →
      </button>
    </div>
  )
}