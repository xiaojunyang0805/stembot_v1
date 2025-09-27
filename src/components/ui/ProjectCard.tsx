/**
 * Project Card Component
 *
 * Research project display card with academic styling and memory-driven features.
 * Shows project information, progress, and intelligent next steps.
 *
 * Features:
 * - Project title and research question display
 * - Phase indicator with progress visualization
 * - Memory-driven next step suggestions
 * - Academic progress tracking
 * - Professional card styling
 *
 * @location src/components/ui/ProjectCard.tsx
 */

'use client';

import React, { useState } from 'react';

import {
  BookOpen,
  Search,
  Settings,
  PenTool,
  CheckCircle,
  Clock,
  ArrowRight,
  Brain,
  Target,
  Calendar,
  Users,
  MoreHorizontal,
  Star,
  AlertTriangle,
} from 'lucide-react';

import { ResearchProject as GlobalResearchProject, ResearchStage } from '../../types/research-project';

/**
 * Props for the ProjectCard component
 */
export interface ProjectCardData {
  id: string;
  title: string;
  researchQuestion: string;
  field: string;
  phase: ResearchStage;
  progress: number;
  startDate: Date;
  targetDate?: Date;
  lastActivity: Date;
  collaborators: number;
  isStarred: boolean;
  status: 'active' | 'paused' | 'completed' | 'archived';
  memoryContext?: {
    lastSession: string;
    nextSteps: string[];
    insights: string[];
    confidence: number;
  };
  milestones: {
    phase: ResearchStage;
    completed: boolean;
    dueDate?: Date;
  }[];
}

/**
 * Props for the ProjectCard component
 */
export interface ProjectCardProps {
  project: GlobalResearchProject;
  onClick?: () => void;
  onSelect?: (project: GlobalResearchProject) => void;
  onToggleStar?: (projectId: string) => void;
  onViewDetails?: (projectId: string) => void;
  showMemoryHints?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * ProjectCard component for displaying research projects
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onSelect,
  onToggleStar,
  onViewDetails,
  showMemoryHints = true,
  compact = false,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Map GlobalResearchProject to component-expected format
  const projectData = {
    id: project.id,
    title: project.title,
    researchQuestion: project.question?.refinedQuestion || project.question?.originalQuestion || project.research_question || 'No research question',
    field: project.field || 'General',
    phase: project.stage || project.phase,
    progress: typeof project.progress === 'number' ? project.progress : project.progress?.overall || 0,
    startDate: project.createdAt || new Date(project.created_at),
    targetDate: project.deadlines?.[0]?.dueDate,
    lastActivity: project.updatedAt || new Date(project.updated_at),
    collaborators: project.collaboration?.collaborators.length || project.collaborators?.length || 0,
    isStarred: false, // Default to false, can be enhanced later
    status: project.archivedAt ? 'archived' : 'active' as const,
    memoryContext: {
      lastSession: project.sessionHistory?.[0]?.insights?.[0] || 'No recent activity',
      nextSteps: project.sessionHistory?.[0]?.nextSteps || [],
      insights: project.sessionHistory?.[0]?.insights || [],
      confidence: 0.8, // Default confidence
    },
    milestones: project.milestones?.map((m: any) => ({
      phase: m.stage,
      completed: m.completed,
      dueDate: m.dueDate,
    })) || [],
  };

  const phaseConfig = {
    'question-formation': {
      name: 'Question Formation',
      icon: Target,
      color: 'stage-question-formation',
      progress: 0,
    },
    'literature-review': {
      name: 'Literature Review',
      icon: BookOpen,
      color: 'stage-literature-review',
      progress: 20,
    },
    'methodology-design': {
      name: 'Methodology Design',
      icon: Settings,
      color: 'stage-methodology',
      progress: 40,
    },
    'data-collection': {
      name: 'Data Collection',
      icon: Search,
      color: 'stage-data-collection',
      progress: 60,
    },
    'analysis': {
      name: 'Analysis',
      icon: CheckCircle,
      color: 'stage-analysis',
      progress: 70,
    },
    'writing': {
      name: 'Writing',
      icon: PenTool,
      color: 'stage-writing',
      progress: 85,
    },
    'review': {
      name: 'Review',
      icon: Users,
      color: 'stage-review',
      progress: 95,
    },
    'publication': {
      name: 'Publication',
      icon: CheckCircle,
      color: 'stage-publication',
      progress: 98,
    },
    'export': {
      name: 'Export',
      icon: ArrowRight,
      color: 'stage-export',
      progress: 99,
    },
    'completed': {
      name: 'Completed',
      icon: CheckCircle,
      color: 'stage-completed',
      progress: 100,
    },
    'archived': {
      name: 'Archived',
      icon: Calendar,
      color: 'stage-archived',
      progress: 100,
    },
  };

  const currentPhase = phaseConfig[projectData.phase as keyof typeof phaseConfig];
  const PhaseIcon = currentPhase.icon;

  const getStatusColor = () => {
    switch (projectData.status) {
      case 'active': return 'academic-status-active';
      case 'paused': return 'academic-status-pending';
      case 'completed': return 'academic-status-completed';
      default: return 'academic-status-pending';
    }
  };

  const getDaysUntilDeadline = () => {
    if (!projectData.targetDate) {
return null;
}
    const today = new Date();
    const target = new Date(projectData.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDeadline = getDaysUntilDeadline();
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0;

  return (
    <div
      className={`academic-project-card cursor-pointer transition-all hover:shadow-lg ${className}`}
      onClick={() => {
        onClick?.();
        onSelect?.(project);
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="academic-heading-section mb-0 line-clamp-1">
              {projectData.title}
            </h3>
            {projectData.isStarred && (
              <Star className="text-semantic-warning h-4 w-4 fill-current" />
            )}
          </div>

          {!compact && (
            <p className="academic-body-text text-academic-secondary mb-3 line-clamp-2 text-sm">
              {projectData.researchQuestion}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className={`academic-status-${projectData.status === 'active' ? 'active' : 'pending'}`}>
              {projectData.status}
            </span>
            <span className="text-academic-muted text-xs">
              {projectData.field}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOverdue && (
            <AlertTriangle className="text-semantic-error h-4 w-4" />
          )}
          {isUrgent && (
            <Clock className="text-semantic-warning h-4 w-4" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.(projectData.id);
            }}
            className="hover:bg-academic-primary rounded p-1"
          >
            <Star className={`h-4 w-4 ${projectData.isStarred ? 'text-semantic-warning fill-current' : 'text-academic-muted'}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="hover:bg-academic-primary rounded p-1"
          >
            <MoreHorizontal className="text-academic-muted h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhaseIcon className={`h-4 w-4 ${currentPhase.color}`} />
            <span className="text-academic-primary text-sm font-medium">
              {currentPhase.name}
            </span>
          </div>
          <span className="text-academic-muted text-sm">
            {projectData.progress}%
          </span>
        </div>

        <div className="progress-bar h-2">
          <div
            className={`progress-fill bg-academic-blue-600`}
            style={{ width: `${projectData.progress}%` }}
          />
        </div>
      </div>

      {/* Memory Hints */}
      {showMemoryHints && projectData.memoryContext && (
        <div className="bg-memory-purple mb-4 rounded-lg p-3">
          <div className="mb-2 flex items-center gap-2">
            <Brain className="text-memory-purple h-4 w-4" />
            <span className="text-memory-purple text-sm font-medium">
              Memory Context
            </span>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${
                projectData.memoryContext.confidence > 0.8 ? 'bg-semantic-success' :
                projectData.memoryContext.confidence > 0.6 ? 'bg-semantic-warning' : 'bg-semantic-error'
              }`} />
              <span className="text-academic-muted text-xs">
                {Math.round(projectData.memoryContext.confidence * 100)}%
              </span>
            </div>
          </div>

          <p className="text-academic-primary mb-2 text-xs">
            {projectData.memoryContext.lastSession}
          </p>

          {projectData.memoryContext.nextSteps.length > 0 && (
            <div className="flex items-center gap-1">
              <ArrowRight className="text-memory-purple h-3 w-3" />
              <span className="text-memory-purple text-xs">
                {projectData.memoryContext.nextSteps[0]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Project Meta */}
      <div className="text-academic-muted flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Started {projectData.startDate?.toLocaleDateString?.() || 'Unknown'}</span>
          </div>
          {projectData.collaborators > 1 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{projectData.collaborators} members</span>
            </div>
          )}
        </div>

        {daysUntilDeadline !== null && (
          <div className={`flex items-center gap-1 ${
            isOverdue ? 'text-semantic-error' :
            isUrgent ? 'text-semantic-warning' : 'text-academic-muted'
          }`}>
            <Clock className="h-3 w-3" />
            <span>
              {isOverdue
                ? `${Math.abs(daysUntilDeadline)} days overdue`
                : `${daysUntilDeadline} days left`
              }
            </span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-academic-primary mt-4 space-y-3 border-t pt-4">
          <div>
            <h4 className="text-academic-primary mb-2 text-sm font-medium">
              Research Question
            </h4>
            <p className="text-academic-secondary text-sm">
              {projectData.researchQuestion}
            </p>
          </div>

          {projectData.memoryContext?.insights && projectData.memoryContext.insights.length > 0 && (
            <div>
              <h4 className="text-academic-primary mb-2 text-sm font-medium">
                Recent Insights
              </h4>
              <div className="space-y-1">
                {projectData.memoryContext.insights.slice(0, 3).map((insight: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="bg-memory-purple mt-2 h-1.5 w-1.5 rounded-full" />
                    <span className="text-academic-secondary text-xs">
                      {insight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(projectData.id);
              }}
              className="academic-btn-outline flex-1 py-2 text-xs"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(project);
              }}
              className="academic-btn-primary flex-1 py-2 text-xs"
            >
              Continue Research
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;