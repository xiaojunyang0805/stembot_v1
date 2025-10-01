'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface SourceInfo {
  id: string;
  title: string;
  authors: string[];
  year: string;
  methodology_tags: string[];
  key_findings: string[];
  relevance_score: number;
}

interface SourceContextProps {
  projectId: string;
}

export function SourceContext({ projectId }: SourceContextProps) {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceCount, setSourceCount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    const fetchSourceContext = async () => {
      try {
        setLoading(true);

        // Get project literature state from cross-phase integration
        const { data: literatureState, error: stateError } = await supabase
          .from('project_literature_states')
          .select('literature_data, source_count, progress_percentage')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (stateError && stateError.code !== 'PGRST116') {
          throw stateError;
        }

        if (literatureState) {
          setSourceCount(literatureState.source_count || 0);
          setProgressPercentage(literatureState.progress_percentage || 0);

          if (literatureState.literature_data?.sources) {
            // Extract source information relevant to methodology
            const methodologyRelevantSources = literatureState.literature_data.sources
              .filter((source: any) =>
                source.methodology_tags && source.methodology_tags.length > 0
              )
              .map((source: any) => ({
                id: source.id,
                title: source.title,
                authors: source.authors || [],
                year: source.year || 'Unknown',
                methodology_tags: source.methodology_tags || [],
                key_findings: source.key_findings || [],
                relevance_score: source.relevance_score || 0
              }));

            setSources(methodologyRelevantSources);
          }
        }

      } catch (err) {
        console.error('Error fetching source context:', err);
        setError('Failed to load source context');
      } finally {
        setLoading(false);
      }
    };

    fetchSourceContext();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading source context...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        {error}
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
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
            <span>📚</span>
            Literature Context for Methodology
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {sourceCount} sources • {progressPercentage}% complete
            </span>
          </div>
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: '0.5rem 0 0 0'
        }}>
          Sources from your literature review with methodology insights
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {sources.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 0'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              📖
            </div>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 0.5rem 0'
            }}>
              No methodology-relevant sources yet
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: '1.5',
              margin: 0
            }}>
              Add sources to your Literature Review and run source organization
              to see methodology insights from your research here.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {sources.map((source) => (
              <div
                key={source.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#fefefe'
                }}
              >
                {/* Source Header */}
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
                      {source.title}
                    </h4>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {source.authors.join(', ')} ({source.year})
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
                      {Math.round(source.relevance_score * 100)}%
                    </span>
                  </div>
                </div>

                {/* Methodology Tags */}
                {source.methodology_tags.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Methodology Tags
                    </h5>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {source.methodology_tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#3b82f6',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Findings */}
                {source.key_findings.length > 0 && (
                  <div>
                    <h5 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Key Methodology Findings
                    </h5>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.25rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {source.key_findings.slice(0, 3).map((finding, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}