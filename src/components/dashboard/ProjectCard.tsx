/**
 * Project Card Component
 * Individual project display with progress, phase, and actions
 */

'use client'

import { Calendar, ArrowRight, Clock, CheckCircle, Target } from 'lucide-react'

import { Project, PhaseInfo } from '../../types/dashboard'

interface ProjectCardProps {
  project: Project
  onOpenProject: (projectId: string) => void
  isCreateNew?: boolean
  onCreate?: () => void
}

const phaseInfo: Record<Project['currentPhase'], PhaseInfo> = {
  question: {
    phase: 'question',
    label: 'Question Formation',
    color: '#dc2626',
    bgColor: '#fee2e2',
    description: 'Developing research question'
  },
  literature: {
    phase: 'literature',
    label: 'Literature Review',
    color: '#d97706',
    bgColor: '#fed7aa',
    description: 'Reviewing existing research'
  },
  methodology: {
    phase: 'methodology',
    label: 'Methodology',
    color: '#7c3aed',
    bgColor: '#e9d5ff',
    description: 'Planning research approach'
  },
  writing: {
    phase: 'writing',
    label: 'Academic Writing',
    color: '#2563eb',
    bgColor: '#dbeafe',
    description: 'Writing and analysis'
  },
  export: {
    phase: 'export',
    label: 'Export & Share',
    color: '#16a34a',
    bgColor: '#dcfce7',
    description: 'Finalizing and sharing'
  }
}

export default function ProjectCard({
  project,
  onOpenProject,
  isCreateNew = false,
  onCreate
}: ProjectCardProps) {
  if (isCreateNew) {
    return (
      <div
        onClick={onCreate}
        style={{
          backgroundColor: '#ffffff',
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLDivElement
          target.style.borderColor = '#2563eb'
          target.style.backgroundColor = '#f8fafc'
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLDivElement
          target.style.borderColor = '#d1d5db'
          target.style.backgroundColor = '#ffffff'
        }}
      >
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <span style={{
            fontSize: '24px',
            color: '#6b7280'
          }}>+</span>
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>+ Create New</h3>
        <div style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0 0 16px 0',
          maxWidth: '200px'
        }}>
          <div>Research</div>
          <div>Project</div>
        </div>
        <div style={{
          color: '#6b7280',
          fontSize: '12px',
          margin: '8px 0'
        }}>
          Get started
        </div>
        <div style={{
          color: '#6b7280',
          fontSize: '12px',
          marginBottom: '12px'
        }}>
          in 30 seconds
        </div>
        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          [+ Create]
        </button>
      </div>
    )
  }

  const phase = phaseInfo[project.currentPhase]
  const isOverdue = project.dueDate && project.dueDate < new Date()
  const isDueSoon = project.dueDate && project.dueDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntilDue = (date: Date) => {
    const diffTime = date.getTime() - Date.now()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`
    } else if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else {
      return `Due in ${diffDays} days`
    }
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s ease',
      minHeight: '280px',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      const target = e.target as HTMLDivElement
      target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      target.style.transform = 'translateY(-1px)'
    }}
    onMouseLeave={(e) => {
      const target = e.target as HTMLDivElement
      target.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      target.style.transform = 'translateY(0)'
    }}
    >
      {/* Project Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1
        }}>
          <span style={{
            fontSize: '20px'
          }}>{project.subjectEmoji}</span>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            lineHeight: '1.4'
          }}>{project.title}</h3>
        </div>

        {!project.isActive && (
          <div style={{
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            fontSize: '12px',
            fontWeight: '500',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Inactive
          </div>
        )}
      </div>

      {/* Phase Icons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '12px',
        fontSize: '18px'
      }}>
        <span style={{
          opacity: project.currentPhase === 'question' ? 1 : 0.3
        }}>💬</span>
        <span style={{
          opacity: ['literature', 'methodology', 'writing', 'export'].includes(project.currentPhase) ? 1 : 0.3
        }}>📚</span>
        <span style={{
          opacity: ['methodology', 'writing', 'export'].includes(project.currentPhase) ? 1 : 0.3
        }}>🔬</span>
        <span style={{
          opacity: ['writing', 'export'].includes(project.currentPhase) ? 1 : 0.3
        }}>✍️</span>
      </div>

      {/* Progress Bar */}
      <div style={{
        marginBottom: '16px',
        fontFamily: 'monospace'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>
            {Array.from({ length: 10 }, (_, i) =>
              i < Math.floor(project.progress / 10) ? '█' : '░'
            ).join('')}
          </span>
          <span>{project.progress}%</span>
        </div>
      </div>

      {/* Due Date */}
      {project.dueDate && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: isOverdue ? '#fef2f2' : isDueSoon ? '#fef3c7' : '#f8fafc',
          borderRadius: '6px',
          border: `1px solid ${isOverdue ? '#fecaca' : isDueSoon ? '#fcd34d' : '#e2e8f0'}`
        }}>
          <Calendar style={{
            width: '14px',
            height: '14px',
            color: isOverdue ? '#dc2626' : isDueSoon ? '#d97706' : '#6b7280'
          }} />
          <div>
            <div style={{
              fontSize: '12px',
              color: isOverdue ? '#dc2626' : isDueSoon ? '#d97706' : '#6b7280',
              fontWeight: '500'
            }}>
              {getDaysUntilDue(project.dueDate)}
            </div>
            <div style={{
              fontSize: '11px',
              color: isOverdue ? '#991b1b' : isDueSoon ? '#b45309' : '#9ca3af'
            }}>
              {formatDate(project.dueDate)}
            </div>
          </div>
        </div>
      )}

      {/* Project Status */}
      <div style={{
        flex: 1,
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          {project.currentPhase === 'literature' && '5 sources • Gap found'}
          {project.currentPhase === 'methodology' && '2 experiments planned'}
          {project.currentPhase === 'question' && 'Question refined • Ready for sources'}
          {project.currentPhase === 'writing' && 'Draft in progress • 3 sections done'}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: 'auto'
      }}>
        <button
          onClick={() => onOpenProject(project.id)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            flex: 1
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
          }}
        >
          [Enter Workspace]
        </button>
        <button
          onClick={() => console.log('View details for', project.id)}
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
            ;(e.target as HTMLButtonElement).style.color = '#374151'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.target as HTMLButtonElement).style.color = '#6b7280'
          }}
        >
          [📋 Details]
        </button>
      </div>
    </div>
  )
}