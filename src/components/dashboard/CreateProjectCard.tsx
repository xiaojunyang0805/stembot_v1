'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

interface CreateProjectCardProps {
  onCreate?: () => void
}

export const CreateProjectCard: React.FC<CreateProjectCardProps> = ({ onCreate }) => {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleCreate = () => {
    if (onCreate) {
      onCreate()
    } else {
      router.push('/projects/create')
    }
  }

  const cardStyle = {
    backgroundColor: isHovered ? '#f0f8ff' : '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '40px 24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderColor: isHovered ? '#2563eb' : '#cbd5e1'
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCreate}
    >
      {/* Plus Icon */}
      <div
        style={{
          fontSize: '40px',
          color: '#94a3b8',
          marginBottom: '12px'
        }}
      >
        +
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px'
        }}
      >
        Create New Project
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '16px'
        }}
      >
        Start a new research project with AI guidance
      </div>

      {/* Create Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleCreate()
        }}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 20px',
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
        + Create
      </button>
    </div>
  )
}