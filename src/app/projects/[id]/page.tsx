'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock project data
  const projectData = {
    id: params.id,
    title: 'Sleep & Memory Study',
    question: 'How does sleep deprivation affect memory consolidation in undergraduate students compared to older adults?',
    phase: 'Literature Review',
    progress: {
      question: { status: 'completed', percentage: 100 },
      literature: { status: 'active', percentage: 65 },
      methodology: { status: 'pending', percentage: 0 },
      writing: { status: 'pending', percentage: 0 }
    },
    sources: [
      { name: 'Smith (2024)', type: 'pdf' },
      { name: 'Johnson et al. (2023)', type: 'pdf' },
      { name: 'Chen & Williams (2024)', type: 'pdf' },
      { name: 'Taylor Research (2023)', type: 'pdf' },
      { name: 'Brown Study (2024)', type: 'pdf' }
    ],
    documents: [
      { name: 'Lab_notes.pdf', size: '2.3 MB', type: 'pdf' },
      { name: 'Data.xlsx', size: '1.1 MB', type: 'excel' }
    ],
    memory: {
      lastSession: 'Last week you mentioned wanting to focus on undergraduate-specific studies. Your literature search strategy has been effective.',
      contextHints: [
        'Your question has evolved 3 times - good progress!',
        '2 methodology gaps identified from your sources',
        'Statistical power calculation needed for sample size',
        'Consider ethics approval timeline for your institution'
      ]
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Mock AI response (will be replaced with OpenAI)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I understand your question about " + message.toLowerCase() + ". Let me help you think through this systematically. What specific aspect would you like to explore first?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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