/**
 * Project Card Component
 * Displays research project overview with memory-driven insights
 */

'use client'

import { Calendar, Brain, TrendingUp, Clock, ChevronRight, FileText } from 'lucide-react'

import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { ResearchProject } from '../../types/research'

interface ProjectCardProps {
  project: ResearchProject
  onClick?: () => void
  showMemoryInsights?: boolean
  className?: string
}

export function ProjectCard({
  project,
  onClick,
  showMemoryInsights = true,
  className = ''
}: ProjectCardProps) {
  const getStageColor = (stage: string) => {
    const colors = {
      'question-formation': 'bg-blue-100 text-blue-800 border-blue-200',
      'literature-review': 'bg-green-100 text-green-800 border-green-200',
      'methodology-design': 'bg-purple-100 text-purple-800 border-purple-200',
      'data-collection': 'bg-orange-100 text-orange-800 border-orange-200',
      'analysis': 'bg-red-100 text-red-800 border-red-200',
      'writing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'submission': 'bg-pink-100 text-pink-800 border-pink-200',
      'completed': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getFieldColor = (field: string) => {
    const colors = {
      'computer-science': 'text-blue-600',
      'engineering': 'text-orange-600',
      'mathematics': 'text-purple-600',
      'physics': 'text-green-600',
      'chemistry': 'text-red-600',
      'biology': 'text-emerald-600',
      'psychology': 'text-pink-600',
      'economics': 'text-yellow-600',
      'sociology': 'text-indigo-600'
    }
    return colors[field as keyof typeof colors] || 'text-gray-600'
  }

  const formatStage = (stage: string) => {
    return stage.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatField = (field: string) => {
    return field.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getCompletedMilestones = () => {
    return project.milestones.filter(m => m.completed).length
  }

  const getNextDeadline = () => {
    const upcomingDeadlines = project.deadlines
      .filter(d => !d.completed && new Date(d.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    return upcomingDeadlines[0]
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
return 'Today'
}
    if (diffDays === 1) {
return 'Tomorrow'
}
    if (diffDays < 7) {
return `${diffDays} days`
}
    if (diffDays < 30) {
return `${Math.ceil(diffDays / 7)} weeks`
}
    return `${Math.ceil(diffDays / 30)} months`
  }

  const nextDeadline = getNextDeadline()
  const completedMilestones = getCompletedMilestones()
  const totalMilestones = project.milestones.length

  return (
    <Card
      className={`group cursor-pointer p-6 transition-all duration-200 hover:shadow-md ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {project.description}
          </p>
        </div>
        <ChevronRight className="ml-3 h-5 w-5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-blue-600" />
      </div>

      {/* Project Info */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${getFieldColor(project.field).replace('text-', 'bg-')}`}></div>
          <span className={`text-sm font-medium ${getFieldColor(project.field)}`}>
            {formatField(project.field)}
          </span>
        </div>

        <Badge
          variant="secondary"
          className={`text-xs ${getStageColor(project.stage)}`}
        >
          {formatStage(project.stage)}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {completedMilestones}/{totalMilestones} milestones
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Memory Insights */}
      {showMemoryInsights && project.memoryContext && (
        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Memory Context</span>
          </div>
          <div className="text-xs text-purple-700">
            {project.memoryContext.totalMemories} memories • {project.sessionHistory.length} sessions
          </div>
          {project.sessionHistory.length > 0 && (
            <div className="mt-1 text-xs text-purple-600">
              Last worked: {formatRelativeTime(new Date(project.sessionHistory[0].startTime))} ago
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>

          {nextDeadline && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className={`${
                new Date(nextDeadline.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                  ? 'font-medium text-red-600'
                  : 'text-gray-500'
              }`}>
                {formatRelativeTime(new Date(nextDeadline.dueDate))} left
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          <span>Active</span>
        </div>
      </div>

      {/* Recent Activity Indicator */}
      {project.sessionHistory.length > 0 && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="h-3 w-3" />
            <span>
              Last activity: {project.sessionHistory[0].activitiesCompleted[0] || 'Working on project'}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}