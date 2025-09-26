/**
 * Project Workspace Page
 * Main split-view workspace with sidebar and chat interface
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMediaQuery } from 'react-responsive'

// Import components
import ProjectHeader from '../../../../components/project-workspace/ProjectHeader'
import ProjectSidebar from '../../../../components/project-workspace/ProjectSidebar'
import ChatInterface from '../../../../components/project-workspace/ChatInterface'

// Import types
import {
  ProjectWorkspaceData,
  ProjectDetails,
  ChatMessage,
  MemoryRecall,
  ProjectDocument,
  PhaseProgress,
  ContextHint,
  MessageAttachment,
  SidebarState,
  ResearchPhase
} from '../../../../types/project-workspace'

export default function ProjectWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ maxWidth: 1024 })

  // State management
  const [workspaceData, setWorkspaceData] = useState<ProjectWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isCollapsed: isMobile,
    activeSection: 'overview'
  })
  const [isTyping, setIsTyping] = useState(false)

  // Load workspace data
  useEffect(() => {
    if (projectId) {
      fetchWorkspaceData()
    }
  }, [projectId])

  // Handle responsive sidebar
  useEffect(() => {
    setSidebarState(prev => ({
      ...prev,
      isCollapsed: isMobile
    }))
  }, [isMobile])

  const fetchWorkspaceData = async () => {
    try {
      // Fetch real project data from API
      const response = await fetch(`/api/projects`)
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      const projects = data.projects || []

      // Find the specific project by ID
      const project = projects.find((p: any) => p.id === projectId)
      if (!project) {
        throw new Error('Project not found')
      }

      // Extract project data with fallbacks for missing data
      const getProjectData = (project: any) => {
        const phase = project.current_phase || 'question'
        return {
          title: project.title || 'Research Project',
          researchQuestion: project.description || `What are the key research questions for ${project.title}?`,
          subject: project.subject || 'Research',
          subjectEmoji: project.subject_emoji || '📚',
          currentPhase: phase as 'question' | 'literature' | 'methodology' | 'writing',
          sourceCount: Math.floor(Math.random() * 20) + 5 // TODO: Get actual source count from database
        }
      }

      const projectData = getProjectData(project)

      const mockProject: ProjectDetails = {
        id: projectId,
        title: projectData.title,
        researchQuestion: projectData.researchQuestion,
        subject: projectData.subject,
        subjectEmoji: projectData.subjectEmoji,
        currentPhase: projectData.currentPhase,
        sourceCount: projectData.sourceCount,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        isActive: project.status === 'active'
      }

      // Generate memory recall data based on actual project
      const getMemoryRecallData = (project: any, currentPhase: string) => {
        const phaseContexts = {
          question: {
            snippet: `You were refining your research question about ${project.title.toLowerCase()}. You identified key variables and scope for your study.`,
            context: `Question formation phase for ${project.subject} research`,
            relatedPhase: 'question' as const
          },
          literature: {
            snippet: `You were conducting literature review for ${project.title}. Found several relevant studies in ${project.subject} that relate to your research focus.`,
            context: `Literature review phase focusing on ${project.subject} research`,
            relatedPhase: 'literature' as const
          },
          methodology: {
            snippet: `You were designing the methodology for ${project.title}. Identified appropriate research methods for your ${project.subject} study.`,
            context: `Methodology design phase for ${project.subject} research`,
            relatedPhase: 'methodology' as const
          },
          writing: {
            snippet: `You were working on writing up your ${project.title} research. Making progress on structuring your ${project.subject} paper.`,
            context: `Writing phase for ${project.subject} research paper`,
            relatedPhase: 'writing' as const
          }
        }

        return phaseContexts[currentPhase as keyof typeof phaseContexts] || phaseContexts.question
      }

      const memoryData = getMemoryRecallData(project, projectData.currentPhase)

      const mockMemoryRecall: MemoryRecall = {
        id: 'memory-1',
        projectId: projectId,
        snippet: memoryData.snippet,
        context: memoryData.context,
        confidence: 0.87,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        relatedPhase: memoryData.relatedPhase
      }

      const mockPhases: PhaseProgress[] = [
        {
          phase: 'question',
          label: 'Question Formation',
          isCompleted: true,
          isActive: false,
          completedAt: new Date('2024-01-20'),
          description: 'Define and refine research question',
          color: '#dc2626'
        },
        {
          phase: 'literature',
          label: 'Literature Review',
          isCompleted: true,
          isActive: false,
          completedAt: new Date('2024-02-15'),
          description: 'Review existing research and sources',
          color: '#d97706'
        },
        {
          phase: 'methodology',
          label: 'Methodology',
          isCompleted: false,
          isActive: true,
          description: 'Design research approach and methods',
          color: '#7c3aed'
        },
        {
          phase: 'writing',
          label: 'Academic Writing',
          isCompleted: false,
          isActive: false,
          description: 'Write and structure the research paper',
          color: '#2563eb'
        }
      ]

      // Generate context-aware mock messages based on actual project
      const generateMockMessages = (project: any): ChatMessage[] => {
        const projectTitle = project.title.toLowerCase()
        const subject = project.subject || 'research'

        if (projectTitle.includes('electrochemical') || projectTitle.includes('sensor')) {
          return [
            {
              id: 'msg-1',
              type: 'ai' as const,
              content: `I see you're working on ${project.title}. I notice you've uploaded several sources about electrochemical sensing techniques. Would you like me to help identify key performance parameters for your sensor design?`,
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
              metadata: {
                phase: projectData.currentPhase,
                confidence: 0.92,
                sources: ['Wang et al. (2024)', 'Electrochemical Methods']
              }
            },
            {
              id: 'msg-2',
              type: 'user' as const,
              content: 'Yes, I\'m particularly interested in sensitivity and selectivity optimization for my target analyte.',
              timestamp: new Date(Date.now() - 4 * 60 * 1000)
            },
            {
              id: 'msg-3',
              type: 'ai' as const,
              content: `Excellent focus! For electrochemical sensors, I recommend exploring surface modification techniques and electrode materials. Based on your ${subject} background, we could investigate nanostructured electrodes or enzymatic approaches...`,
              timestamp: new Date(Date.now() - 3 * 60 * 1000),
              metadata: {
                phase: projectData.currentPhase,
                confidence: 0.89,
                sources: ['Biosensors & Bioelectronics 2024']
              }
            }
          ]
        }

        // Generic fallback for other project types
        return [
          {
            id: 'msg-1',
            type: 'ai' as const,
            content: `I see you're working on ${project.title}. I notice you've uploaded several sources about ${subject}. How can I help you refine your research approach?`,
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            metadata: {
              phase: projectData.currentPhase,
              confidence: 0.88
            }
          },
          {
            id: 'msg-2',
            type: 'user' as const,
            content: 'I\'m looking to strengthen my literature review and identify any gaps in the current research.',
            timestamp: new Date(Date.now() - 4 * 60 * 1000)
          },
          {
            id: 'msg-3',
            type: 'ai' as const,
            content: `Perfect! Let's develop a systematic approach to your ${subject} research. Based on your project scope, I suggest we focus on recent developments and identify methodological opportunities...`,
            timestamp: new Date(Date.now() - 3 * 60 * 1000),
            metadata: {
              phase: projectData.currentPhase,
              confidence: 0.85
            }
          }
        ]
      }

      const mockMessages: ChatMessage[] = generateMockMessages(project)

      // Generate context-aware mock documents based on project type
      const generateMockDocuments = (project: any): ProjectDocument[] => {
        const projectTitle = project.title.toLowerCase()

        if (projectTitle.includes('electrochemical') || projectTitle.includes('sensor')) {
          return [
            {
              id: 'doc-1',
              name: 'Electrode_Fabrication_Protocol.pdf',
              type: 'pdf' as const,
              size: 1248576,
              uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              url: '/documents/electrode-protocol.pdf'
            },
            {
              id: 'doc-2',
              name: 'CV_Measurements.xlsx',
              type: 'xlsx' as const,
              size: 856432,
              uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              url: '/documents/cv-data.xlsx'
            },
            {
              id: 'doc-3',
              name: 'Literature_Review_Biosensors.docx',
              type: 'docx' as const,
              size: 2147483,
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              url: '/documents/biosensors-review.docx'
            }
          ]
        }

        // Generic fallback
        return [
          {
            id: 'doc-1',
            name: 'Research_Notes.pdf',
            type: 'pdf' as const,
            size: 1248576,
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            url: '/documents/research-notes.pdf'
          },
          {
            id: 'doc-2',
            name: 'Data_Analysis.xlsx',
            type: 'xlsx' as const,
            size: 856432,
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            url: '/documents/data-analysis.xlsx'
          }
        ]
      }

      const mockDocuments: ProjectDocument[] = generateMockDocuments(project)

      // Generate context-aware hints based on project type
      const generateMockContextHints = (project: any): ContextHint[] => {
        const projectTitle = project.title.toLowerCase()
        const currentPhase = projectData.currentPhase

        if (projectTitle.includes('electrochemical') || projectTitle.includes('sensor')) {
          return [
            {
              id: 'hint-1',
              text: 'Research question is well-defined for sensor development',
              type: 'insight' as const,
              relevance: 0.88,
              phase: 'question' as const
            },
            {
              id: 'hint-2',
              text: 'Consider electrode material selection for target analyte',
              type: 'reminder' as const,
              relevance: 0.93,
              phase: currentPhase
            },
            {
              id: 'hint-3',
              text: 'Sensitivity vs. selectivity trade-offs need addressing',
              type: 'warning' as const,
              relevance: 0.91,
              phase: 'methodology' as const
            },
            {
              id: 'hint-4',
              text: 'Review recent advances in nanostructured electrodes',
              type: 'insight' as const,
              relevance: 0.87,
              phase: 'literature' as const
            }
          ]
        }

        // Generic fallback hints
        return [
          {
            id: 'hint-1',
            text: 'Research question is taking good shape',
            type: 'insight' as const,
            relevance: 0.85,
            phase: 'question' as const
          },
          {
            id: 'hint-2',
            text: 'Consider expanding literature search scope',
            type: 'reminder' as const,
            relevance: 0.89,
            phase: currentPhase
          },
          {
            id: 'hint-3',
            text: 'Methodology needs more detail for reproducibility',
            type: 'warning' as const,
            relevance: 0.92,
            phase: 'methodology' as const
          }
        ]
      }

      const mockContextHints: ContextHint[] = generateMockContextHints(project)

      setWorkspaceData({
        project: mockProject,
        messages: mockMessages,
        documents: mockDocuments,
        memoryRecall: mockMemoryRecall,
        contextHints: mockContextHints,
        progressIndicators: mockPhases
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch workspace data:', error)
      setLoading(false)
    }
  }

  // Event handlers
  const handleBackToDashboard = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleToggleSidebar = useCallback(() => {
    setSidebarState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed
    }))
  }, [])

  const handleSendMessage = useCallback(async (content: string, attachments?: MessageAttachment[]) => {
    if (!workspaceData) return

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      attachments
    }

    setWorkspaceData(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    // Simulate AI typing
    setIsTyping(true)

    // Simulate AI response after delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        type: 'ai',
        content: `I understand you're asking about "${content.substring(0, 50)}...". Let me help you with that based on your current research phase and the context I have about your project.`,
        timestamp: new Date(),
        metadata: {
          phase: workspaceData.project.currentPhase,
          confidence: 0.85
        }
      }

      setWorkspaceData(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiResponse]
      } : null)
      setIsTyping(false)
    }, 2000)
  }, [workspaceData])

  const handleFileUpload = useCallback(async (file: File): Promise<MessageAttachment> => {
    // Simulate file upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `attachment-${Date.now()}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: URL.createObjectURL(file),
          size: file.size
        })
      }, 1000)
    })
  }, [])

  const handleDocumentUpload = useCallback((file: File) => {
    if (!workspaceData) return

    const newDocument: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() as ProjectDocument['type'],
      size: file.size,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file)
    }

    setWorkspaceData(prev => prev ? {
      ...prev,
      documents: [...prev.documents, newDocument]
    } : null)
  }, [workspaceData])

  const handleHintClick = useCallback((hint: ContextHint) => {
    // Handle hint interaction - could send as message or open relevant section
    handleSendMessage(`Tell me more about: ${hint.text}`)
  }, [handleSendMessage])

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your research workspace...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!workspaceData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be loaded.</p>
          <button
            onClick={handleBackToDashboard}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <ProjectHeader
        project={workspaceData.project}
        onBackToDashboard={handleBackToDashboard}
        onToggleSidebar={handleToggleSidebar}
        onSettings={() => router.push('/settings')}
        onShare={() => console.log('Share clicked')}
        onExport={() => console.log('Export clicked')}
        isSidebarCollapsed={sidebarState.isCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content - Fixed 25%/75% Split */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        height: '100%'
      }}>

        {/* Left Sidebar - Fixed 25% Width */}
        <div style={{
          width: '25%',
          minWidth: '300px',
          maxWidth: '400px',
          flexShrink: 0,
          display: isMobile && sidebarState.isCollapsed ? 'none' : 'block'
        }}>
          <ProjectSidebar
            project={workspaceData.project}
            memoryRecall={workspaceData.memoryRecall}
            documents={workspaceData.documents}
            phases={workspaceData.progressIndicators}
            sidebarState={sidebarState}
            onSidebarStateChange={(state) => setSidebarState(prev => ({ ...prev, ...state }))}
            onDocumentUpload={handleDocumentUpload}
            onDocumentClick={(doc) => window.open(doc.url, '_blank')}
            onDocumentDelete={(docId) => {
              setWorkspaceData(prev => prev ? {
                ...prev,
                documents: prev.documents.filter(d => d.id !== docId)
              } : null)
            }}
            onViewAllSources={() => router.push(`/projects/${projectId}/literature`)}
            className="h-full"
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {!sidebarState.isCollapsed && isMobile && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={handleToggleSidebar}
          />
        )}

        {/* Right Chat Area - Fixed 75% Width */}
        <div style={{
          width: '75%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          flex: isMobile && sidebarState.isCollapsed ? 1 : 'none'
        }}>
          <ChatInterface
            project={workspaceData.project}
            messages={workspaceData.messages}
            contextHints={workspaceData.contextHints}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            onMessageCopy={(content) => navigator.clipboard.writeText(content)}
            onMessageEdit={(messageId) => console.log('Edit message:', messageId)}
            onMessageDelete={(messageId) => {
              setWorkspaceData(prev => prev ? {
                ...prev,
                messages: prev.messages.filter(m => m.id !== messageId)
              } : null)
            }}
            onMessageFeedback={(messageId, type) => console.log('Feedback:', messageId, type)}
            onHintClick={handleHintClick}
            onDismissHint={(hintId) => {
              setWorkspaceData(prev => prev ? {
                ...prev,
                contextHints: prev.contextHints.filter(h => h.id !== hintId)
              } : null)
            }}
            onClearChat={() => {
              setWorkspaceData(prev => prev ? { ...prev, messages: [] } : null)
            }}
            onExportChat={() => console.log('Export chat')}
            isLoading={isTyping}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}