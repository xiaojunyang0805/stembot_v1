/**
 * Research Progress Component
 * Comprehensive progress tracking for research projects
 */

'use client'

import { useState, useEffect } from 'react'

import {
  CheckCircle,
  Circle,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  Award,
  Zap,
  BarChart3,
  Brain,
  BookOpen,
  PenTool,
  Download
} from 'lucide-react'

import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ResearchProject, ProjectMilestone } from '../../types/research'


interface ResearchProgressProps {
  project: ResearchProject
  onStageClick?: (stage: string) => void
  showDetails?: boolean
  className?: string
}

export function ResearchProgress({
  project,
  onStageClick,
  showDetails = false,
  className = ''
}: ResearchProgressProps) {
  const [timeMetrics, setTimeMetrics] = useState<any>(null)
  const [progressInsights, setProgressInsights] = useState<any[]>([])

  useEffect(() => {
    calculateTimeMetrics()
    generateProgressInsights()
  }, [project])

  const calculateTimeMetrics = () => {
    const startDate = new Date(project.createdAt)
    const now = new Date()
    const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate completion rate
    const completedMilestones = project.milestones.filter(m => m.completed).length
    const totalMilestones = project.milestones.length
    const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

    // Calculate expected vs actual progress
    const stageOrder = ['question-formation', 'literature-review', 'methodology-design', 'writing', 'export']
    const currentStageIndex = stageOrder.indexOf(project.stage)
    const expectedProgress = totalDays > 0 ? Math.min((totalDays / 90) * 100, 100) : 0 // Assuming 90-day project

    setTimeMetrics({
      totalDays,
      completionRate,
      expectedProgress,
      currentStageIndex,
      isOnTrack: completionRate >= expectedProgress * 0.8,
      velocity: totalDays > 0 ? completedMilestones / totalDays : 0
    })
  }

  const generateProgressInsights = () => {
    const insights = []

    // Memory activity insight
    if (project.memoryContext && project.memoryContext.totalMemories > 0) {
      const memoryRate = project.memoryContext.totalMemories / Math.max(project.sessionHistory.length, 1)
      insights.push({
        type: 'memory',
        title: 'Memory Building',
        description: `Averaging ${memoryRate.toFixed(1)} memories per session`,
        score: Math.min(memoryRate * 20, 100),
        icon: Brain
      })
    }

    // Session consistency
    if (project.sessionHistory.length > 0) {
      const recentSessions = project.sessionHistory.filter(s =>
        new Date(s.startTime).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length
      insights.push({
        type: 'consistency',
        title: 'Weekly Activity',
        description: `${recentSessions} sessions this week`,
        score: Math.min(recentSessions * 25, 100),
        icon: Calendar
      })
    }

    // Stage progression
    const stageScores = {
      'question-formation': 20,
      'literature-review': 40,
      'methodology-design': 60,
      'writing': 80,
      'export': 100
    }
    const currentScore = stageScores[project.stage as keyof typeof stageScores] || 0
    insights.push({
      type: 'progression',
      title: 'Research Stage',
      description: `${currentScore}% through research process`,
      score: currentScore,
      icon: TrendingUp
    })

    setProgressInsights(insights)
  }

  const getStageInfo = () => {
    const stages = [
      {
        key: 'question-formation',
        title: 'Question Formation',
        description: 'Refine research question',
        icon: Target,
        color: 'blue'
      },
      {
        key: 'literature-review',
        title: 'Literature Review',
        description: 'Analyze existing research',
        icon: BookOpen,
        color: 'green'
      },
      {
        key: 'methodology-design',
        title: 'Methodology',
        description: 'Design research approach',
        icon: BarChart3,
        color: 'purple'
      },
      {
        key: 'writing',
        title: 'Writing',
        description: 'Draft research document',
        icon: PenTool,
        color: 'indigo'
      },
      {
        key: 'export',
        title: 'Export & Share',
        description: 'Finalize and present',
        icon: Download,
        color: 'orange'
      }
    ]

    return stages.map(stage => ({
      ...stage,
      completed: project.stage !== stage.key && stages.findIndex(s => s.key === project.stage) > stages.findIndex(s => s.key === stage.key),
      current: project.stage === stage.key,
      milestones: project.milestones.filter(m => m.stage === stage.key)
    }))
  }

  const getUpcomingDeadlines = () => {
    return project.deadlines
      .filter(d => !d.completed && new Date(d.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) {
return 'text-green-600 bg-green-100'
}
    if (score >= 60) {
return 'text-yellow-600 bg-yellow-100'
}
    if (score >= 40) {
return 'text-orange-600 bg-orange-100'
}
    return 'text-red-600 bg-red-100'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
return 'Today'
}
    if (diffDays === 1) {
return 'Yesterday'
}
    if (diffDays < 7) {
return `${diffDays} days ago`
}
    if (diffDays < 30) {
return `${Math.floor(diffDays / 7)} weeks ago`
}
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const stages = getStageInfo()
  const upcomingDeadlines = getUpcomingDeadlines()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Research Progress</h3>
          {timeMetrics && (
            <Badge className={timeMetrics.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {timeMetrics.isOnTrack ? 'On Track' : 'Needs Attention'}
            </Badge>
          )}
        </div>

        {timeMetrics && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{timeMetrics.totalDays}</div>
              <div className="text-sm text-blue-700">Days Active</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(timeMetrics.completionRate)}%</div>
              <div className="text-sm text-green-700">Complete</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{project.sessionHistory.length}</div>
              <div className="text-sm text-purple-700">Sessions</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round(timeMetrics?.completionRate || 0)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${timeMetrics?.completionRate || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stage Timeline */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            return (
              <div
                key={stage.key}
                className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-all ${
                  stage.current
                    ? `bg-${stage.color}-50 border- border${stage.color}-200`
                    : stage.completed
                    ? 'border border-green-200 bg-green-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => onStageClick?.(stage.key)}
              >
                <div className={`rounded-lg p-2 ${
                  stage.completed
                    ? 'bg-green-100 text-green-600'
                    : stage.current
                    ? `bg-${stage.color}-100 text-${stage.color}-600`
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {stage.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      stage.current ? `text-${stage.color}-900` : stage.completed ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {stage.title}
                    </h4>
                    {stage.current && (
                      <Badge className="bg-blue-100 text-xs text-blue-800">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {stage.milestones.filter(m => m.completed).length}/{stage.milestones.length}
                  </div>
                  <div className="text-xs text-gray-500">milestones</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Progress Insights */}
      {progressInsights.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Progress Insights</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {progressInsights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  </div>
                  <p className="mb-2 text-sm text-gray-600">{insight.description}</p>
                  <div className={`inline-block rounded-full px-2 py-1 text-xs ${getProgressColor(insight.score)}`}>
                    {Math.round(insight.score)}% score
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => {
              const daysUntil = Math.ceil((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const isUrgent = daysUntil <= 7

              return (
                <div key={deadline.id} className={`rounded-lg border p-3 ${
                  isUrgent ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${isUrgent ? 'text-red-900' : 'text-yellow-900'}`}>
                        {deadline.title}
                      </h4>
                      <p className={`text-sm ${isUrgent ? 'text-red-700' : 'text-yellow-700'}`}>
                        {deadline.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                        {daysUntil} days
                      </div>
                      <div className={`text-xs ${isUrgent ? 'text-red-500' : 'text-yellow-500'}`}>
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {showDetails && project.sessionHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="space-y-3">
            {project.sessionHistory.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {session.activitiesCompleted[0] || 'Research session'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTimeAgo(new Date(session.startTime))} • {session.stage.replace('-', ' ')}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {session.keyInsights.length} insights
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}