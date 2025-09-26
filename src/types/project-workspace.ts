/**
 * Project Workspace TypeScript Interfaces
 */

export interface ProjectWorkspaceData {
  project: ProjectDetails
  messages: ChatMessage[]
  documents: ProjectDocument[]
  memoryRecall: MemoryRecall
  contextHints: ContextHint[]
  progressIndicators: PhaseProgress[]
}

export interface ProjectDetails {
  id: string
  title: string
  researchQuestion: string
  subject: string
  subjectEmoji: string
  currentPhase: ResearchPhase
  sourceCount: number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export type ResearchPhase = 'question' | 'literature' | 'methodology' | 'writing'

export interface PhaseProgress {
  phase: ResearchPhase
  label: string
  isCompleted: boolean
  isActive: boolean
  completedAt?: Date
  description: string
  color: string
}

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isTyping?: boolean
  attachments?: MessageAttachment[]
  metadata?: {
    phase?: ResearchPhase
    confidence?: number
    sources?: string[]
  }
}

export interface MessageAttachment {
  id: string
  name: string
  type: 'image' | 'document' | 'link'
  url: string
  size?: number
}

export interface ProjectDocument {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'image' | 'other'
  size: number
  uploadedAt: Date
  url: string
  thumbnail?: string
}

export interface MemoryRecall {
  id: string
  projectId: string
  snippet: string
  context: string
  confidence: number
  lastUpdated: Date
  relatedPhase: ResearchPhase
}

export interface ContextHint {
  id: string
  text: string
  type: 'suggestion' | 'reminder' | 'insight' | 'warning'
  relevance: number
  phase: ResearchPhase
  icon?: string
}

export interface ChatInputState {
  message: string
  isTyping: boolean
  attachments: MessageAttachment[]
  isUploading: boolean
}

export interface SidebarState {
  isCollapsed: boolean
  activeSection: 'overview' | 'memory' | 'documents'
}

export interface WorkspaceSettings {
  showTimestamps: boolean
  autoScroll: boolean
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
  soundEnabled: boolean
}