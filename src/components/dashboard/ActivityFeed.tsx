/**
 * Activity Feed Component
 * Recent research activities list with clean typography
 */

'use client'

import {
  Plus,
  CheckCircle,
  BookOpen,
  FileText,
  Download,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react'
import { Activity } from '../../types/dashboard'

interface ActivityFeedProps {
  activities: Activity[]
  onViewAll?: () => void
  maxItems?: number
}

const activityIcons = {
  created_project: Plus,
  completed_phase: CheckCircle,
  added_source: BookOpen,
  generated_content: FileText,
  exported_document: Download
}

const activityColors = {
  created_project: '#2563eb',
  completed_phase: '#16a34a',
  added_source: '#d97706',
  generated_content: '#7c3aed',
  exported_document: '#dc2626'
}

export default function ActivityFeed({
  activities,
  onViewAll,
  maxItems = 8
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  const getRelativeDate = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffTime = activityDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === -1) {
      return 'Yesterday'
    } else if (diffDays > -7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Group activities by date
  const groupedActivities = displayedActivities.reduce((groups, activity) => {
    const dateKey = getRelativeDate(activity.timestamp)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(activity)
    return groups
  }, {} as Record<string, Activity[]>)

  if (activities.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>Recent Activity</h3>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '32px 16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Clock style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
          </div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>No Recent Activity</h4>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Your research activity will appear here as you work on projects.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>Recent Activity</h3>

        {activities.length > maxItems && onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              backgroundColor: 'transparent',
              color: '#2563eb',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            View all
            <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        )}
      </div>

      {/* Activity Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
          <div key={dateGroup}>
            {/* Date Header */}
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              paddingBottom: '4px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              {dateGroup}
            </div>

            {/* Activities for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {groupActivities.map((activity) => {
                const IconComponent = activityIcons[activity.type] || FileText
                const iconColor = activityColors[activity.type] || '#6b7280'

                return (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLDivElement).style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => (e.target as HTMLDivElement).style.backgroundColor = 'transparent'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: `${iconColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent style={{
                        width: '16px',
                        height: '16px',
                        color: iconColor
                      }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#1f2937',
                        lineHeight: '1.4',
                        marginBottom: '2px'
                      }}>
                        {activity.description}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                        {activity.projectTitle && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#6b7280' }}>{activity.projectTitle}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow (if clickable) */}
                    {activity.projectId && (
                      <button
                        onClick={() => {
                          // Navigate to project or show details
                          window.location.href = `/projects/${activity.projectId}`
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.color = '#6b7280'
                          target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.color = '#9ca3af'
                          target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <ArrowRight style={{ width: '14px', height: '14px' }} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Show remaining count */}
      {activities.length > maxItems && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: 0
          }}>
            Showing {maxItems} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  )
}