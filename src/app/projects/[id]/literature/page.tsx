'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import ResearchLayout from '../../../../components/layout/ResearchLayout';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function LiteratureReviewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [uploadedDocuments, setUploadedDocuments] = useState([
    { id: '1', name: 'Sleep_and_Memory_Smith2024.pdf', size: '2.1 MB', uploadDate: '2025-01-15', status: 'processed' },
    { id: '2', name: 'Cognitive_Performance_Johnson2023.pdf', size: '1.8 MB', uploadDate: '2025-01-18', status: 'processed' },
    { id: '3', name: 'Undergraduate_Sleep_Chen2024.pdf', size: '3.2 MB', uploadDate: '2025-01-20', status: 'processing' },
  ]);
  const [selectedTab, setSelectedTab] = useState('upload');

  const userName = user?.email?.split('@')[0] || 'Research User';

  const memoryHints = [
    {
      id: 'hint-1',
      title: 'Research Gap Identified',
      content: 'Limited studies on undergraduate populations compared to older adults in sleep-memory research',
      type: 'insight' as const,
      confidence: 0.92
    },
    {
      id: 'hint-2',
      title: 'Methodology Trend',
      content: 'Most recent studies (2023-2024) use cross-sectional designs with validated sleep questionnaires',
      type: 'suggestion' as const,
      confidence: 0.88
    }
  ];

  // Convert AuthUser to User format expected by ResearchLayout
  const layoutUser = user ? {
    id: user.id,
    name: user.email?.split('@')[0] || 'Researcher',
    email: user.email || '',
    avatar: undefined
  } : undefined;

  const mockAnalysis = {
    keyThemes: [
      { theme: 'Sleep Deprivation Effects', papers: 8, strength: 'Strong' },
      { theme: 'Memory Consolidation', papers: 6, strength: 'Moderate' },
      { theme: 'Academic Performance', papers: 12, strength: 'Strong' },
      { theme: 'Circadian Rhythms', papers: 4, strength: 'Weak' }
    ],
    gaps: [
      'Limited studies on undergraduate populations specifically',
      'Lack of longitudinal studies beyond 6 months',
      'Insufficient research on intervention strategies',
      'Missing cross-cultural comparison studies'
    ],
    suggestions: [
      'Search for more undergraduate-specific studies in PsycINFO',
      'Look for longitudinal sleep studies in sleep medicine journals',
      'Review intervention studies in educational psychology',
      'Consider meta-analyses for broader perspective'
    ]
  };

  const searchSuggestions = [
    { query: 'sleep deprivation AND academic performance AND college students', database: 'PsycINFO' },
    { query: 'circadian rhythm AND learning AND undergraduates', database: 'PubMed' },
    { query: 'sleep intervention AND university students', database: 'ERIC' },
    { query: 'memory consolidation AND sleep quality AND young adults', database: 'Web of Science' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toLocaleDateString(),
          status: 'processing' as const
        };
        setUploadedDocuments(prev => [...prev, newDoc]);
      });
    }
  };

  return (
    <ResearchLayout
      currentPhase="literature"
      projectTitle="Sleep & Memory Research Study"
      projectId={params.id}
      user={layoutUser}
      memoryHints={memoryHints}
    >
      <div style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Navigation Banner */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          marginBottom: '2rem',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            {[
              { id: 'workspace', label: 'Workspace', path: `/projects/${params.id}`, active: false },
              { id: 'literature', label: 'Literature Review', path: `/projects/${params.id}/literature`, active: true },
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

        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            📚 Literature Review & Source Analysis
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Systematically review existing research to identify gaps, themes, and methodological approaches.
            Our AI helps you synthesize findings and build a comprehensive foundation for your study.
          </p>
        </div>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          {[
            { id: 'upload', label: '📤 Upload Documents', icon: '📤' },
            { id: 'analysis', label: '🔍 Analysis', icon: '🔍' },
            { id: 'search', label: '🔎 Search Suggestions', icon: '🔎' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: selectedTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                color: selectedTab === tab.id ? '#2563eb' : '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Documents Tab */}
        {selectedTab === 'upload' && (
          <div>
            {/* Upload Area */}
            <div style={{
              backgroundColor: '#f9fafb',
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              padding: '3rem 2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '3rem',
                color: '#9ca3af',
                marginBottom: '1rem'
              }}>
                📄
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Upload Research Papers
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1.5rem'
              }}>
                Drag and drop your PDF files here, or click to browse
              </p>
              <label style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Choose Files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{display: 'none'}}
                />
              </label>
            </div>

            {/* Uploaded Documents List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  Uploaded Documents ({uploadedDocuments.length})
                </h3>
              </div>
              <div>
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}>
                        📄
                      </div>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {doc.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {doc.size} • Uploaded {doc.uploadDate}
                        </div>
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: doc.status === 'processed' ? '#dcfce7' : '#fef3c7',
                        color: doc.status === 'processed' ? '#166534' : '#92400e'
                      }}>
                        {doc.status === 'processed' ? '✓ Processed' : '⏳ Processing'}
                      </span>
                      <button style={{
                        padding: '0.25rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}>
                        ⋮
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {selectedTab === 'analysis' && (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
            {/* Key Themes */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
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
                🎯 Key Themes Identified
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {mockAnalysis.keyThemes.map((theme, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {theme.theme}
                      </span>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: theme.strength === 'Strong' ? '#dcfce7' :
                                       theme.strength === 'Moderate' ? '#fef3c7' : '#fee2e2',
                        color: theme.strength === 'Strong' ? '#166534' :
                               theme.strength === 'Moderate' ? '#92400e' : '#dc2626'
                      }}>
                        {theme.strength}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {theme.papers} papers found
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Gaps */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
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
                🔍 Research Gaps Identified
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {mockAnalysis.gaps.map((gap, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#fef3c7',
                      borderRadius: '0.375rem',
                      border: '1px solid #fde047'
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <span style={{fontSize: '0.75rem', marginTop: '0.125rem'}}>⚠️</span>
                      {gap}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div style={{
              gridColumn: '1 / -1',
              backgroundColor: '#eff6ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #bfdbfe'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🧠 AI Recommendations
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem'}}>
                {mockAnalysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <span style={{fontSize: '0.75rem', marginTop: '0.125rem'}}>💡</span>
                      {suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Suggestions Tab */}
        {selectedTab === 'search' && (
          <div>
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #bfdbfe',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '0.75rem'
              }}>
                🔎 Recommended Search Strategies
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                margin: 0
              }}>
                Based on your research question and current literature gaps, here are targeted search strategies:
              </p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem'}}>
              {searchSuggestions.map((search, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {search.database}
                    </span>
                    <button style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      Copy Query
                    </button>
                  </div>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    {search.query}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ResearchLayout>
  );
}