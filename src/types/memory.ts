/**
 * Memory System Types
 * Defines interfaces for persistent project memory and context management
 */

export interface MemoryContext {
  id: string
  projectId: string

  // Core memory components
  factualMemory: FactualMemory[]
  proceduralMemory: ProceduralMemory[]
  contextualMemory: ContextualMemory[]

  // Memory metadata
  createdAt: Date
  updatedAt: Date
  totalMemories: number
  activeMemories: number
}

export interface FactualMemory {
  id: string
  content: string
  source: string
  reliability: number
  createdAt: Date
  tags: string[]
  embedding?: number[]
  verified: boolean
}

export interface ProceduralMemory {
  id: string
  procedure: string
  steps: string[]
  outcomes: string[]
  context: string
  effectiveness: number
  createdAt: Date
  lastUsed?: Date
}

export interface ContextualMemory {
  id: string
  context: string
  relevantFacts: string[]
  associations: string[]
  importance: number
  createdAt: Date
}

// Additional interfaces for component compatibility
export interface MemoryItem {
  id: string;
  type: 'factual' | 'procedural' | 'contextual';
  content: string;
  tags: string[];
  importance: number;
  confidence: number;
  source: string;
  createdAt: Date;
  lastAccessed?: Date;
}

export interface MemoryCluster {
  id: string;
  theme: string;
  description?: string;
  memories: MemoryItem[];
  coherence: number;
  insights: string[];
  createdAt: Date;
}

export interface MemorySearchFilters {
  types?: MemoryItem['type'][];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minImportance?: number;
  minConfidence?: number;
  importanceRange?: {
    min: number;
    max: number;
  };
  sources?: string[];
}

export interface MemoryTimelineEntry {
  id: string;
  timestamp: Date;
  event: string;
  memories: MemoryItem[];
  insights: string[];
  context: string;
  // Additional properties for timeline visualization
  date?: Date;
  totalMemories?: number;
  averageImportance?: number;
  types?: string[];
  milestone?: any; // Will be typed more specifically later
}

export interface TimelinePeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  entries: MemoryTimelineEntry[];
  summary: string;
  embedding?: number[]
}

export interface MemoryRecall {
  memories: (FactualMemory | ProceduralMemory | ContextualMemory)[]
  relevanceScores: number[]
  totalFound: number
  searchQuery: string
  searchContext: string
}

export interface MemoryEmbedding {
  id: string
  content: string
  embedding: number[]
  metadata: {
    type: 'factual' | 'procedural' | 'contextual'
    projectId: string
    stage: string
    importance: number
  }
  createdAt: Date
}

export interface SessionContinuity {
  id: string
  projectId: string
  lastSession: {
    endTime: Date
    stage: string
    lastActivity: string
    keyPoints: string[]
    pendingTasks: string[]
  }
  continuityPrompts: string[]
  contextSummary: string
  nextSteps: string[]
}

// Database table interfaces
export interface MemoryTable {
  id: string
  project_id: string
  memory_type: 'factual' | 'procedural' | 'contextual'
  content: string
  metadata: Record<string, any>
  embedding?: number[]
  created_at: string
  updated_at: string
}

export interface SessionRecord {
  id: string
  startTime: Date
  endTime?: Date
  stage: string
  activitiesCompleted: string[]
  keyInsights: string[]
  nextSteps: string[]
  memoryUpdates: string[]
}

export interface SessionTable {
  id: string
  project_id: string
  start_time: string
  end_time?: string
  stage: string
  activities: string[]
  insights: string[]
  next_steps: string[]
  created_at: string
}