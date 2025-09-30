'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject } from '../../../../lib/database/projects';
import { getProjectDocuments, deleteDocument, type DocumentMetadata } from '../../../../lib/database/documents';
import { trackProjectActivity } from '../../../../lib/database/activity';
import type { Project } from '../../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DocCenterPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Toggle card expansion
  const toggleCardExpansion = (docId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

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

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user]);

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingDoc(docId);
    try {
      const { error } = await deleteDocument(docId);
      if (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      } else {
        // Remove from local state
        setDocuments(docs => docs.filter(doc => doc.id !== docId));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    } finally {
      setDeletingDoc(null);
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
                { id: 'documents', label: '📚 Document Center', path: `/projects/${params.id}/literature`, active: true, icon: '📚' },
                { id: 'methodology', label: '🔬 Methodology', path: `/projects/${params.id}/methodology`, active: false, icon: '🔬' },
                { id: 'writing', label: '✍️ Writing', path: `/projects/${params.id}/writing`, active: false, icon: '✍️' }
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
                    Documents ({documents.length})
                  </h3>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {documents.length > 0 ? documents.slice(0, 5).map((doc, index) => (
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
                    Go to Workspace to upload files.
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
              📚 Document Center
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

          {/* Document Management Content */}
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
                Comprehensive Document Management
              </h2>
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                This page will become your central hub for managing all project documents,
                AI-suggested literature, analysis results, and research organization.
              </p>
            </div>

            {/* Documents Grid */}
            {documents.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
              }}>
                {documents.map((doc) => {
                  const analysis = doc.analysis_result as any;
                  return (
                    <div key={doc.id} style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      {/* Document Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          flex: 1
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>📄</span>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: '#111827',
                              margin: '0 0 0.5rem 0',
                              lineHeight: '1.4'
                            }}>
                              {doc.original_name}
                            </h3>
                            <div style={{
                              display: 'flex',
                              gap: '1rem',
                              fontSize: '0.875rem',
                              color: '#6b7280'
                            }}>
                              <span>{(doc.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                              <span>•</span>
                              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                          disabled={deletingDoc === doc.id}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: deletingDoc === doc.id ? '#f3f4f6' : '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.375rem',
                            color: deletingDoc === doc.id ? '#9ca3af' : '#dc2626',
                            fontSize: '0.875rem',
                            cursor: deletingDoc === doc.id ? 'not-allowed' : 'pointer',
                            opacity: deletingDoc === doc.id ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (deletingDoc !== doc.id) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#fecaca';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (deletingDoc !== doc.id) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#fee2e2';
                            }
                          }}
                        >
                          {deletingDoc === doc.id ? '🔄' : '🗑️'}
                        </button>
                      </div>

                      {/* AI Analysis Section */}
                      {analysis ? (
                        <div style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          padding: '1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.75rem'
                          }}>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#1e293b',
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              🤖 AI Analysis
                            </h4>
                            <button
                              onClick={() => toggleCardExpansion(doc.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#e2e8f0',
                                border: '1px solid #cbd5e0',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                color: '#4a5568',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#cbd5e0';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#e2e8f0';
                              }}
                            >
                              {expandedCards.has(doc.id) ? '▲ Collapse' : '▼ Expand'}
                            </button>
                          </div>

                          {/* Always show document type */}
                          {analysis.documentType && (
                            <div style={{
                              display: 'inline-block',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              marginBottom: '0.75rem'
                            }}>
                              {analysis.documentType}
                            </div>
                          )}

                          {/* Expandable detailed content */}
                          {expandedCards.has(doc.id) ? (
                            <>
                              {/* Full Summary */}
                              {analysis.summary && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                  <p style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '900',
                                    color: '#000000',
                                    margin: '0 0 0.5rem 0',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    textDecoration: 'none'
                                  }}>
                                    Summary:
                                  </p>
                                  <p style={{
                                    fontSize: '0.875rem',
                                    color: '#475569',
                                    lineHeight: '1.5',
                                    margin: 0
                                  }}>
                                    {typeof analysis.summary === 'string' ? analysis.summary : 'Analysis completed'}
                                  </p>
                                </div>
                              )}

                              {/* Key Points */}
                              {analysis.keyPoints && Array.isArray(analysis.keyPoints) && analysis.keyPoints.length > 0 && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                  <p style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '900',
                                    color: '#000000',
                                    margin: '0 0 0.5rem 0',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    textDecoration: 'none'
                                  }}>
                                    Key Points:
                                  </p>
                                  <ul style={{
                                    fontSize: '0.75rem',
                                    color: '#475569',
                                    margin: 0,
                                    paddingLeft: '1rem'
                                  }}>
                                    {analysis.keyPoints.slice(0, 3).map((point: string, index: number) => (
                                      <li key={index} style={{ margin: '0.25rem 0' }}>
                                        {typeof point === 'string' ? point : 'Key insight identified'}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : (
                            /* Collapsed summary - just first 100 characters */
                            analysis.summary && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  lineHeight: '1.4',
                                  margin: 0
                                }}>
                                  {typeof analysis.summary === 'string'
                                    ? analysis.summary.length > 100
                                      ? analysis.summary.substring(0, 100) + '...'
                                      : analysis.summary
                                    : 'Analysis completed'
                                  }
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fcd34d',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          textAlign: 'center'
                        }}>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#92400e',
                            margin: 0
                          }}>
                            ⚠️ No AI analysis available for this document
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {documents.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '4rem',
                color: '#9ca3af'
              }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>📚</span>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: '#374151'
                }}>
                  No documents uploaded yet
                </p>
                <p style={{
                  fontSize: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  Upload your first research document to get AI-powered analysis
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Upload documents using the 📋 button in the Workspace chat
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}