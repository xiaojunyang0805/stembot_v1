'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getProject } from '../../../lib/database/projects';
import { getProjectConversations, saveConversation, convertToMessages, deleteConversation } from '../../../lib/database/conversations';
import { validateConversationStorage } from '../../../lib/storage/validation';
import StorageIndicator from '../../../components/storage/StorageIndicator';
import { getProjectDocuments, saveDocumentMetadata, type DocumentMetadata } from '../../../lib/database/documents';
import type { Project } from '../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  conversationId?: string; // For tracking database conversations
}

export default function ProjectWorkspace({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const useEnhancedAI = true;
  const [isAITyping, setIsAITyping] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileAnalysisResult, setFileAnalysisResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await getProject(params.id);

        if (error) {
          console.error('Error fetching project:', error);
          setError('Failed to load project');
        } else if (data) {
          setProject(data);

          // Load conversation history
          const { data: conversations, error: convError } = await getProjectConversations(params.id);

          if (convError) {
            console.warn('Error loading conversations:', convError);
            // Set welcome message if no conversations could be loaded
            setMessages([
              {
                id: 'welcome-1',
                role: 'ai',
                content: `Welcome back to your project "${data.title}". I'm here to help you with your ${data.current_phase} phase. What would you like to work on today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          } else if (conversations && conversations.length > 0) {
            // Convert database conversations to messages format
            const loadedMessages = convertToMessages(conversations);
            setMessages(loadedMessages);
            console.log(`Loaded ${conversations.length} conversations (${loadedMessages.length} messages)`);
          } else {
            // No previous conversations - show welcome message
            setMessages([
              {
                id: 'welcome-1',
                role: 'ai',
                content: `Welcome to your project "${data.title}"! I'm here to help you with your ${data.current_phase} phase. What would you like to work on today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }

          // Load project documents
          const { data: projectDocuments, error: docsError } = await getProjectDocuments(params.id);
          if (docsError) {
            console.warn('Error loading documents:', docsError);
          } else if (projectDocuments) {
            setDocuments(projectDocuments);
            console.log(`Loaded ${projectDocuments.length} documents`);
          }

        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [user, params.id]);

  // Dynamic project data based on fetched project
  const projectData = project ? {
    id: project.id,
    title: project.title,
    question: project.research_question,
    phase: (() => {
      switch (project.current_phase) {
        case 'question': return 'Question Formation';
        case 'literature': return 'Literature Review';
        case 'methodology': return 'Methodology';
        case 'writing': return 'Academic Writing';
        default: return 'Active';
      }
    })(),
    progress: {
      question: {
        status: project.current_phase === 'question' ? 'active' :
                project.progress_data && (project.progress_data as any).question?.completed ? 'completed' : 'pending',
        percentage: project.progress_data ? (project.progress_data as any).question?.progress || 0 : 0
      },
      literature: {
        status: project.current_phase === 'literature' ? 'active' :
                project.progress_data && (project.progress_data as any).literature?.completed ? 'completed' : 'pending',
        percentage: project.progress_data ? (project.progress_data as any).literature?.progress || 0 : 0
      },
      methodology: {
        status: project.current_phase === 'methodology' ? 'active' :
                project.progress_data && (project.progress_data as any).methodology?.completed ? 'completed' : 'pending',
        percentage: project.progress_data ? (project.progress_data as any).methodology?.progress || 0 : 0
      },
      writing: {
        status: project.current_phase === 'writing' ? 'active' :
                project.progress_data && (project.progress_data as any).writing?.completed ? 'completed' : 'pending',
        percentage: project.progress_data ? (project.progress_data as any).writing?.progress || 0 : 0
      }
    },
    sources: [
      { name: 'Research sources will appear here', type: 'pdf' }
    ],
    documents: documents.map(doc => ({
      name: doc.original_name,
      size: `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`,
      type: doc.mime_type.split('/')[1] || 'file'
    })),
    memory: {
      lastSession: `Working on "${project.title}" - ${project.current_phase} phase`,
      contextHints: [
        `Current phase: ${project.current_phase}`,
        `Project created: ${new Date(project.created_at).toLocaleDateString()}`,
        `Subject: ${project.subject}`,
        'Continue your research with AI guidance'
      ]
    }
  } : null;

  const handleSendMessage = async () => {
    if (!message.trim() || isAITyping) return;

    // Pre-validate storage for conversation (estimate AI response size)
    const estimatedResponseLength = message.length * 3; // Rough estimate: AI response 3x user message
    const storageCheck = await validateConversationStorage(message.length, estimatedResponseLength);

    if (!storageCheck.canSave) {
      alert(`Storage limit reached: ${storageCheck.error}`);
      return;
    }

    if (storageCheck.warning) {
      console.warn('Storage warning:', storageCheck.warning);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage('');
    setIsAITyping(true);

    try {
      // Always use Enhanced AI (GPT-4o Mini with fallback to Ollama/Mock)
      const response = await fetch('/api/ai/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role === 'ai' ? 'assistant' : msg.role,
              content: msg.content
            })),
            { role: 'user', content: currentMessage }
          ],
          useEnhanced: true
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Format AI response with proper paragraph breaks
        const formattedContent = formatAIResponse(data.message.content);

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: formattedContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsAITyping(false);

        // Save conversation to database
        try {
          await saveConversation({
            projectId: params.id,
            userMessage: currentMessage,
            aiResponse: formattedContent,
            modelUsed: data.model || 'gpt-4o-mini',
            tokensUsed: data.usage?.total_tokens || 0,
            metadata: {
              enhanced: data.enhanced || false,
              fallback: data.fallback || null,
              timestamp: new Date().toISOString()
            }
          });
          console.log('Conversation saved to database');
        } catch (saveError) {
          console.warn('Failed to save conversation:', saveError);
        }
        return;
      }

      // Fallback to original mock behavior (preserves existing functionality)
      setTimeout(async () => {
        const aiResponseContent = "I understand your question about " + currentMessage.toLowerCase() + ". Let me help you think through this systematically. What specific aspect would you like to explore first?";
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: aiResponseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsAITyping(false);

        // Save fallback conversation to database
        try {
          await saveConversation({
            projectId: params.id,
            userMessage: currentMessage,
            aiResponse: aiResponseContent,
            modelUsed: 'fallback-mock',
            tokensUsed: 0,
            metadata: {
              enhanced: false,
              fallback: 'ollama-unavailable',
              timestamp: new Date().toISOString()
            }
          });
          console.log('Fallback conversation saved to database');
        } catch (saveError) {
          console.warn('Failed to save fallback conversation:', saveError);
        }
      }, 1000);

    } catch (error) {
      console.error('Enhanced AI error, falling back to mock:', error);

      // Always fallback to original mock behavior to prevent breaking anything
      setTimeout(async () => {
        const aiResponseContent = "I understand your question about " + currentMessage.toLowerCase() + ". Let me help you think through this systematically. What specific aspect would you like to explore first?";
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: aiResponseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsAITyping(false);

        // Save error fallback conversation to database
        try {
          await saveConversation({
            projectId: params.id,
            userMessage: currentMessage,
            aiResponse: aiResponseContent,
            modelUsed: 'error-fallback',
            tokensUsed: 0,
            metadata: {
              enhanced: false,
              fallback: 'api-error',
              timestamp: new Date().toISOString()
            }
          });
          console.log('Error fallback conversation saved to database');
        } catch (saveError) {
          console.warn('Failed to save error fallback conversation:', saveError);
        }
      }, 1000);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string, conversationId?: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      conversationId
        ? 'Delete this conversation? This will remove both the question and AI response permanently.'
        : 'Delete this message? This action cannot be undone.'
    );

    if (!confirmed) return;

    if (!conversationId) {
      // This is a new message not yet saved to database, just remove from UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return;
    }

    try {
      setDeletingMessageId(messageId);

      // Delete from database
      const { error } = await deleteConversation(conversationId);

      if (error) {
        console.error('Failed to delete conversation:', error);
        alert('Failed to delete message. Please try again.');
        return;
      }

      // Remove both user and AI messages for this conversation from UI
      setMessages(prev => prev.filter(msg => msg.conversationId !== conversationId));

      // Optional: Show success message
      console.log('Conversation deleted successfully');

    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    } finally {
      setDeletingMessageId(null);
    }
  };

  // Handle file upload and analysis
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      setFileAnalysisResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Save document metadata to database
        await saveDocumentMetadata({
          projectId: params.id,
          filename: result.fileInfo.name,
          originalName: result.fileInfo.name,
          fileSize: result.fileInfo.size,
          mimeType: result.fileInfo.type,
          extractedText: result.extractedText,
          analysisResult: result.analysis
        });

        // Refresh documents list
        const { data: updatedDocuments } = await getProjectDocuments(params.id);
        if (updatedDocuments) {
          setDocuments(updatedDocuments);
        }

        // Show analysis result
        setFileAnalysisResult(result);

        // Add upload result to chat conversation
        const uploadMessage: Message = {
          id: `upload-${Date.now()}`,
          role: 'ai',
          content: `📄 **Document uploaded successfully!**\n\n**File:** ${result.fileInfo.name}\n**Size:** ${result.fileInfo.sizeMB} MB\n\n**Analysis Summary:**\n${result.analysis.summary}\n\n**Key Points:**\n${result.analysis.keyPoints?.map((point: string) => `• ${point}`).join('\n') || 'Processing complete'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, uploadMessage]);

        console.log('File uploaded and analyzed successfully');
      } else {
        alert(`Upload failed: ${result.error}`);
      }

    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Function to format AI responses with proper paragraph breaks
  const formatAIResponse = (content: string): string => {
    return content
      // Add line breaks before numbered lists
      .replace(/(\d+\.\s)/g, '\n$1')
      // Add line breaks before bullet points
      .replace(/([•\-\*]\s)/g, '\n$1')
      // Add line breaks before headers (words in ALL CAPS followed by colon)
      .replace(/([A-Z\s]{3,}:)/g, '\n\n$1')
      // Add line breaks after question marks and periods when followed by capital letter
      .replace(/([.?!])\s*([A-Z])/g, '$1\n\n$2')
      // Clean up extra line breaks
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getPhaseIcon = (phase: string, status: string) => {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    if (isCompleted) return '◉';
    if (isActive) return '◉';
    return '◯';
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading project...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>
            {error}
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show nothing if project data isn't loaded yet
  if (!projectData) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                color: '#374151',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }}
            >
              ← Dashboard
            </button>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              {projectData.title}
            </h1>
          </div>

          {/* Simplified header - removed Share and Settings buttons for cleaner design */}
        </div>
      </header>

      {/* Project Progress Banner */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Project Progress
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { id: 'workspace', label: 'Workspace', path: `/projects/${params.id}`, progress: 85, active: true },
              { id: 'literature', label: 'Literature', path: `/projects/${params.id}/literature`, progress: 65, active: false },
              { id: 'methodology', label: 'Methodology', path: `/projects/${params.id}/methodology`, progress: 40, active: false },
              { id: 'writing', label: 'Writing', path: `/projects/${params.id}/writing`, progress: 15, active: false }
            ].map((section) => (
              <div
                key={section.id}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: section.active ? '#eff6ff' : 'transparent',
                  border: section.active ? '1px solid #3b82f6' : '1px solid transparent'
                }}
                onClick={() => section.active ? null : router.push(section.path)}
                onMouseEnter={(e) => {
                  if (!section.active) {
                    (e.target as HTMLDivElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!section.active) {
                    (e.target as HTMLDivElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: section.active ? '#3b82f6' : '#6b7280'
                  }}>
                    {section.label}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: section.active ? '#3b82f6' : '#9ca3af'
                  }}>
                    {section.progress}%
                  </span>
                </div>

                <div style={{
                  width: '100%',
                  height: '0.375rem',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '0.25rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${section.progress}%`,
                    height: '100%',
                    backgroundColor: section.active ? '#3b82f6' : '#10b981',
                    borderRadius: '0.25rem',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Left Sidebar (25% width) */}
        <div style={{
          width: isSidebarOpen ? '25%' : '0',
          minWidth: isSidebarOpen ? '300px' : '0',
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ padding: '1.5rem' }}>
            {/* Research Question */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0
                }}>
                  Question
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0
              }}>
                {projectData.question}
              </p>
            </div>

            {/* Sources */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>📚</span>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0
                  }}>
                    Sources ({projectData.sources.length})
                  </h3>
                </div>
                <button style={{
                  fontSize: '0.75rem',
                  color: '#3b82f6',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {projectData.sources.slice(0, 2).map((source, index) => (
                  <div key={index} style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    • {source.name}
                  </div>
                ))}
                {projectData.sources.length > 2 && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    ... and {projectData.sources.length - 2} more
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📊</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0
                }}>
                  Progress
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { phase: 'Question', data: projectData.progress.question },
                  { phase: 'Literature', data: projectData.progress.literature },
                  { phase: 'Methodology', data: projectData.progress.methodology },
                  { phase: 'Writing', data: projectData.progress.writing }
                ].map(({ phase, data }) => (
                  <div key={phase} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          color: data.status === 'completed' ? '#10b981' :
                                 data.status === 'active' ? '#3b82f6' : '#9ca3af',
                          fontSize: '0.875rem'
                        }}>
                          {getPhaseIcon(phase, data.status)}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: data.status === 'active' ? '#3b82f6' : '#6b7280',
                          fontWeight: data.status === 'active' ? '600' : '400'
                        }}>
                          {phase}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        fontWeight: '600'
                      }}>
                        {data.percentage}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${data.percentage}%`,
                        height: '100%',
                        backgroundColor: data.status === 'completed' ? '#10b981' :
                                         data.status === 'active' ? '#3b82f6' : '#9ca3af',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>💡</span>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0
                  }}>
                    Memory
                  </h3>
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                  {projectData.memory.lastSession}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📂</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0
                }}>
                  Documents
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {documents.length > 0 ? documents.map((doc, index) => (
                  <div key={doc.id} style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span>📄</span>
                    <span>{doc.original_name}</span>
                    <span style={{ color: '#9ca3af' }}>
                      ({(doc.file_size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                )) : (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    fontStyle: 'italic'
                  }}>
                    No documents uploaded yet
                  </div>
                )}

                {/* File Upload Input */}
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.tiff,.bmp,.webp"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="document-upload"
                  disabled={uploadingFile}
                />

                <label
                  htmlFor="document-upload"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: uploadingFile ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    cursor: uploadingFile ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    display: 'block'
                  }}
                >
                  {uploadingFile ? 'Uploading...' : 'Upload Document or Image'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Chat Area (75% width) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff'
        }}>
          {/* Chat Messages */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  position: 'relative',
                  maxWidth: '70%',
                  padding: '1rem',
                  borderRadius: '1rem',
                  backgroundColor: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
                  color: msg.role === 'user' ? 'white' : '#374151'
                }}
                onMouseEnter={(e) => {
                  const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                  if (deleteBtn) deleteBtn.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                  if (deleteBtn) deleteBtn.style.opacity = '0';
                }}
                >
                  {/* Delete Button */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMessage(msg.id, msg.conversationId)}
                    disabled={deletingMessageId === msg.id}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      opacity: '0',
                      transition: 'opacity 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete this message"
                  >
                    {deletingMessageId === msg.id ? '...' : '×'}
                  </button>

                  <div style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.content}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{msg.role === 'user' ? 'You' : 'AI'}</span>
                  <span>{msg.timestamp}</span>
                  {msg.conversationId && (
                    <span style={{ fontSize: '0.6875rem', opacity: 0.6 }}>
                      (saved)
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isAITyping && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '1rem',
                  borderRadius: '1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'typing 1.4s infinite ease-in-out'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'typing 1.4s infinite ease-in-out 0.2s'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'typing 1.4s infinite ease-in-out 0.4s'
                      }}></div>
                    </div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>AI</span>
                  <span>•••</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* CSS Animation for typing indicator */}
            <style jsx>{`
              @keyframes typing {
                0%, 60%, 100% {
                  transform: translateY(0);
                  opacity: 0.4;
                }
                30% {
                  transform: translateY(-10px);
                  opacity: 1;
                }
              }
            `}</style>
          </div>

          {/* Message Input */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff'
          }}>

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              {/* Hidden file input for chat uploads */}
              <input
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.tiff,.bmp,.webp"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="chat-file-upload"
                disabled={uploadingFile || isAITyping}
              />

              <button
                onClick={() => document.getElementById('chat-file-upload')?.click()}
                disabled={uploadingFile || isAITyping}
                style={{
                  padding: '0.75rem',
                  backgroundColor: uploadingFile ? '#e5e7eb' : '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: uploadingFile || isAITyping ? 'not-allowed' : 'pointer',
                  opacity: uploadingFile || isAITyping ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!uploadingFile && !isAITyping) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploadingFile && !isAITyping) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                📎
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isAITyping}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isAITyping ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: isAITyping ? 'not-allowed' : 'pointer',
                  opacity: isAITyping ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAITyping) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAITyping) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isAITyping ? 'AI Thinking...' : 'Send'}
              </button>
            </div>

            {/* Context Hints */}
            <div style={{
              backgroundColor: '#fefce8',
              border: '1px solid #fde047',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1rem' }}>💡</span>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: 0
                }}>
                  Context Hints
                </h4>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem'
              }}>
                {projectData.memory.contextHints.map((hint, index) => (
                  <div key={index} style={{
                    fontSize: '0.75rem',
                    color: '#92400e'
                  }}>
                    • {hint}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}