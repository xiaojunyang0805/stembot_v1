'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface ResearchPhaseConfig {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface MemoryHint {
  id: string;
  title: string;
  content: string;
  type: 'suggestion' | 'reminder' | 'insight';
  confidence: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ResearchLayoutProps {
  children: ReactNode;
  currentPhase?: string;
  projectTitle?: string;
  projectId?: string;
  user?: User;
  memoryHints?: MemoryHint[];
  className?: string;
}

export default function ResearchLayout({
  children,
  currentPhase = 'dashboard',
  projectTitle = 'Research Project',
  projectId,
  user,
  memoryHints = [],
  className = ''
}: ResearchLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const researchPhases: ResearchPhaseConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/dashboard',
      description: 'Project overview and progress',
      status: 'completed'
    },
    {
      id: 'question',
      label: 'Question Formation',
      icon: '❓',
      path: projectId ? `/projects/${projectId}` : '/projects/1',
      description: 'Define your research question',
      status: currentPhase === 'question' ? 'active' : 'completed'
    },
    {
      id: 'literature',
      label: 'Literature Review',
      icon: '📚',
      path: projectId ? `/projects/${projectId}/literature` : '/projects/1/literature',
      description: 'Review existing research',
      status: currentPhase === 'literature' ? 'active' : currentPhase === 'question' ? 'pending' : 'completed'
    },
    {
      id: 'methodology',
      label: 'Methodology',
      icon: '🔬',
      path: projectId ? `/projects/${projectId}/methodology` : '/projects/1/methodology',
      description: 'Design your research approach',
      status: currentPhase === 'methodology' ? 'active' :
              ['dashboard', 'question', 'literature'].includes(currentPhase) ? 'pending' : 'completed'
    },
    {
      id: 'analysis',
      label: 'Data Analysis',
      icon: '📊',
      path: projectId ? `/projects/${projectId}/analysis` : '/projects/1/analysis',
      description: 'Analyze your findings',
      status: ['analysis'].includes(currentPhase) ? 'active' : 'pending'
    },
    {
      id: 'writing',
      label: 'Academic Writing',
      icon: '✍️',
      path: projectId ? `/projects/${projectId}/writing` : '/projects/1/writing',
      description: 'Write and refine your paper',
      status: ['writing'].includes(currentPhase) ? 'active' : 'pending'
    }
  ];

  const getStatusColor = (status: ResearchPhaseConfig['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'active': return '#2563eb';
      case 'pending': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getStatusIcon = (status: ResearchPhaseConfig['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Researcher';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Academic Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo and Navigation */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }}
            >
              <span style={{fontSize: '1rem'}}>
                {isSidebarOpen ? '◀' : '▶'}
              </span>
            </button>

            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb'
            }}>
              🧠 StemBot
            </div>

            <div style={{
              fontSize: '1rem',
              color: '#6b7280',
              borderLeft: '1px solid #d1d5db',
              paddingLeft: '1rem'
            }}>
              {projectTitle}
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            flex: 1,
            maxWidth: '400px',
            margin: '0 2rem'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project memory..."
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          {/* User Controls */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }}
            >
              💾 Save Progress
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem'
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: '500'
              }}>
                {userName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Collapsible Sidebar */}
        <aside style={{
          width: isSidebarOpen ? '280px' : '60px',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e5e7eb',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Research Phase Navigation */}
          <div style={{
            padding: isSidebarOpen ? '1.5rem' : '1rem 0.5rem',
            flex: 1
          }}>
            {isSidebarOpen && (
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Research Phases
              </h3>
            )}

            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {researchPhases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => router.push(phase.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isSidebarOpen ? '0.75rem' : '0',
                    padding: isSidebarOpen ? '0.75rem' : '0.75rem 0.5rem',
                    backgroundColor: currentPhase === phase.id ? '#eff6ff' : 'transparent',
                    border: currentPhase === phase.id ? '1px solid #bae6fd' : '1px solid transparent',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPhase !== phase.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPhase !== phase.id) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{fontSize: '1rem'}}>
                      {phase.icon}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: getStatusColor(phase.status)
                    }}>
                      {getStatusIcon(phase.status)}
                    </span>
                  </div>

                  {isSidebarOpen && (
                    <div style={{flex: 1}}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: currentPhase === phase.id ? '#1e40af' : '#374151',
                        marginBottom: '0.125rem'
                      }}>
                        {phase.label}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        lineHeight: '1.3'
                      }}>
                        {phase.description}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Memory Hints Panel */}
          {isSidebarOpen && memoryHints.length > 0 && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f3e8ff'
            }}>
              <h4 style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b21a8',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                🧠 Memory Hints
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {memoryHints.slice(0, 2).map((hint) => (
                  <div
                    key={hint.id}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '0.25rem',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: '#6b21a8',
                      marginBottom: '0.25rem'
                    }}>
                      {hint.title}
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      color: '#7c3aed',
                      lineHeight: '1.4'
                    }}>
                      {hint.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          backgroundColor: 'white',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}