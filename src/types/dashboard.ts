/**
 * Dashboard TypeScript Interfaces
 */

export interface University {
  id: string
  name: string
  domain: string
  logo?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  university?: University
}

export interface MemorySession {
  id: string
  projectId: string
  summary: string
  suggestedNextAction: string
  lastActivity: Date
  confidence: number
}

export interface Project {
  id: string
  title: string
  subject: string
  subjectEmoji: string
  currentPhase: 'question' | 'literature' | 'methodology' | 'writing' | 'export'
  progress: number
  dueDate?: Date
  nextSteps: string[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Activity {
  id: string
  projectId?: string
  projectTitle?: string
  type: 'created_project' | 'completed_phase' | 'added_source' | 'generated_content' | 'exported_document'
  description: string
  timestamp: Date
  icon?: string
}

export interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  onClick: () => void
  color: string
  description?: string
}

export interface DashboardData {
  user: User
  memorySession: MemorySession | null
  projects: Project[]
  recentActivities: Activity[]
  quickActions: QuickAction[]
  universities: University[]
}

export interface PhaseInfo {
  phase: Project['currentPhase']
  label: string
  color: string
  bgColor: string
  description: string
}