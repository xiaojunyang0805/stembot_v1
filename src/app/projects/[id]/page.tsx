'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getProject } from '../../../lib/database/projects';
import type { Project } from '../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export default function ProjectWorkspace({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "I see you've uploaded 5 sources about sleep and memory. I notice most focus on adults 25+. Should we explore undergraduate-specific studies?",
      timestamp: '2:34 PM'
    },
    {
      id: '2',
      role: 'user',
      content: "Yes, that's exactly what I was thinking. I found some gaps in the undergraduate research area.",
      timestamp: '2:35 PM'
    },
    {
      id: '3',
      role: 'ai',
      content: "Perfect! Let's plan a survey methodology. Based on your timeline and resources, I suggest starting with a pilot study of 30-50 undergraduate students to test your sleep assessment questionnaire before scaling up.",
      timestamp: '2:35 PM'
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [useEnhancedAI, setUseEnhancedAI] = useState(false);
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
          // Update initial messages with project-specific content
          setMessages([
            {
              id: '1',
              role: 'ai',
              content: `Welcome back to your project "${data.title}". I'm here to help you with your ${data.current_phase} phase. What would you like to work on today?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
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
    documents: [
      { name: 'Project documents will appear here', size: '0 MB', type: 'pdf' }
    ],
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
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage('');

    try {
      // Use enhanced chat route if toggle is enabled, otherwise use original mock behavior
      if (useEnhancedAI) {
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
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: data.message.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiResponse]);
          return;
        }
      }

      // Fallback to original mock behavior (preserves existing functionality)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: "I understand your question about " + currentMessage.toLowerCase() + ". Let me help you think through this systematically. What specific aspect would you like to explore first?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);

    } catch (error) {
      console.error('Enhanced AI error, falling back to mock:', error);

      // Always fallback to original mock behavior to prevent breaking anything
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: "I understand your question about " + currentMessage.toLowerCase() + ". Let me help you think through this systematically. What specific aspect would you like to explore first?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
              }}
            >
              Share
            </button>
            <button
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Banner */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '0.5rem'
        }}>
          {[
            { id: 'workspace', label: 'Workspace', path: `/projects/${params.id}`, active: true },
            { id: 'literature', label: 'Literature Review', path: `/projects/${params.id}/literature`, active: false },
            { id: 'methodology', label: 'Methodology', path: `/projects/${params.id}/methodology`, active: false },
            { id: 'writing', label: 'Academic Writing', path: `/projects/${params.id}/writing`, active: false }
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => nav.active ? null : router.push(nav.path)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: nav.active ? '#2563eb' : 'white',
                color: nav.active ? 'white' : '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: nav.active ? 'default' : 'pointer',
                opacity: nav.active ? 1 : 0.8
              }}
              onMouseEnter={(e) => {
                if (!nav.active) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!nav.active) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }
              }}
            >
              {nav.label}
            </button>
          ))}
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
                {projectData.documents.map((doc, index) => (
                  <div key={index} style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    • {doc.name}
                  </div>
                ))}
                <button style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}>
                  Upload More
                </button>
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
                  maxWidth: '70%',
                  padding: '1rem',
                  borderRadius: '1rem',
                  backgroundColor: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
                  color: msg.role === 'user' ? 'white' : '#374151'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                  </p>
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff'
          }}>
            {/* Enhanced AI Toggle - Minimal UI Addition */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>🤖</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Enhanced AI {useEnhancedAI ? '(GPT-5 nano)' : '(Mock Responses)'}
                </span>
              </div>
              <button
                onClick={() => setUseEnhancedAI(!useEnhancedAI)}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: useEnhancedAI ? '#3b82f6' : '#e5e7eb',
                  color: useEnhancedAI ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {useEnhancedAI ? 'ON' : 'OFF'}
              </button>
            </div>

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
              <button
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                📎
              </button>
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                }}
              >
                Send
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