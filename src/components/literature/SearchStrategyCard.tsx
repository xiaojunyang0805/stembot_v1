/**
 * SearchStrategyCard Component - WP3 Literature Discovery
 *
 * Memory-driven search strategy generation for novice researchers
 * Features: AI-generated search terms, database recommendations, copy buttons
 *
 * Location: src/components/literature/SearchStrategyCard.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Copy, Search, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { QuestionMemoryHelpers } from '@/lib/memory/questionMemory';

export interface SearchStrategy {
  primarySearchString: string;
  alternativeStrings: string[];
  recommendedDatabases: DatabaseRecommendation[];
  researchField: string;
  generatedAt: Date;
}

export interface DatabaseRecommendation {
  name: string;
  description: string;
  url: string;
  suitabilityReason: string;
  priority: 'primary' | 'secondary' | 'supplementary';
}

interface SearchStrategyCardProps {
  projectId: string;
  researchQuestion: string;
  onFindSources?: () => void;
  onUploadPaper?: () => void;
  className?: string;
}

// Academic database mappings with external links
const ACADEMIC_DATABASES = {
  'PubMed': {
    name: 'PubMed',
    description: 'Biomedical and life sciences literature',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    fields: ['biology', 'medicine', 'biochemistry', 'biomedical', 'health']
  },
  'IEEE Xplore': {
    name: 'IEEE Xplore',
    description: 'Engineering, technology, and computer science',
    url: 'https://ieeexplore.ieee.org/',
    fields: ['engineering', 'technology', 'computer science', 'electronics', 'telecommunications']
  },
  'ACS Publications': {
    name: 'ACS Publications',
    description: 'Chemistry and chemical engineering',
    url: 'https://pubs.acs.org/',
    fields: ['chemistry', 'chemical engineering', 'materials science']
  },
  'Nature': {
    name: 'Nature',
    description: 'Multidisciplinary scientific research',
    url: 'https://www.nature.com/',
    fields: ['physics', 'chemistry', 'biology', 'environmental science']
  },
  'Science Direct': {
    name: 'Science Direct',
    description: 'Broad scientific and technical research',
    url: 'https://www.sciencedirect.com/',
    fields: ['general', 'multidisciplinary']
  },
  'arXiv': {
    name: 'arXiv',
    description: 'Preprints in physics, math, and computer science',
    url: 'https://arxiv.org/',
    fields: ['physics', 'mathematics', 'computer science', 'theoretical']
  }
};

export function SearchStrategyCard({
  projectId,
  researchQuestion,
  onFindSources,
  onUploadPaper,
  className = ""
}: SearchStrategyCardProps) {
  const [searchStrategy, setSearchStrategy] = useState<SearchStrategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [databaseClicks, setDatabaseClicks] = useState<Set<string>>(new Set());

  // Generate search strategy on component mount
  useEffect(() => {
    if (researchQuestion && !searchStrategy) {
      generateSearchStrategy();
    }
  }, [researchQuestion, projectId]);

  /**
   * Generate optimized search terms using GPT-4o-mini
   */
  async function generateSearchStrategy(): Promise<void> {
    if (!researchQuestion.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/search-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchQuestion,
          projectId
        }),
      });

      if (!response.ok) {
        console.warn('Search strategy API failed, using fallback generation');
        const fallbackStrategy = generateFallbackSearchStrategy(researchQuestion);
        setSearchStrategy(fallbackStrategy);
        return;
      }

      const data = await response.json();
      setSearchStrategy(data.searchStrategy);

      // Store in project memory for future reference
      await QuestionMemoryHelpers.storeAISuggestion(
        projectId,
        `Generated search strategy: "${data.searchStrategy.primarySearchString}" for databases: ${data.searchStrategy.recommendedDatabases.map((db: DatabaseRecommendation) => db.name).join(', ')}`,
        researchQuestion
      );

      console.log('✅ Search strategy generated and stored in memory');

    } catch (error) {
      console.error('Error generating search strategy:', error);
      // Use fallback strategy
      const fallbackStrategy = generateFallbackSearchStrategy(researchQuestion);
      setSearchStrategy(fallbackStrategy);
    } finally {
      setIsGenerating(false);
    }
  }

  /**
   * Fallback search strategy generation for when AI fails
   */
  function generateFallbackSearchStrategy(question: string): SearchStrategy {
    const questionLower = question.toLowerCase();

    // Extract key terms from question
    const keyTerms = question
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 4);

    // Detect research field from question
    let researchField = 'general';
    if (questionLower.includes('bacterial') || questionLower.includes('biology') || questionLower.includes('organism')) {
      researchField = 'biology';
    } else if (questionLower.includes('chemical') || questionLower.includes('reaction') || questionLower.includes('chemistry')) {
      researchField = 'chemistry';
    } else if (questionLower.includes('engineering') || questionLower.includes('technology')) {
      researchField = 'engineering';
    } else if (questionLower.includes('physics') || questionLower.includes('measurement') || questionLower.includes('accuracy')) {
      researchField = 'physics';
    }

    // Generate search strings
    const primarySearchString = keyTerms.slice(0, 3).join(' AND ');
    const alternativeStrings = [
      keyTerms.slice(0, 2).join(' AND '),
      keyTerms.join(' OR ')
    ];

    // Select relevant databases
    const recommendedDatabases: DatabaseRecommendation[] = [];

    for (const [key, database] of Object.entries(ACADEMIC_DATABASES)) {
      if (database.fields.includes(researchField) || database.fields.includes('general')) {
        const priority = database.fields.includes(researchField) ? 'primary' : 'secondary';
        recommendedDatabases.push({
          name: database.name,
          description: database.description,
          url: database.url,
          suitabilityReason: `Recommended for ${researchField} research`,
          priority: priority as 'primary' | 'secondary'
        });
      }
    }

    // Ensure we have at least 3 databases
    if (recommendedDatabases.length < 3) {
      recommendedDatabases.push({
        name: 'Science Direct',
        description: 'Broad scientific and technical research',
        url: 'https://www.sciencedirect.com/',
        suitabilityReason: 'General scientific database',
        priority: 'supplementary'
      });
    }

    return {
      primarySearchString,
      alternativeStrings,
      recommendedDatabases: recommendedDatabases.slice(0, 4),
      researchField,
      generatedAt: new Date()
    };
  }

  /**
   * Copy search term to clipboard
   */
  async function copyToClipboard(text: string, index: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  /**
   * Track database clicks for analytics
   */
  function handleDatabaseClick(databaseName: string, url: string): void {
    setDatabaseClicks(prev => new Set([...prev, databaseName]));

    // Store click in project memory
    QuestionMemoryHelpers.storeAISuggestion(
      projectId,
      `Student explored ${databaseName} database for literature search`,
      researchQuestion
    );

    // Open database in new tab
    window.open(url, '_blank');
  }

  if (isGenerating) {
    return (
      <Card
        className={className}
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}
      >
        <CardContent style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>Generating search strategy...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!searchStrategy) {
    return (
      <Card
        className={className}
        style={{
          backgroundColor: '#fef3cd',
          border: '1px solid #fcd34d',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}
      >
        <CardContent style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#92400e'
          }}>
            <span>⚠️</span>
            <span>Unable to generate search strategy. Please try again.</span>
            <Button
              onClick={generateSearchStrategy}
              style={{
                marginLeft: 'auto',
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem'
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardHeader style={{
        padding: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <CardTitle style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Search style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />
          Literature Search Strategy
        </CardTitle>

        {/* Research Question Display */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Your Research Question
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#374151',
            fontStyle: 'italic'
          }}>
            "{researchQuestion}"
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '1.5rem' }}>
        {/* Search Terms Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            📝 Optimized Search Terms
          </h4>

          {/* Primary Search String */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#059669',
              marginBottom: '0.5rem'
            }}>
              Primary Search (Recommended)
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              borderRadius: '0.375rem'
            }}>
              <code style={{
                flex: 1,
                fontSize: '0.875rem',
                color: '#065f46',
                fontFamily: 'monospace'
              }}>
                {searchStrategy.primarySearchString}
              </code>
              <Button
                size="sm"
                onClick={() => copyToClipboard(searchStrategy.primarySearchString, 0)}
                style={{
                  backgroundColor: copiedIndex === 0 ? '#10b981' : '#f3f4f6',
                  color: copiedIndex === 0 ? 'white' : '#6b7280',
                  padding: '0.375rem',
                  borderRadius: '0.25rem'
                }}
              >
                <Copy style={{ width: '1rem', height: '1rem' }} />
              </Button>
            </div>
          </div>

          {/* Alternative Search Strings */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Alternative Combinations
          </div>
          {searchStrategy.alternativeStrings.map((searchString, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                marginBottom: '0.5rem'
              }}
            >
              <code style={{
                flex: 1,
                fontSize: '0.875rem',
                color: '#475569',
                fontFamily: 'monospace'
              }}>
                {searchString}
              </code>
              <Button
                size="sm"
                onClick={() => copyToClipboard(searchString, index + 1)}
                style={{
                  backgroundColor: copiedIndex === index + 1 ? '#10b981' : '#f3f4f6',
                  color: copiedIndex === index + 1 ? 'white' : '#6b7280',
                  padding: '0.375rem',
                  borderRadius: '0.25rem'
                }}
              >
                <Copy style={{ width: '1rem', height: '1rem' }} />
              </Button>
            </div>
          ))}
        </div>

        {/* Database Recommendations */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            🏛️ Recommended Databases
          </h4>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Based on your {searchStrategy.researchField} research focus
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.75rem'
          }}>
            {searchStrategy.recommendedDatabases.map((database, index) => (
              <div
                key={index}
                onClick={() => handleDatabaseClick(database.name, database.url)}
                style={{
                  padding: '1rem',
                  border: database.priority === 'primary' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  backgroundColor: database.priority === 'primary' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: databaseClicks.has(database.name) ? 'scale(0.98)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {database.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {database.priority === 'primary' && (
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: '600',
                        color: '#3b82f6',
                        backgroundColor: '#dbeafe',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem'
                      }}>
                        BEST
                      </span>
                    )}
                    <ExternalLink style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  {database.description}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#059669',
                  fontStyle: 'italic'
                }}>
                  {database.suitabilityReason}
                </div>
                {databaseClicks.has(database.name) && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#10b981',
                    fontWeight: '500',
                    marginTop: '0.5rem'
                  }}>
                    ✓ Explored
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f3f4f6'
        }}>
          <Button
            onClick={onFindSources}
            style={{
              flex: 1,
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            <Search style={{ width: '1.25rem', height: '1.25rem' }} />
            Find Sources
          </Button>

          <Button
            onClick={onUploadPaper}
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
            }}
          >
            <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
            Upload Paper
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SearchStrategyCard;