'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface CitationEntry {
  id: string;
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  doi?: string;
  page_numbers?: string;
  citation_style: 'apa' | 'mla' | 'chicago' | 'harvard';
  formatted_citation: string;
  quick_reference: string;
  usage_context: string[];
  relevance_score: number;
  key_quotes: Array<{
    text: string;
    page: string;
    context: string;
  }>;
}

interface CitationDatabaseProps {
  projectId: string;
}

export function CitationDatabase({ projectId }: CitationDatabaseProps) {
  const [citations, setCitations] = useState<CitationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitations = async () => {
      try {
        setLoading(true);

        // Get project literature state from cross-phase integration
        const { data: literatureState, error: stateError } = await supabase
          .from('project_literature_states')
          .select('literature_data')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (stateError && stateError.code !== 'PGRST116') {
          throw stateError;
        }

        if (literatureState?.literature_data?.citation_database) {
          setCitations(literatureState.literature_data.citation_database);
        }

      } catch (err) {
        console.error('Error fetching citations:', err);
        setError('Failed to load citation database');
      } finally {
        setLoading(false);
      }
    };

    fetchCitations();
  }, [projectId]);

  const filteredCitations = citations.filter(citation =>
    citation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    citation.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
    citation.usage_context.some(context => context.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading citation database...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        {error}
      </div>
    );
  }

  if (citations.length === 0) {
    return (
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.75rem'
        }}>
          📖 Citation Database
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          lineHeight: '1.5',
          margin: 0
        }}>
          No citations available yet. Add sources to your Literature Review
          to build your citation database for academic writing.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      overflow: 'hidden'
    }}>
      {/* Header with Controls */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>📖</span>
            Citation Database ({filteredCitations.length})
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as any)}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="apa">APA Style</option>
              <option value="mla">MLA Style</option>
              <option value="chicago">Chicago Style</option>
              <option value="harvard">Harvard Style</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search citations by title, author, or context..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {filteredCitations.map((citation) => (
            <div
              key={citation.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                backgroundColor: '#fefefe'
              }}
            >
              {/* Citation Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {citation.title}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {citation.authors.join(', ')} ({citation.year})
                    {citation.journal && ` • ${citation.journal}`}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginLeft: '1rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>★</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {Math.round(citation.relevance_score * 100)}%
                  </span>
                </div>
              </div>

              {/* Formatted Citation */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <h5 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    margin: 0
                  }}>
                    {selectedStyle.toUpperCase()} Citation
                  </h5>
                  <button
                    onClick={() => copyToClipboard(citation.formatted_citation)}
                    style={{
                      fontSize: '0.75rem',
                      color: '#3b82f6',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#0c4a6e',
                  lineHeight: '1.5',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {citation.formatted_citation}
                </p>
              </div>

              {/* Usage Context */}
              {citation.usage_context.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Usage Context
                  </h5>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {citation.usage_context.map((context, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}
                      >
                        {context}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Quotes Section */}
              {citation.key_quotes.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCitation(
                      expandedCitation === citation.id ? null : citation.id
                    )}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span style={{
                      transform: expandedCitation === citation.id ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▶
                    </span>
                    Key Quotes ({citation.key_quotes.length})
                  </button>

                  {expandedCitation === citation.id && (
                    <div style={{
                      paddingLeft: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {citation.key_quotes.map((quote, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            padding: '1rem'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#111827',
                              lineHeight: '1.5',
                              margin: 0,
                              fontStyle: 'italic',
                              flex: 1
                            }}>
                              "{quote.text}"
                            </p>
                            <button
                              onClick={() => copyToClipboard(`"${quote.text}" (${citation.quick_reference}, p. ${quote.page})`)}
                              style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                marginLeft: '1rem'
                              }}
                            >
                              📋
                            </button>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            <span>Page {quote.page}</span>
                            <span>{quote.context}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}