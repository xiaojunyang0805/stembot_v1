'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject } from '../../../../lib/database/projects';
import { getProjectDocuments, deleteDocument, type DocumentMetadata } from '../../../../lib/database/documents';
import { getProjectSources, saveSourceToProject, removeSourceFromProject, convertDatabaseSourceToSourceData } from '../../../../lib/database/sources';
import { convertDocumentToSource } from '../../../../lib/services/documentToSource';
import { trackProjectActivity } from '../../../../lib/database/activity';
import { ProjectQuestionHeader } from '../../../../components/shared/ProjectQuestionHeader';
import { SearchStrategyCard } from '../../../../components/literature/SearchStrategyCard';
import { SourceCard, SourceData } from '../../../../components/literature/SourceCard';
import { GapAnalysis } from '../../../../components/literature/GapAnalysis';
import { SourceOrganizationView } from '../../../../components/literature/SourceOrganizationView';
import { createSampleSources } from '../../../../lib/services/credibilityAssessment';
import { ProjectMemoryPanel } from '../../../../components/workspace/ProjectMemoryPanel';
import { analyzeQuestionProgressCached as analyzeQuestionProgress } from '../../../../lib/research/cachedQuestionAnalyzer';
import { UpgradePrompt } from '../../../../components/upgrade';
import { supabase } from '../../../../lib/supabase';
import type { Project } from '../../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface BillingData {
  subscription: {
    tier: string;
  };
  usage: {
    sources: {
      current: number;
      limit: number | null;
      percentage: number;
      unlimited: boolean;
    };
  };
}

export default function LiteratureReviewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [externalSources, setExternalSources] = useState<SourceData[]>([]);
  const [allSources, setAllSources] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'external' | 'uploaded' | 'high-quality'>('all');
  const [showSampleSources, setShowSampleSources] = useState(true);
  const [isLoadingMoreSources, setIsLoadingMoreSources] = useState(false);
  const [sourcesDisplayLimit, setSourcesDisplayLimit] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExpandedMode, setIsExpandedMode] = useState(false);
  const [billingData, setBillingData] = useState<BillingData | null>(null);

  // Helper function to format message content with bold text
  const formatMessageContent = (content: string): string => {
    return content
      // Convert **text** to <strong>text</strong> for bold formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert line breaks to HTML <br> tags for proper HTML rendering
      .replace(/\n/g, '<br>');
  };

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

  // Fetch project data, documents, and sources
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch project data
        const { data: projectData, error: projectError} = await getProject(params.id);
        if (projectError) {
          setError('Failed to load project');
          setLoading(false); // Ensure loading state is cleared
          return;
        }
        setProject(projectData);

        // Track project activity for dashboard 'Continue Research'
        trackProjectActivity(params.id).catch(err => {
          console.warn('Failed to track project activity:', err);
        });

        // Fetch documents, external sources, and billing data in parallel
        const [documentsResult, sourcesResult] = await Promise.all([
          getProjectDocuments(params.id),
          getProjectSources(params.id)
        ]);

        // Handle documents
        if (documentsResult.error) {
          console.warn('Error loading documents:', documentsResult.error);
        } else if (documentsResult.data) {
          setDocuments(documentsResult.data);
        }

        // Handle external sources
        let externalSourcesData: SourceData[] = [];
        if (sourcesResult.error) {
          console.warn('Error loading sources:', sourcesResult.error);
        } else if (sourcesResult.data) {
          externalSourcesData = sourcesResult.data.map(convertDatabaseSourceToSourceData);
        }

        // Add sample sources for demonstration if no real sources exist
        if (externalSourcesData.length === 0 && showSampleSources) {
          // Pass research field to generate topic-appropriate demo sources
          const metadata = projectData?.metadata as { field?: string } | undefined;
          const researchField = projectData?.subject || metadata?.field || '';
          externalSourcesData = createSampleSources(researchField);
        }

        setExternalSources(externalSourcesData);

        // Fetch billing data for upgrade prompts
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            const billingResponse = await fetch('/api/billing/status', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            if (billingResponse.ok) {
              const result = await billingResponse.json();
              setBillingData(result.data);
            }
          }
        } catch (billingError) {
          console.warn('Failed to fetch billing data:', billingError);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user, showSampleSources]);

  // Convert documents to sources and combine with external sources
  useEffect(() => {
    const combineAllSources = async () => {
      if (!project) return;

      try {
        // Convert documents to sources
        const documentSources = await Promise.all(
          documents.map(doc => convertDocumentToSource(doc, project.research_question || project.title))
        );

        // Combine all sources
        const combined = [...externalSources, ...documentSources];
        setAllSources(combined);

      } catch (error) {
        console.error('Error converting documents to sources:', error);
        setAllSources(externalSources); // Fallback to just external sources
      }
    };

    combineAllSources();
  }, [documents, externalSources, project]);

  // Handle source save/unsave
  const handleToggleSaved = async (sourceId: string, isSaved: boolean) => {
    try {
      const source = allSources.find(s => s.id === sourceId);
      if (!source) return;

      if (isSaved) {
        // Save source to project
        if (!source.isUploaded) {
          const { error } = await saveSourceToProject(params.id, source);
          if (error) {
            console.error('Error saving source:', error);
            alert('Failed to save source');
            return;
          }
        }
      } else {
        // Remove source from project
        if (!source.isUploaded) {
          const { error } = await removeSourceFromProject(params.id, sourceId);
          if (error) {
            console.error('Error removing source:', error);
            alert('Failed to remove source');
            return;
          }
        }
      }

      // Update local state
      setAllSources(prev => prev.map(s =>
        s.id === sourceId ? { ...s, isSaved } : s
      ));

      if (!source.isUploaded) {
        setExternalSources(prev => prev.map(s =>
          s.id === sourceId ? { ...s, isSaved } : s
        ));
      }

    } catch (error) {
      console.error('Error toggling source save state:', error);
      alert('Failed to update source');
    }
  };

  // Handle find sources from SearchStrategyCard
  const handleFindSources = () => {
    // For now, show external search links
    alert('🔍 External Search Links\n\nUse these databases to find more sources:\n\n• PubMed (https://pubmed.ncbi.nlm.nih.gov/)\n• Google Scholar (https://scholar.google.com/)\n• ScienceDirect (https://www.sciencedirect.com/)\n\nCopy and paste promising sources into the interface or upload PDFs to analyze them with AI.');
  };

  // Handle upload paper
  const handleUploadPaper = () => {
    // Navigate to workspace for document upload
    router.push(`/projects/${params.id}`);
  };

  // Handle document deletion
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

  // Filter sources based on active filter
  const getFilteredSources = () => {
    switch (activeFilter) {
      case 'external':
        return allSources.filter(s => !s.isUploaded);
      case 'uploaded':
        return allSources.filter(s => s.isUploaded);
      case 'high-quality':
        return allSources.filter(s => s.credibility.level === 'High');
      default:
        return allSources;
    }
  };

  const filteredSources = getFilteredSources();
  const displayedSources = filteredSources.slice(0, sourcesDisplayLimit);

  // Load more sources
  const handleLoadMoreSources = () => {
    setIsLoadingMoreSources(true);
    setTimeout(() => {
      setSourcesDisplayLimit(prev => prev + 5);
      setIsLoadingMoreSources(false);
    }, 500);
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

  // Project data for sidebar (similar to workspace page)
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
              {project.title}
            </h1>
          </div>
        </div>
      </header>

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
                { id: 'literature', label: '📚 Literature Review', path: `/projects/${params.id}/literature`, active: true, icon: '📚' },
                { id: 'methodology', label: '🔬 Methodology', path: `/projects/${params.id}/methodology`, active: false, icon: '🔬' },
                { id: 'writing', label: '✍️ Writing and Docs', path: `/projects/${params.id}/writing`, active: false, icon: '✍️' },
                { id: 'progress', label: '📊 Progress', path: `/projects/${params.id}/progress`, active: false, icon: '📊' },
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
                margin: 0,
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                {project?.research_question || 'No research question defined'}
              </p>
            </div>

            {/* Sources Summary */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📚</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0
                }}>
                  Literature Collection ({allSources.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <span>External Sources:</span>
                  <span>{allSources.filter(s => !s.isUploaded).length}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <span>Uploaded Documents:</span>
                  <span>{allSources.filter(s => s.isUploaded).length}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#22c55e',
                  fontWeight: '600'
                }}>
                  <span>High Quality:</span>
                  <span>{allSources.filter(s => s.credibility.level === 'High').length}</span>
                </div>
              </div>
            </div>

            {/* Question Evolution Memory Panel */}
            <div style={{ marginBottom: '2rem' }}>
              {(() => {
                // Calculate progress for memory panel
                const currentQuestion = project?.research_question || project?.title || "Research question not yet defined";
                const conversationCount = 0; // Not applicable for literature page
                const documentCount = documents.length;

                const progressAnalysis = analyzeQuestionProgress(
                  currentQuestion,
                  conversationCount,
                  documentCount,
                  []
                );

                const questionHistory: Array<{
                  id: string;
                  text: string;
                  stage: 'initial' | 'emerging' | 'focused' | 'research-ready';
                  createdAt: Date;
                  improvements: string[];
                }> = [
                  {
                    id: '1',
                    text: "Initial project setup",
                    stage: 'initial',
                    createdAt: new Date(project?.created_at || Date.now() - 7 * 24 * 60 * 60 * 1000),
                    improvements: []
                  }
                ];

                if (progressAnalysis.progress > 15) {
                  questionHistory.push({
                    id: '2',
                    text: currentQuestion,
                    stage: progressAnalysis.stage,
                    createdAt: new Date(project?.updated_at || Date.now()),
                    improvements: progressAnalysis.recommendations.slice(0, 2).map(rec =>
                      rec.replace(/^[A-Z]/, char => char.toLowerCase()).replace(/[.!?]$/, '')
                    )
                  });
                }

                return (
                  <ProjectMemoryPanel
                    currentQuestion={currentQuestion}
                    questionStage={progressAnalysis.stage}
                    questionHistory={questionHistory}
                  />
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Literature Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          width: isExpandedMode ? '100%' : 'auto'
        }}>
          {/* Content Header with Toggle and Expand Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1.5rem 0 1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0
              }}>
                📚 Literature Review
              </h1>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem'
              }}>
                {allSources.length} sources collected
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                title="Toggle Sidebar"
              >
                {isSidebarOpen ? '◀' : '▶'}
              </button>
              <button
                onClick={() => setIsExpandedMode(!isExpandedMode)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: isExpandedMode ? '#3b82f6' : '#f3f4f6',
                  color: isExpandedMode ? 'white' : '#374151',
                  border: '1px solid ' + (isExpandedMode ? '#3b82f6' : '#d1d5db'),
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                title="Full Width Mode"
              >
                {isExpandedMode ? '📖 Focused Mode' : '🔍 Expand View'}
              </button>
            </div>
          </div>

          {/* Main Literature Content */}
          <div style={{
            flex: 1,
            padding: '0 1.5rem 1.5rem 1.5rem',
            overflowY: 'auto'
          }}>
            {/* Research Question Header */}
            {project && (
              <div style={{ marginBottom: '2rem' }}>
                <ProjectQuestionHeader
                  question={project.research_question || project.title}
                  currentPhase="literature"
                  projectTitle={project.title}
                  onEdit={() => router.push(`/projects/${params.id}`)}
                />
              </div>
            )}

            {/* Search Strategy Section */}
            {project && (
              <div style={{ marginBottom: '3rem' }}>
                <SearchStrategyCard
                  projectId={params.id}
                  researchQuestion={project.research_question || project.title}
                  onFindSources={handleFindSources}
                  onUploadPaper={handleUploadPaper}
                />
              </div>
            )}

            {/* Literature Collection Section */}
            <div style={{ marginBottom: '3rem' }}>
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📖 Your Literature Collection
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    ({filteredSources.length} {activeFilter !== 'all' ? `${activeFilter} ` : ''}sources)
                  </span>
                </h2>

                {/* Sample Sources Toggle */}
                {externalSources.some(s => s.id.startsWith('source-')) && (
                  <button
                    onClick={() => setShowSampleSources(!showSampleSources)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: showSampleSources ? '#fef3c7' : '#f3f4f6',
                      color: showSampleSources ? '#a16207' : '#374151',
                      border: '1px solid ' + (showSampleSources ? '#fcd34d' : '#d1d5db'),
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {showSampleSources ? '🧪 Hide Demo Sources' : '🧪 Show Demo Sources'}
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
              }}>
                {[
                  { key: 'all', label: 'All Sources', count: allSources.length },
                  { key: 'external', label: 'External Sources', count: allSources.filter(s => !s.isUploaded).length },
                  { key: 'uploaded', label: 'Uploaded Documents', count: allSources.filter(s => s.isUploaded).length },
                  { key: 'high-quality', label: 'High Quality Only', count: allSources.filter(s => s.credibility.level === 'High').length }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as any)}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: activeFilter === filter.key ? '#eff6ff' : 'transparent',
                      color: activeFilter === filter.key ? '#1e40af' : '#6b7280',
                      border: activeFilter === filter.key ? '1px solid #3b82f6' : '1px solid transparent',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: activeFilter === filter.key ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilter !== filter.key) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilter !== filter.key) {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {/* Sources Display */}
              {filteredSources.length > 0 ? (
                <>
                  {/* Sources List */}
                  <div style={{ marginBottom: '2rem' }}>
                    {displayedSources.map((source) => (
                      <SourceCard
                        key={source.id}
                        source={source}
                        projectId={params.id}
                        onToggleSaved={handleToggleSaved}
                        onReadSummary={(sourceId) => {
                          alert(`Reading summary for: ${source.title}\n\nThis would open a detailed AI-generated summary of the research paper.`);
                        }}
                        onCheckQuality={(sourceId) => {
                          alert(`Quality assessment for: ${source.title}\n\nCredibility Level: ${source.credibility.level}\nScore: ${source.credibility.score}/100`);
                        }}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredSources.length > sourcesDisplayLimit && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <button
                        onClick={handleLoadMoreSources}
                        disabled={isLoadingMoreSources}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: isLoadingMoreSources ? '#f3f4f6' : '#3b82f6',
                          color: isLoadingMoreSources ? '#6b7280' : 'white',
                          border: '1px solid #3b82f6',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: isLoadingMoreSources ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isLoadingMoreSources ? '⏳ Loading...' : `📚 Load More Sources (${filteredSources.length - sourcesDisplayLimit} remaining)`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '3rem 2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem'
                  }}>
                    No {activeFilter !== 'all' ? activeFilter + ' ' : ''}sources yet
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem',
                    maxWidth: '500px',
                    margin: '0 auto 1.5rem auto'
                  }}>
                    Start building your literature collection by searching external databases or uploading research papers for AI analysis.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      onClick={handleFindSources}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: '1px solid #3b82f6',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Find External Sources
                    </button>
                    <button
                      onClick={handleUploadPaper}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: '1px solid #10b981',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      📄 Upload Papers
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Gap Analysis Section */}
            {project && (
              <GapAnalysis
                sources={allSources}
                researchQuestion={project.research_question || project.title}
                projectId={params.id}
              />
            )}

            {/* Upgrade Prompt for Advanced Gap Analysis Features */}
            {billingData && billingData.subscription.tier === 'free' && allSources.length > 3 && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <UpgradePrompt
                  variant="card"
                  location="literature_review_gap_analysis"
                  title="Unlock Advanced Gap Analysis"
                  message="Get deeper insights with AI-powered gap analysis for 5+ sources, including cross-source synthesis, methodological recommendations, and priority-ranked research opportunities."
                  features={[
                    'Advanced gap analysis for unlimited sources',
                    'Cross-source synthesis and pattern detection',
                    'Methodological recommendations for your research',
                    'Priority-ranked research opportunities',
                    'Export detailed gap analysis reports'
                  ]}
                  ctaText="Upgrade to Pro"
                  ctaLink="/settings?tab=billing"
                  onCTAClick={() => router.push('/settings?tab=billing')}
                  dismissible={true}
                  showOnce={true}
                />
              </div>
            )}

            {/* Source Organization Section */}
            {project && (
              <SourceOrganizationView
                sources={allSources}
                researchQuestion={project.research_question || project.title}
                projectId={params.id}
                onSourceSelect={(source) => {
                  // Handle source selection (could open in modal, navigate, etc.)
                  console.log('Selected source:', source.title);
                }}
                onOrganizationChange={(organization) => {
                  // Handle organization changes for caching/persistence
                  console.log('Organization updated:', organization.metadata);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}