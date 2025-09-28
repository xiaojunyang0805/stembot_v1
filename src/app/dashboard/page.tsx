'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { getUserProjects } from '../../lib/database/projects';
import type { Project } from '../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        const { data, error } = await getUserProjects();
        if (error) {
          console.error('Error fetching projects:', error);
          // Fall back to mock data if there's an error
          setProjects([]);
        } else {
          setProjects(data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Mock data for professional UI (fallback when no projects exist)
  const mockProjects = [
    {
      id: '1',
      title: '📊 Sleep & Memory Study',
      phase: 'Literature Review',
      progress: 78,
      dueDate: 'Dec 15, 2025',
      nextStep: 'Find 3 more sources on undergraduates',
      subject: 'Psychology',
      emoji: '📊'
    },
    {
      id: '2',
      title: '⚗️ Buffer Chemistry Analysis',
      phase: 'Data Analysis',
      progress: 28,
      dueDate: 'Jan 30, 2026',
      nextStep: 'Statistical significance testing',
      subject: 'Chemistry',
      emoji: '⚗️'
    },
    {
      id: '3',
      title: '🧬 Protein Folding Mechanisms',
      phase: 'Question Formation',
      progress: 45,
      dueDate: 'Feb 14, 2026',
      nextStep: 'Refine research hypothesis',
      subject: 'Biochemistry',
      emoji: '🧬'
    }
  ];

  const mockMemory = {
    lastSession: "Refined sleep deprivation research question",
    suggestedAction: "Start literature review",
    confidence: 92
  };

  // User display name from email or fallback
  const userName = user?.email?.split('@')[0] || 'Research User';

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
      {/* Professional Header */}
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
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo and Title */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
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
              Research Mentor
            </div>
          </div>

          {/* University Selector */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <select style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              <option>TU Delft</option>
              <option>Stanford University</option>
              <option>MIT</option>
              <option>Cambridge</option>
            </select>
          </div>

          {/* User Profile Dropdown */}
          <div style={{position: 'relative'}}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                color: '#374151',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'; }}
            >
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
              <span>{userName}</span>
              <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>
                {showUserDropdown ? '▲' : '▼'}
              </span>
            </button>

            {showUserDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 50,
                minWidth: '180px'
              }}>
                <div style={{padding: '0.5rem'}}>
                  <div style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    User ID: {user?.id?.slice(0, 8) || 'guest'}...
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      router.push('/settings');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 0.5rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.25rem'
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'; }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    ⚙️ Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      router.push('/auth/logout');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 0.5rem',
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.25rem'
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2'; }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Welcome Message */}
        <div style={{marginBottom: '2rem'}}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {userName}! 👋
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280'
          }}>
            Ready to continue your research journey?
          </p>
        </div>

        {/* Memory Recall Section */}
        <div style={{
          backgroundColor: '#f0f8ff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{fontSize: '1.25rem'}}>🧠</span>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1e40af'
                }}>
                  Resume where you left off
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                marginBottom: '0.25rem'
              }}>
                Last session: "{mockMemory.lastSession}"
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                ⭐ Next suggested action: {mockMemory.suggestedAction}
              </p>
            </div>
            <button
              onClick={() => router.push('/projects/1')}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'; }}
            >
              Continue Research →
            </button>
          </div>
        </div>

        {/* Research Progress Overview */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Research Progress Overview
          </h2>
        </div>

        {/* Project Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {(projects.length > 0 ? projects : mockProjects).map((project) => (
            <div
              key={project.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  {('current_phase' in project) ? `${project.subject_emoji || '📊'} ${project.title}` : project.title}
                </h3>
                <span style={{
                  backgroundColor: (('current_phase' in project) ?
                    (project.current_phase === 'question' ? '#eff6ff' :
                     project.current_phase === 'literature' ? '#dbeafe' :
                     project.current_phase === 'methodology' ? '#f3e8ff' :
                     project.current_phase === 'writing' ? '#fef3c7' : '#f3f4f6') :
                    (project.phase === 'Literature Review' ? '#dbeafe' :
                     project.phase === 'Data Analysis' ? '#fef3c7' : '#f3e8ff')),
                  color: (('current_phase' in project) ?
                    (project.current_phase === 'question' ? '#2563eb' :
                     project.current_phase === 'literature' ? '#1e40af' :
                     project.current_phase === 'methodology' ? '#6b21a8' :
                     project.current_phase === 'writing' ? '#92400e' : '#6b7280') :
                    (project.phase === 'Literature Review' ? '#1e40af' :
                     project.phase === 'Data Analysis' ? '#92400e' : '#6b21a8')),
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {('current_phase' in project) ?
                    (project.current_phase === 'question' ? 'Question Formation' :
                     project.current_phase === 'literature' ? 'Literature Review' :
                     project.current_phase === 'methodology' ? 'Methodology' :
                     project.current_phase === 'writing' ? 'Academic Writing' : 'Active') :
                    project.phase}
                </span>
              </div>

              <div style={{marginBottom: '1rem'}}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    Progress
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {(() => {
                      if ('current_phase' in project && project.progress_data) {
                        const progressData = project.progress_data as any;
                        return progressData[project.current_phase]?.progress || 0;
                      }
                      return (project as any).progress || 0;
                    })()}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.25rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(() => {
                      if ('current_phase' in project && project.progress_data) {
                        const progressData = project.progress_data as any;
                        return progressData[project.current_phase]?.progress || 0;
                      }
                      return (project as any).progress || 0;
                    })()}%`,
                    height: '100%',
                    backgroundColor: (() => {
                      const progress = (() => {
                        if ('current_phase' in project && project.progress_data) {
                          const progressData = project.progress_data as any;
                          return progressData[project.current_phase]?.progress || 0;
                        }
                        return (project as any).progress || 0;
                      })();
                      return progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444';
                    })(),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.75rem'
              }}>
                Due: {(() => {
                  if ('due_date' in project && project.due_date) {
                    return new Date(project.due_date).toLocaleDateString();
                  }
                  return (project as any).dueDate || 'No due date';
                })()}
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#374151',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.25rem',
                borderLeft: '3px solid #2563eb'
              }}>
                🎯 Next: {(() => {
                  if ('current_phase' in project) {
                    switch (project.current_phase) {
                      case 'question': return 'Define your research question';
                      case 'literature': return 'Conduct literature review';
                      case 'methodology': return 'Design methodology';
                      case 'writing': return 'Write research paper';
                      default: return 'Continue research';
                    }
                  }
                  return (project as any).nextStep || 'Continue research';
                })()}
              </div>
            </div>
          ))}

          {/* Create New Project Card */}
          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '2px dashed #d1d5db',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2563eb';
              (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
            }}
            onClick={() => router.push('/projects/create')}
          >
            <div style={{
              fontSize: '3rem',
              color: '#9ca3af',
              marginBottom: '1rem'
            }}>
              ➕
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Start New Research Project
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Begin your research journey with AI-guided question formation
            </p>
          </div>
        </div>

        {/* Memory Insights */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            🧠 Memory Insights
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {/* Learning Patterns */}
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #fde047'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{fontSize: '1.25rem'}}>📈</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  Learning Pattern Detected
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#92400e',
                marginBottom: '0.75rem'
              }}>
                You tend to make breakthrough progress on literature reviews during morning sessions (9-11 AM).
              </p>
              <div style={{
                fontSize: '0.75rem',
                color: '#a16207',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span>⚡</span>
                <span>Confidence: 87%</span>
              </div>
            </div>

            {/* Research Momentum */}
            <div style={{
              backgroundColor: '#dcfce7',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{fontSize: '1.25rem'}}>🚀</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#166534'
                }}>
                  Research Momentum
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#166534',
                marginBottom: '0.75rem'
              }}>
                You've maintained consistent progress for 12 days. Your methodology planning momentum is accelerating.
              </p>
              <div style={{
                fontSize: '0.75rem',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span>🔥</span>
                <span>Streak: 12 days</span>
              </div>
            </div>

            {/* Smart Suggestions */}
            <div style={{
              backgroundColor: '#f3e8ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #d8b4fe'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{fontSize: '1.25rem'}}>💡</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#6b21a8'
                }}>
                  Smart Suggestion
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b21a8',
                marginBottom: '0.75rem'
              }}>
                Based on your recent literature gaps, consider exploring sleep intervention studies in educational psychology journals.
              </p>
              <button
                onClick={() => router.push('/projects/1/literature')}
                style={{
                  fontSize: '0.75rem',
                  color: '#7c3aed',
                  backgroundColor: 'white',
                  border: '1px solid #d8b4fe',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  cursor: 'pointer'
                }}
              >
                Explore Now →
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}