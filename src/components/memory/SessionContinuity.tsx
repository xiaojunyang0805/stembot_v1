/**
 * Session Continuity Component
 * Provides context from previous sessions and suggests next steps
 */

'use client'

import { useState, useEffect } from 'react'

import { Play, ArrowRight, Clock, Target, Lightbulb, CheckCircle } from 'lucide-react'

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SessionContinuity as SessionContinuityType, SessionRecord } from '../../types/memory'

interface SessionContinuityProps {
  projectId: string
  onContinueSession?: (activity: string) => void
  className?: string
}

export function SessionContinuity({
  projectId,
  onContinueSession,
  className = ''
}: SessionContinuityProps) {
  const [continuity, setContinuity] = useState<SessionContinuityType | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchSessionContinuity()
      fetchRecentSessions()
    }
  }, [projectId])

  const fetchSessionContinuity = async () => {
    try {
      const response = await fetch(`/api/memory/continuity?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setContinuity(data)
      }
    } catch (error) {
      console.error('Failed to fetch session continuity:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sessions?limit=3`)
      if (response.ok) {
        const data = await response.json()
        setRecentSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
return 'Less than an hour ago'
}
    if (diffInHours < 24) {
return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
}
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const handleContinueActivity = (activity: string) => {
    if (onContinueSession) {
      onContinueSession(activity)
    }
  }

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-6 rounded bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-4 rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!continuity) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Play className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm">Start working on your project to build session continuity.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-green-100 p-2">
          <Play className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Continue Where You Left Off</h3>
          {continuity.lastSession && (
            <p className="text-sm text-gray-600">
              Last worked {formatTimeAgo(new Date(continuity.lastSession.endTime))} • {continuity.lastSession.stage}
            </p>
          )}
        </div>
      </div>

      {/* Last Session Summary */}
      {continuity.lastSession && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900">
            <Clock className="h-4 w-4" />
            Last Session Summary
          </h4>

          <div className="mb-3 text-sm text-blue-800">
            <strong>Activity:</strong> {continuity.lastSession.lastActivity}
          </div>

          {continuity.lastSession.keyPoints.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-xs font-medium text-blue-700">Key Points Covered:</div>
              <ul className="space-y-1 text-sm text-blue-800">
                {continuity.lastSession.keyPoints.slice(0, 3).map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {continuity.lastSession.pendingTasks.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-blue-700">Pending Tasks:</div>
              <ul className="space-y-1 text-sm text-blue-800">
                {continuity.lastSession.pendingTasks.slice(0, 2).map((task, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-600" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suggested Next Steps */}
      {continuity.nextSteps.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lightbulb className="h-4 w-4" />
            Suggested Next Steps
          </h4>
          <div className="space-y-2">
            {continuity.nextSteps.slice(0, 3).map((step, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-gray-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <span className="text-xs font-medium text-green-600">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-900">{step}</span>
                </div>
                <Button
                  onClick={() => handleContinueActivity(step)}
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continuity Prompts */}
      {continuity.continuityPrompts.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-700">Quick Context Reminders</h4>
          <div className="space-y-2">
            {continuity.continuityPrompts.slice(0, 2).map((prompt, index) => (
              <div
                key={index}
                className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
              >
                <p className="text-sm text-yellow-800">{prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Summary */}
      {continuity.contextSummary && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Project Context</h4>
          <p className="text-sm text-gray-600">{continuity.contextSummary}</p>
        </div>
      )}
    </Card>
  )
}