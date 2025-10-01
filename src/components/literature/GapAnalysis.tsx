/**
 * Gap Analysis Component - WP3 Literature Discovery
 *
 * AI-powered analysis of literature gaps based on collected sources,
 * providing specific research opportunities and actionable insights
 * for novice researchers.
 *
 * Location: src/components/literature/GapAnalysis.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SourceData } from './SourceCard';

interface GapAnalysis {
  overallAssessment: string;
  identifiedGaps: GapItem[];
  researchOpportunities: ResearchOpportunity[];
  methodologicalGaps: string[];
  recommendations: string[];
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  generatedAt: string;
}

interface GapItem {
  area: string;
  description: string;
  severity: 'Critical' | 'Moderate' | 'Minor';
  rationale: string;
}

interface ResearchOpportunity {
  title: string;
  description: string;
  feasibility: 'High' | 'Moderate' | 'Low';
  impact: 'High' | 'Moderate' | 'Low';
  suggestedApproach: string;
}

interface GapAnalysisProps {
  sources: SourceData[];
  researchQuestion: string;
  projectId: string;
  className?: string;
}

export const GapAnalysis: React.FC<GapAnalysisProps> = ({
  sources,
  researchQuestion,
  projectId,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-generate analysis when sufficient sources are available
  useEffect(() => {
    if (sources.length >= 3 && !analysis && !isLoading) {
      generateGapAnalysis();
    }
  }, [sources.length]);

  const generateGapAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare source summaries for analysis
      const sourceSummaries = sources.map(source => ({
        title: source.title,
        year: source.year,
        credibilityLevel: source.credibility.level,
        keyFindings: source.keyFindings.slice(0, 3), // Limit for API
        relevance: source.relevanceExplanation.substring(0, 200), // Limit length
        journal: source.journal,
        studyType: source.credibility.studyType || 'Unknown'
      }));

      const analysisPrompt = `Analyze literature gaps for this research question: "${researchQuestion}"

Based on these ${sources.length} sources:
${sourceSummaries.map(s => `- ${s.title} (${s.year}, ${s.credibilityLevel} quality): ${s.keyFindings.join('; ')}`).join('\n')}

Provide gap analysis in this format:
{
  "overallAssessment": "Brief assessment of current literature state",
  "identifiedGaps": [
    {
      "area": "Gap area name",
      "description": "What's missing or understudied",
      "severity": "Critical|Moderate|Minor",
      "rationale": "Why this gap matters"
    }
  ],
  "researchOpportunities": [
    {
      "title": "Specific research opportunity",
      "description": "What could be studied",
      "feasibility": "High|Moderate|Low",
      "impact": "High|Moderate|Low",
      "suggestedApproach": "How to approach this research"
    }
  ],
  "methodologicalGaps": ["Methodological limitations or gaps"],
  "recommendations": ["Actionable recommendations for future research"],
  "confidenceLevel": "High|Moderate|Low"
}

Focus on actionable insights for novice researchers. Be specific and practical.`;

      const response = await fetch('/api/ai/search-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          projectId: projectId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate gap analysis');
      }

      const data = await response.json();

      if (data.success) {
        // Try to parse structured response
        try {
          const parsedAnalysis = JSON.parse(data.explanation);
          setAnalysis({
            ...parsedAnalysis,
            generatedAt: new Date().toISOString()
          });
        } catch {
          // Fallback to text-based analysis
          setAnalysis(generateFallbackAnalysis(data.explanation, sources));
        }
      } else {
        throw new Error('Analysis generation failed');
      }

    } catch (error) {
      console.error('Error generating gap analysis:', error);
      setError('Failed to generate analysis. Please try again.');

      // Generate basic fallback analysis
      setAnalysis(generateBasicFallbackAnalysis(sources, researchQuestion));
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackAnalysis = (textResponse: string, sources: SourceData[]): GapAnalysis => {
    return {
      overallAssessment: `Based on ${sources.length} sources, here's the analysis: ${textResponse.substring(0, 300)}...`,
      identifiedGaps: [
        {
          area: 'Literature Coverage',
          description: 'Analysis of current literature suggests areas for further investigation',
          severity: 'Moderate',
          rationale: 'Based on available sources and AI analysis'
        }
      ],
      researchOpportunities: [
        {
          title: 'Extended Research',
          description: 'Opportunities for deeper investigation based on current findings',
          feasibility: 'Moderate',
          impact: 'Moderate',
          suggestedApproach: 'Build on existing research with focused study'
        }
      ],
      methodologicalGaps: ['Further analysis needed to identify specific gaps'],
      recommendations: ['Conduct additional literature search', 'Consider expert consultation'],
      confidenceLevel: 'Low',
      generatedAt: new Date().toISOString()
    };
  };

  const generateBasicFallbackAnalysis = (sources: SourceData[], question: string): GapAnalysis => {
    const highQualitySources = sources.filter(s => s.credibility.level === 'High').length;
    const totalSources = sources.length;

    return {
      overallAssessment: `You have collected ${totalSources} sources, with ${highQualitySources} high-quality sources. This provides a foundation for understanding "${question}". Additional sources may be needed for comprehensive coverage.`,
      identifiedGaps: [
        {
          area: 'Source Diversity',
          description: totalSources < 5 ? 'Limited number of sources may not provide comprehensive coverage' : 'Good source collection, but consider expanding scope',
          severity: totalSources < 3 ? 'Critical' : totalSources < 5 ? 'Moderate' : 'Minor',
          rationale: 'Comprehensive literature reviews typically require 10+ high-quality sources'
        }
      ],
      researchOpportunities: [
        {
          title: 'Expand Literature Search',
          description: 'Search for additional sources to strengthen your literature foundation',
          feasibility: 'High',
          impact: 'High',
          suggestedApproach: 'Use different search terms and databases to find complementary research'
        }
      ],
      methodologicalGaps: ['Consider sources with different methodological approaches'],
      recommendations: [
        'Aim for 10+ high-quality sources',
        'Include recent publications (last 5 years)',
        'Ensure methodological diversity'
      ],
      confidenceLevel: 'Moderate',
      generatedAt: new Date().toISOString()
    };
  };

  if (sources.length < 3) {
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
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#92400e',
            margin: 0
          }}>
            Gap Analysis
          </h3>
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: '#a16207',
          lineHeight: '1.5',
          margin: 0
        }}>
          Collect at least 3 sources to unlock AI-powered gap analysis. This will help identify
          research opportunities and areas where additional investigation is needed.
        </p>
        <div style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#a16207'
        }}>
          Progress: {sources.length}/3 sources collected
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{
      backgroundColor: '#f0f9ff',
      border: '1px solid #0ea5e9',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginTop: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#0c4a6e',
            margin: 0
          }}>
            Literature Gap Analysis
          </h3>
          <span style={{
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            fontSize: '0.75rem',
            fontWeight: '500',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem'
          }}>
            {sources.length} sources analyzed
          </span>
        </div>

        {!analysis && (
          <button
            onClick={generateGapAnalysis}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: isLoading ? '#f3f4f6' : '#0ea5e9',
              color: isLoading ? '#6b7280' : 'white',
              border: '1px solid #0ea5e9',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? '🔄' : '🔍'}
            <span>{isLoading ? 'Analyzing...' : 'Analyze Gaps'}</span>
          </button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
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

      {isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#0369a1'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
          <div style={{ fontSize: '0.875rem' }}>
            Analyzing literature for gaps and opportunities...
          </div>
        </div>
      )}

      {analysis && (
        <div>
          {/* Overall Assessment */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#0c4a6e',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Overall Assessment
              <span style={{
                backgroundColor: analysis.confidenceLevel === 'High' ? '#dcfce7' :
                              analysis.confidenceLevel === 'Moderate' ? '#fef3c7' : '#fef2f2',
                color: analysis.confidenceLevel === 'High' ? '#166534' :
                       analysis.confidenceLevel === 'Moderate' ? '#a16207' : '#dc2626',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {analysis.confidenceLevel} Confidence
              </span>
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#1e40af',
              lineHeight: '1.5',
              margin: 0
            }}>
              {analysis.overallAssessment}
            </p>
          </div>

          {/* Key Gaps */}
          {analysis.identifiedGaps.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔍 Identified Gaps
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.identifiedGaps.slice(0, isExpanded ? undefined : 2).map((gap, index) => (
                  <div key={index} style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        backgroundColor: gap.severity === 'Critical' ? '#fef2f2' :
                                       gap.severity === 'Moderate' ? '#fef3c7' : '#f0fdf4',
                        color: gap.severity === 'Critical' ? '#dc2626' :
                               gap.severity === 'Moderate' ? '#a16207' : '#166534',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}>
                        {gap.severity}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {gap.area}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#4b5563',
                      lineHeight: '1.4',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {gap.description}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      lineHeight: '1.3',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      {gap.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Opportunities */}
          {analysis.researchOpportunities.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💡 Research Opportunities
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.researchOpportunities.slice(0, isExpanded ? undefined : 2).map((opportunity, index) => (
                  <div key={index} style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}>
                    <h5 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#166534',
                      marginBottom: '0.5rem'
                    }}>
                      {opportunity.title}
                    </h5>
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#15803d',
                      lineHeight: '1.4',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {opportunity.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}>
                        Feasibility: {opportunity.feasibility}
                      </span>
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}>
                        Impact: {opportunity.impact}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#166534',
                      lineHeight: '1.3',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      Approach: {opportunity.suggestedApproach}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expand/Collapse for long analyses */}
          {(analysis.identifiedGaps.length > 2 || analysis.researchOpportunities.length > 2) && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #0ea5e9',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                {isExpanded ? '▲ Show Less' : '▼ Show More'}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={generateGapAnalysis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <span>🔄</span>
              <span>Refresh Analysis</span>
            </button>

            <button
              onClick={() => {
                const content = `Gap Analysis for: ${researchQuestion}\n\nGenerated: ${analysis.generatedAt}\n\n${analysis.overallAssessment}\n\n${JSON.stringify(analysis, null, 2)}`;
                navigator.clipboard.writeText(content);
                alert('Analysis copied to clipboard!');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <span>📋</span>
              <span>Copy Report</span>
            </button>
          </div>

          {/* Generated timestamp */}
          <div style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            Analysis generated: {new Date(analysis.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GapAnalysis;