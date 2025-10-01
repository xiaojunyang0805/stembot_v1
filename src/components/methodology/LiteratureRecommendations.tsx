'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface LiteratureRecommendation {
  id: string;
  title: string;
  authors: string[];
  year: string;
  recommendation_type: 'methodology' | 'theoretical_framework' | 'data_collection' | 'analysis_method';
  relevance_score: number;
  key_insights: string[];
  methodology_connection: string;
  suggested_application: string;
}

interface LiteratureRecommendationsProps {
  projectId: string;
}

export function LiteratureRecommendations({ projectId }: LiteratureRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<LiteratureRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
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

        if (literatureState?.literature_data?.methodology_recommendations) {
          setRecommendations(literatureState.literature_data.methodology_recommendations);
        }

      } catch (err) {
        console.error('Error fetching literature recommendations:', err);
        setError('Failed to load literature recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading literature recommendations...
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

  if (recommendations.length === 0) {
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
          📚 Literature-Based Methodology Guidance
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          lineHeight: '1.5',
          margin: 0
        }}>
          No methodology recommendations available yet. Add sources to your Literature Review
          to get AI-powered methodology suggestions based on your research.
        </p>
      </div>
    );
  }

  const typeLabels = {
    methodology: '🔬 Research Method',
    theoretical_framework: '📋 Theoretical Framework',
    data_collection: '📊 Data Collection',
    analysis_method: '📈 Analysis Method'
  };

  const typeColors = {
    methodology: '#3b82f6',
    theoretical_framework: '#8b5cf6',
    data_collection: '#10b981',
    analysis_method: '#f59e0b'
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
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
          Literature-Based Methodology Recommendations ({recommendations.length})
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: '0.5rem 0 0 0'
        }}>
          AI-generated methodology suggestions based on your literature review
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                backgroundColor: '#fefefe'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: typeColors[rec.recommendation_type],
                      backgroundColor: `${typeColors[rec.recommendation_type]}15`,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      {typeLabels[rec.recommendation_type]}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>★</span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {Math.round(rec.relevance_score * 100)}% relevant
                      </span>
                    </div>
                  </div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {rec.title}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {rec.authors.join(', ')} ({rec.year})
                  </p>
                </div>
              </div>

              {/* Methodology Connection */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h5 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#0c4a6e',
                  margin: '0 0 0.5rem 0'
                }}>
                  Methodology Connection
                </h5>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#0c4a6e',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {rec.methodology_connection}
                </p>
              </div>

              {/* Key Insights */}
              {rec.key_insights.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Key Insights
                  </h5>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    {rec.key_insights.map((insight, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Application */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.375rem',
                padding: '1rem'
              }}>
                <h5 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#166534',
                  margin: '0 0 0.5rem 0'
                }}>
                  💡 Suggested Application
                </h5>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#166534',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {rec.suggested_application}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}