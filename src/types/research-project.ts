/**
 * Research Project Type Definitions
 *
 * Comprehensive TypeScript interfaces for research project management,
 * including project structure, milestones, deadlines, and memory integration.
 *
 * @location src/types/research-project.ts
 */

import { MemoryContext } from './memory';

/**
 * Research field categories
 */
export type ResearchField =
  | 'computer-science'
  | 'educational-technology'
  | 'engineering'
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'medicine'
  | 'psychology'
  | 'economics'
  | 'sociology'
  | 'education'
  | 'linguistics'
  | 'history'
  | 'philosophy'
  | 'environmental-science'
  | 'political-science'
  | 'anthropology'
  | 'other';

/**
 * Research project stages in the academic workflow
 */
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

/**
 * Project priority levels for task management
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Research methodology types
 */
export type MethodologyType =
  | 'quantitative'
  | 'qualitative'
  | 'mixed-methods'
  | 'experimental'
  | 'observational'
  | 'case-study'
  | 'survey'
  | 'interview'
  | 'ethnographic'
  | 'systematic-review'
  | 'meta-analysis'
  | 'theoretical';

/**
 * Research question refinement and management
 */
export interface ResearchQuestion {
  id: string;
  originalQuestion: string;
  refinedQuestion: string;
  hypotheses: string[];
  objectives: string[];
  significance: string;
  scope: 'narrow' | 'focused' | 'broad' | 'exploratory';
  limitations: string[];
  refinementHistory: QuestionRefinement[];
  keywords: string[];
  relatedQuestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question refinement tracking
 */
export interface QuestionRefinement {
  id: string;
  previousVersion: string;
  newVersion: string;
  rationale: string;
  aiSuggestions: string[];
  userFeedback?: string;
  timestamp: Date;
  refinementType: 'scope' | 'focus' | 'clarity' | 'feasibility' | 'originality';
}

/**
 * Project milestone with dependencies and progress tracking
 */
export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stage: ResearchStage;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  dependencies: string[]; // Milestone IDs
  deliverables: string[];
  estimatedHours?: number;
  actualHours?: number;
  priority: ProjectPriority;
  assignedTo?: string; // For collaborative projects
  notes?: string;
  aiSuggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project deadline with notifications and tracking
 */
export interface ProjectDeadline {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: Date;
  type: 'milestone' | 'conference' | 'submission' | 'defense' | 'other';
  priority: ProjectPriority;
  notificationDays: number[]; // Days before to send notifications
  completed: boolean;
  completedAt?: Date;
  relatedMilestoneId?: string;
  externalUrl?: string; // Link to conference, journal, etc.
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Research session tracking for continuous work
 */
export interface ResearchSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  stage: ResearchStage;
  activities: SessionActivity[];
  insights: string[];
  nextSteps: string[];
  aiInteractions: number;
  memoryUpdates: string[];
  productivity: 'low' | 'medium' | 'high';
  mood?: 'frustrated' | 'neutral' | 'motivated' | 'excited';
  notes?: string;
  createdAt: Date;
}

/**
 * Activities within a research session
 */
export interface SessionActivity {
  id: string;
  type: 'reading' | 'writing' | 'analysis' | 'planning' | 'discussion' | 'break';
  description: string;
  duration: number; // in minutes
  outcome?: string;
  resources?: string[]; // URLs, file paths, etc.
  timestamp: Date;
}

/**
 * Project collaboration and team management
 */
export interface ProjectCollaboration {
  id: string;
  projectId: string;
  collaborators: Collaborator[];
  permissions: CollaborationPermissions;
  invitations: ProjectInvitation[];
  sharedResources: string[];
  communicationLog: CommunicationEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual collaborator information
 */
export interface Collaborator {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'co-researcher' | 'advisor' | 'reviewer' | 'viewer';
  permissions: string[];
  invitedAt: Date;
  joinedAt?: Date;
  lastActive?: Date;
  contribution?: string;
}

/**
 * Collaboration permissions matrix
 */
export interface CollaborationPermissions {
  canEdit: boolean;
  canInvite: boolean;
  canExport: boolean;
  canDelete: boolean;
  canViewMemory: boolean;
  canEditMemory: boolean;
  canViewAnalytics: boolean;
  restrictedStages?: ResearchStage[];
}

/**
 * Project invitation system
 */
export interface ProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  role: Collaborator['role'];
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  sentBy: string;
  message?: string;
  createdAt: Date;
}

/**
 * Communication log for project discussions
 */
export interface CommunicationEntry {
  id: string;
  type: 'message' | 'comment' | 'suggestion' | 'review';
  author: string;
  content: string;
  references?: string[]; // IDs of referenced items
  attachments?: string[];
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
}

/**
 * Main research project interface
 */
export interface ResearchProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  field: ResearchField;
  stage: ResearchStage;
  priority: ProjectPriority;

  // Core research components
  question: ResearchQuestion;
  methodology?: MethodologyType;
  milestones: ProjectMilestone[];
  deadlines: ProjectDeadline[];

  // Progress tracking
  progress: {
    overall: number; // 0-100
    byStage: Record<ResearchStage, number>;
    milestoneCompletion: number;
    deadlineStatus: 'on-track' | 'at-risk' | 'overdue';
  };

  // Memory and AI integration
  memoryContext: MemoryContext;
  sessionHistory: ResearchSession[];
  aiPreferences?: {
    mentorStyle: 'supportive' | 'challenging' | 'analytical' | 'creative';
    feedbackFrequency: 'minimal' | 'moderate' | 'frequent';
    suggestionTypes: string[];
    memoryRetention: 'high' | 'medium' | 'low';
  };

  // Collaboration
  collaboration?: ProjectCollaboration;
  isPublic: boolean;
  sharedWith?: string[];

  // Metadata
  tags: string[];
  category?: string;
  fundingSource?: string;
  ethicsApproval?: {
    required: boolean;
    approved: boolean;
    approvalDate?: Date;
    irbNumber?: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  deletedAt?: Date;
}

/**
 * Project creation wizard data
 */
export interface ProjectWizardData {
  // Basic information
  title: string;
  description: string;
  field: ResearchField;
  category?: string;

  // Research question
  initialQuestion: string;
  objectives: string[];
  significance: string;

  // Planning
  timeframe?: string;
  methodology?: MethodologyType;
  expectedOutcomes?: string[];

  // Background
  priorKnowledge?: string;
  relatedWork?: string[];
  resources?: string[];

  // Collaboration
  collaborators?: string[];
  isPublic?: boolean;

  // AI preferences
  aiMentorStyle?: 'supportive' | 'challenging' | 'analytical' | 'creative';
  memoryRetention?: 'high' | 'medium' | 'low';
}

/**
 * Project filter and search options
 */
export interface ProjectFilters {
  stage?: ResearchStage[];
  field?: ResearchField[];
  priority?: ProjectPriority[];
  progress?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  hasDeadlines?: boolean;
  hasCollaborators?: boolean;
  searchQuery?: string;
}

/**
 * Project analytics and insights
 */
export interface ProjectAnalytics {
  projectId: string;
  timeSpent: {
    total: number; // in hours
    byStage: Record<ResearchStage, number>;
    byWeek: { week: string; hours: number }[];
  };
  productivity: {
    averageSessionLength: number;
    sessionsPerWeek: number;
    peakProductivityTime: string;
    productivityTrend: 'increasing' | 'stable' | 'decreasing';
  };
  aiUsage: {
    totalInteractions: number;
    averagePerSession: number;
    mostUsedFeatures: string[];
    satisfactionRating?: number;
  };
  milestoneMetrics: {
    onTimeCompletion: number;
    averageDelay: number; // in days
    overallProgress: number;
  };
  generatedAt: Date;
}

// Alias for component compatibility
export type ResearchAnalytics = ProjectAnalytics;

export interface ResearchInsight {
  id: string;
  projectId: string;
  type: 'pattern' | 'gap' | 'opportunity' | 'risk' | 'recommendation' | 'optimization' | 'methodology' | 'literature';
  category: 'methodology' | 'literature' | 'data' | 'timeline' | 'quality';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestions: string[];
  relatedStage?: ResearchStage;
  impact: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  relevantUntil?: Date;
}

/**
 * Export types for project data
 */
export type ProjectExportFormat = 'pdf' | 'docx' | 'latex' | 'markdown' | 'json' | 'csv';

export interface ProjectExportOptions {
  format: ProjectExportFormat;
  includeMemory: boolean;
  includeSessions: boolean;
  includeAnalytics: boolean;
  includeCollaboration: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  customSections?: string[];
}

/**
 * TODO: Additional interfaces to consider
 *
 * 1. Literature Management:
 *    - Citation tracking and management
 *    - Source reliability scoring
 *    - Reference network analysis
 *
 * 2. Data Collection:
 *    - Data source tracking
 *    - Collection method documentation
 *    - Data quality metrics
 *
 * 3. Writing Progress:
 *    - Document version control
 *    - Writing goal tracking
 *    - Collaboration on writing
 *
 * 4. Publication Pipeline:
 *    - Journal submission tracking
 *    - Peer review management
 *    - Publication metrics
 */