/**
 * Project Sidebar Component
 * Left sidebar with overview, memory, and documents sections
 */

'use client'

import { useState } from 'react'
import {
  ProjectDetails,
  PhaseProgress,
  MemoryRecall,
  ProjectDocument,
  SidebarState
} from '../../types/project-workspace'

interface ProjectSidebarProps {
  project: ProjectDetails
  memoryRecall: MemoryRecall
  documents: ProjectDocument[]
  phases: PhaseProgress[]
  sidebarState: SidebarState
  onSidebarStateChange: (state: Partial<SidebarState>) => void
  onDocumentUpload: (file: File) => void
  onDocumentClick: (document: ProjectDocument) => void
  onDocumentDelete: (documentId: string) => void
  onViewAllSources: () => void
  className?: string
}

export default function ProjectSidebar({
  project,
  memoryRecall,
  documents,
  phases,
  sidebarState,
  onSidebarStateChange,
  onDocumentUpload,
  onDocumentClick,
  onDocumentDelete,
  onViewAllSources,
  className = ''
}: ProjectSidebarProps) {
  const [expandedQuestion, setExpandedQuestion] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'docx':
        return '📝'
      case 'xlsx':
        return '📊'
      case 'image':
        return '🖼️'
      default:
        return '📎'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onDocumentUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      onDocumentUpload(file)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return { color: '#059669', backgroundColor: '#ecfdf5' }
    if (confidence >= 0.6) return { color: '#d97706', backgroundColor: '#fffbeb' }
    return { color: '#dc2626', backgroundColor: '#fef2f2' }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Sidebar Header - Removed */}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Research Goal Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>🎯</span>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Research Goal</h3>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#475569',
              lineHeight: '1.4',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {project.researchQuestion || "How does sleep deprivation affect memory consolidation in college students?"}
            </p>
          </div>
        </div>

        {/* Sources Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>📚</span>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Sources ({project.sourceCount})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>• Smith (2024)</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>• Johnson et al.</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>• Lee & Chen (2023)</div>
          </div>

          <button
            onClick={onViewAllSources}
            style={{
              fontSize: '14px',
              color: '#2563eb',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            [View All]
          </button>
        </div>

        {/* Progress Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Progress</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Literature Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Literature</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>85%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '85%',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Methodology Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Methodology</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>45%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '45%',
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Writing Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Writing</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>15%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '15%',
                  backgroundColor: '#f59e0b',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Memory Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Memory</h3>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fed7aa'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#92400e',
              lineHeight: '1.4',
              margin: 0
            }}>
              Last week you mentioned wanting to focus on undergraduate students specifically...
            </p>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>📂</span>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Documents</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>• Lab_notes.pdf</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>• Data.xlsx</div>
          </div>

          <button
            onClick={() => document.querySelector<HTMLInputElement>('#file-upload')?.click()}
            style={{
              fontSize: '14px',
              color: '#2563eb',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            [Upload More]
          </button>

          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.xlsx,.txt,.png,.jpg,.jpeg"
            multiple
          />
        </div>
      </div>
    </div>
  )
}