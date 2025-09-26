/**
 * Research Project Types
 * Defines interfaces for university research project management
 */

import { LiteratureReview } from './literature'
import { MemoryContext, SessionRecord } from './memory'
import { Methodology } from './methodology'
import { WritingProgress } from './writing'

export interface ResearchProject {
  id: string
  title: string
  description: string
  field: ResearchField
  stage: ResearchStage
  createdAt: Date
  updatedAt: Date
  userId: string

  // Research components
  question?: ResearchQuestion
  literature?: LiteratureReview
  methodology?: Methodology
  writing?: WritingProgress

  // Project timeline
  milestones: ProjectMilestone[]
  deadlines: ProjectDeadline[]

  // Memory and continuity
  memoryContext: MemoryContext
  sessionHistory: SessionRecord[]
}

export interface ResearchQuestion {
  id: string
  originalQuestion: string
  refinedQuestion: string
  hypotheses: string[]
  objectives: string[]
  significance: string
  scope: string
  limitations: string[]
  refinementHistory: QuestionRefinement[]
}

export interface QuestionRefinement {
  id: string
  version: number
  question: string
  feedback: string
  timestamp: Date
  confidence: number
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  stage: ResearchStage
  completed: boolean
  completedAt?: Date
  dueDate?: Date
  dependencies: string[]
}

export interface ProjectDeadline {
  id: string
  title: string
  description: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  completed: boolean
}


export type ResearchField =
  | 'computer-science'
  | 'educational-technology'
  | 'engineering'
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'psychology'
  | 'economics'
  | 'sociology'
  | 'other'

export type ResearchStage =
  | 'question-formation'
  | 'literature-review'
  | 'methodology-design'
  | 'data-collection'
  | 'analysis'
  | 'writing'
  | 'review'
  | 'submission'
  | 'completed'

export type ProjectStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'

// Database table interfaces
export interface ResearchProjectTable {
  id: string
  title: string
  description: string
  field: ResearchField
  stage: ResearchStage
  status: ProjectStatus
  created_at: string
  updated_at: string
  user_id: string
  metadata: Record<string, any>
}