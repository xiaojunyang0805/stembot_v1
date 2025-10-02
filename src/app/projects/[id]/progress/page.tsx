'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject } from '../../../../lib/database/projects';
import { getProjectDocuments, type DocumentMetadata } from '../../../../lib/database/documents';
import { trackProjectActivity } from '../../../../lib/database/activity';
import type { Project } from '../../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ProgressPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch project data
        const { data: projectData, error: projectError } = await getProject(params.id);
        if (projectError) {
          setError('Failed to load project');
          return;
        }
        setProject(projectData);

        // Track project activity for dashboard 'Continue Research'
        trackProjectActivity(params.id).catch(err => {
          console.warn('Failed to track project activity:', err);
        });

        // Fetch documents
        const { data: documentsData, error: docsError } = await getProjectDocuments(params.id);
        if (docsError) {
          console.warn('Error loading documents:', docsError);
        } else if (documentsData) {
          setDocuments(documentsData);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1rem',
        color: '#6b7280'
      }}>
        Loading project progress...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1rem',
        color: '#ef4444'
      }}>
        {error || 'Project not found'}
      </div>
    );
  }

  // Calculate progress metrics
  const progressMetrics = {
    workspace: {
      label: 'Workspace',
      description: 'Chat conversations and AI interactions',
      progress: 85,
      details: ['Active AI conversations', 'Research discussions', 'Planning sessions'],
      color: '#3b82f6'
    },
    documents: {
      label: 'Literature Review',
      description: 'Research papers and document analysis',
      progress: documents.length > 0 ? Math.min(75, documents.length * 15) : 10,
      details: [
        `${documents.length} document${documents.length === 1 ? '' : 's'} uploaded`,
        `${documents.filter(d => d.analysis_result).length} analyzed with AI`,
        'Literature review in progress'
      ],
      color: '#10b981'
    },
    methodology: {
      label: 'Methodology',
      description: 'Research methods and experimental design',
      progress: 40,
      details: ['Research approach defined', 'Methods selection ongoing', 'Protocol development needed'],
      color: '#f59e0b'
    },
    writing: {
      label: 'Writing',
      description: 'Manuscript and report preparation',
      progress: 15,
      details: ['Outline created', 'Introduction drafted', 'Main content pending'],
      color: '#8b5cf6'
    }
  };

  const overallProgress = Math.round(
    Object.values(progressMetrics).reduce((sum, metric) => sum + metric.progress, 0) / 4
  );

  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff' }}>
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
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              {project.research_question}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 140px)',
        maxWidth: '1400px',
        margin: '0 auto'
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
            {/* Navigation Menu */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 1rem 0'
              }}>
                Project Navigation
              </h3>

              {[
                { id: 'workspace', label: '💬 Workspace', path: `/projects/${params.id}`, active: false, icon: '💬' },
                { id: 'literature', label: '📚 Literature Review', path: `/projects/${params.id}/literature`, active: false, icon: '📚' },
                { id: 'methodology', label: '🔬 Methodology', path: `/projects/${params.id}/methodology`, active: false, icon: '🔬' },
                { id: 'writing', label: '✍️ Writing and Docs', path: `/projects/${params.id}/writing`, active: false, icon: '✍️' },
                { id: 'progress', label: '📊 Progress', path: `/projects/${params.id}/progress`, active: true, icon: '📊' },
                { id: 'settings', label: '⚙️ Project Settings', path: `/projects/${params.id}/settings`, active: false, icon: '⚙️' }
              ].map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => nav.active ? null : router.push(nav.path)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: nav.active ? '#eff6ff' : 'transparent',
                    color: nav.active ? '#3b82f6' : '#6b7280',
                    border: nav.active ? '1px solid #3b82f6' : '1px solid transparent',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: nav.active ? '600' : '500',
                    cursor: nav.active ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!nav.active) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!nav.active) {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{nav.icon}</span>
                  <span>{nav.label.replace(/^[^\s]+\s/, '')}</span>
                </button>
              ))}
            </div>

            {/* Project Info */}
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
                  <span style={{ fontSize: '1.25rem' }}>🎯</span>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0
                  }}>
                    Research Focus
                  </h3>
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                  {project.research_question}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area (75% width) */}
        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              📊 Project Progress
            </h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Overall Progress */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #3b82f6',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 0.5rem 0'
              }}>
                Overall Project Progress
              </h2>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                margin: '0.5rem 0'
              }}>
                {overallProgress}%
              </div>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                height: '1rem',
                backgroundColor: '#e2e8f0',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                margin: '1rem auto'
              }}>
                <div style={{
                  width: `${overallProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                  borderRadius: '0.5rem',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Detailed Progress by Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            {Object.entries(progressMetrics).map(([key, metric]) => (
              <div key={key} style={{
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '1rem',
                padding: '1.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLDivElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                (e.target as HTMLDivElement).style.borderColor = metric.color;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLDivElement).style.boxShadow = 'none';
                (e.target as HTMLDivElement).style.borderColor = '#e5e7eb';
              }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {metric.label}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {metric.description}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: metric.color
                  }}>
                    {metric.progress}%
                  </div>
                </div>

                <div style={{
                  width: '100%',
                  height: '0.5rem',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '0.25rem',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: `${metric.progress}%`,
                    height: '100%',
                    backgroundColor: metric.color,
                    borderRadius: '0.25rem',
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {metric.details.map((detail, index) => (
                    <li key={index} style={{
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      marginBottom: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: metric.color }}>•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Items */}
          <div style={{
            marginTop: '2rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#92400e',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎯 Recommended Next Steps
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                'Upload more research literature to Literature Review for comprehensive analysis',
                'Develop detailed methodology section with experimental protocols',
                'Begin drafting manuscript sections based on current research',
                'Schedule regular progress reviews and milestone checkpoints'
              ].map((action, index) => (
                <li key={index} style={{
                  fontSize: '0.875rem',
                  color: '#78350f',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: '#f59e0b', marginTop: '0.1rem' }}>▶</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}