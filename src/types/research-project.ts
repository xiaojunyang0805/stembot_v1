// Mock research project types for UI-only components
export type ResearchStage =
  | 'question-formation'
  | 'literature-review'
  | 'methodology-design'
  | 'data-collection'
  | 'analysis'
  | 'writing'
  | 'review'
  | 'publication'
  | 'export'
  | 'completed'
  | 'archived';

export interface Milestone {
  id: string
  title: string
  completed: boolean
  due_date?: string
  stage?: ResearchStage
  dueDate?: Date
}

export interface ResearchProject {
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  created_at: string
  updated_at: string
  user_id: string
  phase: 'question-formation' | 'literature-review' | 'methodology' | 'data-collection' | 'analysis' | 'writing' | 'review' | 'final'
  research_question?: string
  methodology?: string
  progress: number | { overall: number }
  tags?: string[]
  collaborators?: string[]
  insights?: string[]
  milestones?: Milestone[]
  question?: {
    originalQuestion: string;
    refinedQuestion?: string;
  };
  field?: string;
  stage?: ResearchStage;
  createdAt?: Date;
  updatedAt?: Date;
  deadlines?: Array<{ dueDate: Date }>;
  collaboration?: {
    collaborators: Array<any>;
  };
  archivedAt?: Date;
  sessionHistory?: Array<{
    insights: string[];
    nextSteps: string[];
  }>;
}

export type ProjectPhase = ResearchProject['phase']
export type ProjectStatus = ResearchProject['status']

export interface ProjectMetrics {
  total_projects: number
  active_projects: number
  completed_projects: number
  avg_completion_time: number
  phase_distribution: Record<ProjectPhase, number>
}

export interface ProjectInsight {
  id: string
  project_id: string
  content: string
  type: 'observation' | 'hypothesis' | 'conclusion'
  created_at: string
}