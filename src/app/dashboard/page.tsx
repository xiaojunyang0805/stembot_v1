'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Mock data for professional UI (no AI backend needed)
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

          {/* User Profile */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              {userName}
            </div>
            <button
              onClick={() => router.push('/auth/logout')}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'; }}
            >
              Sign Out
            </button>
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
          {mockProjects.map((project) => (
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
                  {project.title}
                </h3>
                <span style={{
                  backgroundColor: project.phase === 'Literature Review' ? '#dbeafe' :
                                   project.phase === 'Data Analysis' ? '#fef3c7' : '#f3e8ff',
                  color: project.phase === 'Literature Review' ? '#1e40af' :
                         project.phase === 'Data Analysis' ? '#92400e' : '#6b21a8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {project.phase}
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
                    {project.progress}%
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
                    width: `${project.progress}%`,
                    height: '100%',
                    backgroundColor: project.progress >= 70 ? '#10b981' :
                                     project.progress >= 40 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.75rem'
              }}>
                Due: {project.dueDate}
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#374151',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.25rem',
                borderLeft: '3px solid #2563eb'
              }}>
                🎯 Next: {project.nextStep}
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

        {/* Quick Actions */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/projects/1/literature')}
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
              📚 Upload Documents
            </button>
            <button
              onClick={() => router.push('/projects/1')}
              style={{
                backgroundColor: '#f97316',
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
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#f97316'; }}
            >
              💬 Ask Research Question
            </button>
            <button
              onClick={() => router.push('/projects/1/methodology')}
              style={{
                backgroundColor: '#10b981',
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
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#059669'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'; }}
            >
              📈 View Progress
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}