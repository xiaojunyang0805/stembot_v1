/**
 * Source Organization View Component
 *
 * Memory-driven source organization interface with theme cards,
 * methodology tabs, timeline visualization, and intelligent filtering.
 *
 * Location: src/components/literature/SourceOrganizationView.tsx
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SourceData } from './SourceCard';
import {
  OrganizedSources,
  ThemeCluster,
  MethodologyGroup,
  TimelineGroup,
  organizeSources,
  searchOrganizedSources,
  reorganizeSources
} from '../../lib/research/sourceOrganizer';

interface SourceOrganizationViewProps {
  sources: SourceData[];
  researchQuestion: string;
  projectId: string;
  onSourceSelect?: (source: SourceData) => void;
  onOrganizationChange?: (organization: OrganizedSources) => void;
  className?: string;
}

type ViewMode = 'themes' | 'methodologies' | 'timeline' | 'search';

export const SourceOrganizationView: React.FC<SourceOrganizationViewProps> = ({
  sources,
  researchQuestion,
  projectId,
  onSourceSelect,
  onOrganizationChange,
  className = ''
}) => {
  const [organization, setOrganization] = useState<OrganizedSources | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('themes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    themes: string[];
    methodologies: string[];
    timeRanges: string[];
  }>({
    themes: [],
    methodologies: [],
    timeRanges: []
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-organize sources when they change
  useEffect(() => {
    if (sources.length >= 2 && !organization) {
      organizeSourcesAutomatically();
    }
  }, [sources.length]);

  const organizeSourcesAutomatically = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await organizeSources(sources, researchQuestion, projectId);
      setOrganization(result);
      onOrganizationChange?.(result);
    } catch (error) {
      console.error('Error organizing sources:', error);
      setError('Failed to organize sources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search and filter sources
  const filteredSources = useMemo(() => {
    if (!organization) return sources;

    return searchOrganizedSources(organization, searchQuery, {
      themes: selectedFilters.themes.length > 0 ? selectedFilters.themes : undefined,
      methodologies: selectedFilters.methodologies.length > 0 ? selectedFilters.methodologies : undefined,
      timeRanges: selectedFilters.timeRanges.length > 0 ? selectedFilters.timeRanges : undefined,
    });
  }, [organization, searchQuery, selectedFilters, sources]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleFilter = (type: 'themes' | 'methodologies' | 'timeRanges', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  if (sources.length < 2) {
    return (
      <div className={className} style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#92400e',
            margin: 0
          }}>
            Source Organization
          </h3>
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: '#a16207',
          lineHeight: '1.5',
          margin: 0
        }}>
          Collect at least 2 sources to unlock AI-powered organization with theme clustering,
          methodology grouping, and timeline analysis.
        </p>
        <div style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#a16207'
        }}>
          Progress: {sources.length}/2 sources collected
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
      marginTop: '2rem'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        borderRadius: '0.75rem 0.75rem 0 0',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0
            }}>
              Source Organization
            </h3>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem'
            }}>
              {sources.length} sources
            </span>
          </div>

          {!organization && (
            <button
              onClick={organizeSourcesAutomatically}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: isLoading ? '#f3f4f6' : '#3b82f6',
                color: isLoading ? '#6b7280' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? '🔄' : '🧠'}
              <span>{isLoading ? 'Organizing...' : 'Organize Sources'}</span>
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          backgroundColor: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: '0.5rem'
        }}>
          {[
            { mode: 'themes' as ViewMode, icon: '🎨', label: 'Themes' },
            { mode: 'methodologies' as ViewMode, icon: '🔬', label: 'Methods' },
            { mode: 'timeline' as ViewMode, icon: '📅', label: 'Timeline' },
            { mode: 'search' as ViewMode, icon: '🔍', label: 'Search' }
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: viewMode === mode ? 'white' : 'transparent',
                color: viewMode === mode ? '#1e293b' : '#64748b',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: viewMode === mode ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '0.5rem',
          padding: '1rem',
          margin: '1rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#dc2626',
            margin: 0
          }}>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontSize: '0.875rem' }}>
              Organizing sources with AI-powered clustering...
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {organization && !isLoading && (
        <div style={{ padding: '1.5rem' }}>
          {viewMode === 'themes' && (
            <ThemesView
              themes={organization.themes}
              onSourceSelect={onSourceSelect}
              expandedItems={expandedItems}
              onToggleExpanded={toggleExpanded}
            />
          )}

          {viewMode === 'methodologies' && (
            <MethodologiesView
              methodologies={organization.methodologies}
              onSourceSelect={onSourceSelect}
              expandedItems={expandedItems}
              onToggleExpanded={toggleExpanded}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              timeline={organization.timeline}
              onSourceSelect={onSourceSelect}
              expandedItems={expandedItems}
              onToggleExpanded={toggleExpanded}
            />
          )}

          {viewMode === 'search' && (
            <SearchView
              organization={organization}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedFilters={selectedFilters}
              onToggleFilter={toggleFilter}
              filteredSources={filteredSources}
              onSourceSelect={onSourceSelect}
            />
          )}

          {/* Organization Metadata */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>📊 Confidence: {organization.metadata.confidence}</span>
              <span>🧠 Method: {organization.metadata.clusteringMethod}</span>
              <span>📅 Organized: {new Date(organization.metadata.organizationDate).toLocaleDateString()}</span>
            </div>
            {organization.metadata.suggestions.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>💡 Suggestions: </span>
                {organization.metadata.suggestions[0].description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Themes View Component
const ThemesView: React.FC<{
  themes: ThemeCluster[];
  onSourceSelect?: (source: SourceData) => void;
  expandedItems: Set<string>;
  onToggleExpanded: (itemId: string) => void;
}> = ({ themes, onSourceSelect, expandedItems, onToggleExpanded }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {themes.map((theme) => (
        <div
          key={theme.id}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Theme Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: theme.color + '10',
              borderBottom: expandedItems.has(theme.id) ? '1px solid #e2e8f0' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => onToggleExpanded(theme.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  backgroundColor: theme.color,
                  borderRadius: '50%'
                }}
              />
              <div>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  {theme.name}
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  marginTop: '0.25rem'
                }}>
                  {theme.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                backgroundColor: theme.color + '20',
                color: theme.color,
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {theme.sources.length} sources
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#64748b',
                transition: 'transform 0.2s ease',
                transform: expandedItems.has(theme.id) ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </div>
          </div>

          {/* Theme Content */}
          {expandedItems.has(theme.id) && (
            <div style={{ padding: '1rem' }}>
              {/* Keywords */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '0.5rem'
                }}>
                  Keywords:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {theme.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {theme.sources.map((source) => (
                  <div
                    key={source.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      cursor: onSourceSelect ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => onSourceSelect?.(source)}
                    onMouseEnter={(e) => {
                      if (onSourceSelect) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (onSourceSelect) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {source.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {source.authors.join(', ')} ({source.year})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Methodologies View Component
const MethodologiesView: React.FC<{
  methodologies: MethodologyGroup[];
  onSourceSelect?: (source: SourceData) => void;
  expandedItems: Set<string>;
  onToggleExpanded: (itemId: string) => void;
}> = ({ methodologies, onSourceSelect, expandedItems, onToggleExpanded }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {methodologies.map((methodology) => (
        <div
          key={methodology.id}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}
        >
          {/* Methodology Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderBottom: expandedItems.has(methodology.id) ? '1px solid #e2e8f0' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => onToggleExpanded(methodology.id)}
          >
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                🔬 {methodology.name}
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0,
                marginTop: '0.25rem'
              }}>
                {methodology.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {methodology.sources.length} sources
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#64748b',
                transition: 'transform 0.2s ease',
                transform: expandedItems.has(methodology.id) ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </div>
          </div>

          {/* Methodology Content */}
          {expandedItems.has(methodology.id) && (
            <div style={{ padding: '1rem' }}>
              {/* Characteristics */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '0.5rem'
                }}>
                  Characteristics:
                </div>
                <ul style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  margin: 0,
                  paddingLeft: '1rem'
                }}>
                  {methodology.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#059669',
                    marginBottom: '0.5rem'
                  }}>
                    ✅ Strengths:
                  </div>
                  <ul style={{
                    fontSize: '0.75rem',
                    color: '#065f46',
                    margin: 0,
                    paddingLeft: '1rem'
                  }}>
                    {methodology.strengthsWeaknesses.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#dc2626',
                    marginBottom: '0.5rem'
                  }}>
                    ⚠️ Limitations:
                  </div>
                  <ul style={{
                    fontSize: '0.75rem',
                    color: '#991b1b',
                    margin: 0,
                    paddingLeft: '1rem'
                  }}>
                    {methodology.strengthsWeaknesses.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sources */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {methodology.sources.map((source) => (
                  <div
                    key={source.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      cursor: onSourceSelect ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => onSourceSelect?.(source)}
                    onMouseEnter={(e) => {
                      if (onSourceSelect) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (onSourceSelect) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {source.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {source.authors.join(', ')} ({source.year})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Timeline View Component
const TimelineView: React.FC<{
  timeline: TimelineGroup[];
  onSourceSelect?: (source: SourceData) => void;
  expandedItems: Set<string>;
  onToggleExpanded: (itemId: string) => void;
}> = ({ timeline, onSourceSelect, expandedItems, onToggleExpanded }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {timeline.map((period) => (
        <div
          key={period.id}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}
        >
          {/* Period Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderBottom: expandedItems.has(period.id) ? '1px solid #e2e8f0' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => onToggleExpanded(period.id)}
          >
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                📅 {period.period}
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0,
                marginTop: '0.25rem'
              }}>
                {period.evolutionNotes}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                backgroundColor: period.relevanceToPresent === 'high' ? '#dcfce7' :
                               period.relevanceToPresent === 'moderate' ? '#fef3c7' : '#fef2f2',
                color: period.relevanceToPresent === 'high' ? '#166534' :
                       period.relevanceToPresent === 'moderate' ? '#a16207' : '#dc2626',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {period.relevanceToPresent} relevance
              </span>
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {period.sources.length} sources
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#64748b',
                transition: 'transform 0.2s ease',
                transform: expandedItems.has(period.id) ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </div>
          </div>

          {/* Period Content */}
          {expandedItems.has(period.id) && (
            <div style={{ padding: '1rem' }}>
              {/* Trends */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '0.5rem'
                }}>
                  Key Trends:
                </div>
                <ul style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  margin: 0,
                  paddingLeft: '1rem'
                }}>
                  {period.trends.map((trend, index) => (
                    <li key={index}>{trend}</li>
                  ))}
                </ul>
              </div>

              {/* Sources */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {period.sources.map((source) => (
                  <div
                    key={source.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      cursor: onSourceSelect ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => onSourceSelect?.(source)}
                    onMouseEnter={(e) => {
                      if (onSourceSelect) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (onSourceSelect) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {source.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {source.authors.join(', ')} ({source.year})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Search View Component
const SearchView: React.FC<{
  organization: OrganizedSources;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: {
    themes: string[];
    methodologies: string[];
    timeRanges: string[];
  };
  onToggleFilter: (type: 'themes' | 'methodologies' | 'timeRanges', value: string) => void;
  filteredSources: SourceData[];
  onSourceSelect?: (source: SourceData) => void;
}> = ({
  organization,
  searchQuery,
  setSearchQuery,
  selectedFilters,
  onToggleFilter,
  filteredSources,
  onSourceSelect
}) => {
  return (
    <div>
      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search sources by title, author, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.75rem'
        }}>
          Filter by:
        </div>

        {/* Theme Filters */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Themes:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {organization.themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onToggleFilter('themes', theme.id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: selectedFilters.themes.includes(theme.id) ? theme.color : 'white',
                  color: selectedFilters.themes.includes(theme.id) ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Methodology Filters */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Methodologies:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {organization.methodologies.map((methodology) => (
              <button
                key={methodology.id}
                onClick={() => onToggleFilter('methodologies', methodology.id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: selectedFilters.methodologies.includes(methodology.id) ? '#3b82f6' : 'white',
                  color: selectedFilters.methodologies.includes(methodology.id) ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {methodology.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          Results ({filteredSources.length} sources):
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredSources.map((source) => (
            <div
              key={source.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '1rem',
                cursor: onSourceSelect ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onSourceSelect?.(source)}
              onMouseEnter={(e) => {
                if (onSourceSelect) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (onSourceSelect) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                {source.title}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                {source.authors.join(', ')} ({source.year}) • {source.journal}
              </div>
              {source.abstract && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  lineHeight: '1.4'
                }}>
                  {source.abstract.substring(0, 200)}...
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredSources.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontSize: '0.875rem' }}>
              No sources found matching your search criteria.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceOrganizationView;