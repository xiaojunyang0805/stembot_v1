'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject } from '../../../../lib/database/projects';
import { getProjectDocuments, type DocumentMetadata } from '../../../../lib/database/documents';
import { trackProjectActivity } from '../../../../lib/database/activity';
import { ProjectQuestionHeader } from '../../../../components/shared/ProjectQuestionHeader';
import { CitationDatabase } from '../../../../components/writing/CitationDatabase';
import type { Project } from '../../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function WritingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [outline, setOutline] = useState<any>(null);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [loadingOutline, setLoadingOutline] = useState(true);

  // Fetch project data and documents
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

        // Fetch existing outline
        const outlineResponse = await fetch(`/api/writing/get-outline?projectId=${params.id}`);
        if (outlineResponse.ok) {
          const outlineData = await outlineResponse.json();
          if (outlineData.outline) {
            setOutline(outlineData.outline.outline_data);
          }
        }
        setLoadingOutline(false);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
        setLoadingOutline(false);
      }
    };

    fetchData();
  }, [params.id, user]);

  // Generate outline
  const handleGenerateOutline = async () => {
    setGeneratingOutline(true);
    try {
      const response = await fetch('/api/writing/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: params.id })
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      setOutline(data.outline);
    } catch (err) {
      console.error('Error generating outline:', err);
      alert('Failed to generate outline. Please try again.');
    } finally {
      setGeneratingOutline(false);
    }
  };

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
        Loading project...
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
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              {project.title}
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
                { id: 'writing', label: '✍️ Writing and Docs', path: `/projects/${params.id}/writing`, active: true, icon: '✍️' },
                { id: 'progress', label: '📊 Progress', path: `/projects/${params.id}/progress`, active: false, icon: '📊' },
                { id: 'settings', label: '⚙️ Settings', path: `/projects/${params.id}/settings`, active: false, icon: '⚙️' }
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
                  Research Question
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0
              }}>
                {project.research_question}
              </p>
            </div>

            {/* Recent Documents */}
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
                  <span style={{ fontSize: '1.25rem' }}>📄</span>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0
                  }}>
                    Recent Documents ({documents.length})
                  </h3>
                </div>
                <button
                  onClick={() => router.push(`/projects/${params.id}/literature`)}
                  style={{
                    fontSize: '0.75rem',
                    color: '#3b82f6',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {documents.length > 0 ? documents.slice(0, 3).map((doc, index) => (
                  <div key={doc.id} style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLDivElement).style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLDivElement).style.backgroundColor = 'transparent';
                  }}
                  >
                    <span>📄</span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {doc.original_name}
                    </span>
                  </div>
                )) : (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '1rem 0'
                  }}>
                    No documents uploaded yet.
                    Use 📎 in Workspace to upload files.
                  </div>
                )}
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
              ✍️ Academic Writing
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

          {/* Research Question Header */}
          {project && (
            <ProjectQuestionHeader
              question={project.research_question || project.title}
              currentPhase="writing"
              projectTitle={project.title}
              onEdit={() => router.push(`/projects/${params.id}`)}
            />
          )}

          {/* Citation Database */}
          <div style={{ marginBottom: '2rem' }}>
            <CitationDatabase projectId={params.id} />
          </div>

          {/* Paper Outline Section */}
          {!loadingOutline && !outline && (
            <div style={{
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              borderRadius: '0.5rem',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '1rem'
              }}>
                📝 Generate Your Paper Outline
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#1e40af',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                maxWidth: '600px',
                margin: '0 auto 1.5rem auto'
              }}>
                Get started with a structured outline based on your research question,
                literature sources, and methodology.
              </p>
              <button
                onClick={handleGenerateOutline}
                disabled={generatingOutline}
                style={{
                  backgroundColor: generatingOutline ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: generatingOutline ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!generatingOutline) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!generatingOutline) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {generatingOutline ? 'Generating Outline...' : 'Generate Paper Outline'}
              </button>
            </div>
          )}

          {/* Display Generated Outline */}
          {outline && (
            <div style={{
              backgroundColor: 'white',
              border: '2px solid #10b981',
              borderRadius: '0.5rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#047857'
                }}>
                  📋 Your Paper Outline
                </h2>
                <button
                  onClick={handleGenerateOutline}
                  disabled={generatingOutline}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #10b981',
                    color: '#047857',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {generatingOutline ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>

              {/* Research Question */}
              {outline.researchQuestion && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#047857',
                    marginBottom: '0.5rem'
                  }}>
                    Research Question:
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#065f46',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {outline.researchQuestion}
                  </p>
                </div>
              )}

              {/* Outline Sections */}
              {outline.sections && outline.sections.map((section: any, index: number) => (
                <div key={index} style={{
                  marginBottom: '1.5rem',
                  paddingBottom: '1.5rem',
                  borderBottom: index < outline.sections.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {section.title}
                    </h3>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      ({section.wordTarget} words target)
                    </span>
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    listStyleType: 'disc'
                  }}>
                    {section.keyPoints && section.keyPoints.map((point: string, pointIndex: number) => (
                      <li key={pointIndex} style={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        lineHeight: '1.6',
                        marginBottom: '0.5rem'
                      }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Start Writing Button */}
              <div style={{
                marginTop: '2rem',
                textAlign: 'center'
              }}>
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
                  }}
                >
                  Start Writing
                </button>
              </div>
            </div>
          )}

          {/* Writing Content */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '2rem'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#374151'
              }}>
                Academic Writing Center
              </h2>
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                AI-powered academic writing support with citations from your literature review.
                Writing insights and research findings are automatically organized for your manuscript.
              </p>
            </div>

            {/* Writing Structure Sections */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📝</span> Introduction
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Background information, research gaps, and objectives discussed
                  in your conversations will be organized here.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📊</span> Results
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Research findings, statistical results, and data interpretations
                  will be automatically captured from your discussions.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>💬</span> Discussion
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Interpretations, implications, and connections to existing literature
                  from your conversations will appear here.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔚</span> Conclusion
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Key takeaways, limitations, and future directions discussed
                  in chat will be compiled here.
                </p>
              </div>
            </div>

            {/* Smart Memory Feature Preview */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginTop: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🧠</span> Smart Writing Integration
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                lineHeight: '1.5',
                margin: 0
              }}>
                <strong>Coming soon:</strong> When you discuss research findings, interpretations,
                or writing ideas in the Workspace chat, AI will automatically extract and organize
                them into the appropriate sections above. This creates a living manuscript that
                evolves with your research conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}