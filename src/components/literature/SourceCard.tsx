/**
 * SourceCard Component - WP3 Literature Discovery
 *
 * Displays research sources with AI-generated credibility assessments,
 * plain-language explanations, and visual quality indicators for novice researchers.
 *
 * Features:
 * - Color-coded credibility indicators (High/Moderate/Low)
 * - Plain-language explanations of strengths and limitations
 * - Interactive save/toggle functionality
 * - Expandable detailed information
 * - Supabase integration for saving sources to projects
 *
 * Location: src/components/literature/SourceCard.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Types for credibility metrics breakdown
export interface CredibilityMetrics {
  journalQuality: number; // 0-30 points
  recency: number; // 0-20 points
  sampleSize: number; // 0-20 points
  methodology: number; // 0-30 points
  totalScore: number; // 0-100
}

// Types for source data and credibility assessment
export interface CredibilityAssessment {
  level: 'High' | 'Moderate' | 'Low';
  score: number; // 0-100
  strengths: string[];
  limitations: string[];
  explanation: string; // Plain-language explanation for novices
  impactFactor?: number;
  sampleSize?: number;
  publicationYear: number;
  studyType?: string;
  researchField?: string;
  metrics?: CredibilityMetrics; // Detailed scoring breakdown
}

export interface SourceData {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  abstract?: string;
  keyFindings: string[];
  relevanceExplanation: string;
  fullTextUrl?: string;
  pdfUrl?: string;
  credibility: CredibilityAssessment;
  isSaved?: boolean;
  addedToProject?: boolean;
  isUploaded?: boolean;
  documentId?: string;
  originalFileName?: string;
  uploadDate?: string;
}

interface SourceCardProps {
  source: SourceData;
  projectId: string;
  onToggleSaved?: (sourceId: string, isSaved: boolean) => void;
  onReadSummary?: (sourceId: string) => void;
  onCheckQuality?: (sourceId: string) => void;
  className?: string;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  projectId,
  onToggleSaved,
  onReadSummary,
  onCheckQuality,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(source.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  // Determine credibility colors and indicators
  const getCredibilityStyles = (level: 'High' | 'Moderate' | 'Low') => {
    switch (level) {
      case 'High':
        return {
          borderColor: '#22c55e', // green-500
          backgroundColor: '#f0fdf4', // green-50
          badgeColor: '#16a34a', // green-600
          emoji: '🟢'
        };
      case 'Moderate':
        return {
          borderColor: '#eab308', // yellow-500
          backgroundColor: '#fefce8', // yellow-50
          badgeColor: '#ca8a04', // yellow-600
          emoji: '🟡'
        };
      case 'Low':
        return {
          borderColor: '#ef4444', // red-500
          backgroundColor: '#fef2f2', // red-50
          badgeColor: '#dc2626', // red-600
          emoji: '🔴'
        };
    }
  };

  const credibilityStyles = getCredibilityStyles(source.credibility.level);

  // Handle saving source to project
  const handleToggleSaved = async () => {
    setIsSaving(true);
    try {
      const newSavedState = !isSaved;

      if (newSavedState) {
        // Save source to Supabase project_sources table
        const { error } = await supabase
          .from('project_sources')
          .insert({
            project_id: projectId,
            source_id: source.id,
            source_data: source,
            added_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        // Remove source from project
        const { error } = await supabase
          .from('project_sources')
          .delete()
          .eq('project_id', projectId)
          .eq('source_id', source.id);

        if (error) throw error;
      }

      setIsSaved(newSavedState);
      onToggleSaved?.(source.id, newSavedState);
    } catch (error) {
      console.error('Error toggling source save state:', error);
      alert('Failed to update source. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderLeft: `4px solid ${credibilityStyles.borderColor}`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        position: 'relative'
      }}
    >
      {/* Quality Indicator Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: credibilityStyles.backgroundColor,
        border: `1px solid ${credibilityStyles.borderColor}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: credibilityStyles.badgeColor
      }}>
        <span>{credibilityStyles.emoji}</span>
        <span>{source.credibility.level} Quality</span>
        {source.credibility.limitations.length > 0 && (
          <span style={{ color: '#dc2626' }}>⚠️</span>
        )}
      </div>

      {/* Title and Authors */}
      <div style={{ marginRight: '8rem', marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#111827',
          lineHeight: '1.5',
          marginBottom: '0.75rem'
        }}>
          {source.title}
        </h3>

        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontWeight: '500' }}>
            {source.authors.join(', ')}
          </span>
          {' • '}
          <span style={{ fontStyle: 'italic' }}>{source.journal}</span>
          {' • '}
          <span>{source.year}</span>
          {source.credibility.impactFactor && (
            <>
              {' • '}
              <span>Impact Factor: {source.credibility.impactFactor.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>

      {/* Key Findings Box */}
      {source.keyFindings.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔍 Key Findings
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            listStyleType: 'disc'
          }}>
            {source.keyFindings.map((finding, index) => (
              <li key={index} style={{
                fontSize: '0.875rem',
                color: '#475569',
                lineHeight: '1.5',
                marginBottom: '0.5rem'
              }}>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Relevance Explanation Box */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#15803d',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ✅ Why This Source Matters
        </h4>
        <p style={{
          fontSize: '0.875rem',
          color: '#166534',
          lineHeight: '1.5',
          margin: 0
        }}>
          {source.relevanceExplanation}
        </p>
      </div>

      {/* Credibility Explanation */}
      <div style={{
        backgroundColor: credibilityStyles.backgroundColor,
        border: `1px solid ${credibilityStyles.borderColor}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: credibilityStyles.badgeColor,
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🎓 Research Quality Explained
        </h4>
        <p style={{
          fontSize: '0.875rem',
          color: credibilityStyles.badgeColor,
          lineHeight: '1.5',
          margin: 0
        }}>
          {source.credibility.explanation}
        </p>
      </div>

      {/* Expandable Detailed Information */}
      {isExpanded && (
        <div style={{ marginBottom: '1rem' }}>
          {/* Strengths */}
          {source.credibility.strengths.length > 0 && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h5 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💪 Strengths
              </h5>
              <ul style={{
                margin: 0,
                paddingLeft: '1.25rem',
                listStyleType: 'disc'
              }}>
                {source.credibility.strengths.map((strength, index) => (
                  <li key={index} style={{
                    fontSize: '0.8rem',
                    color: '#166534',
                    lineHeight: '1.4',
                    marginBottom: '0.25rem'
                  }}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Limitations */}
          {source.credibility.limitations.length > 0 && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h5 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚠️ Limitations to Consider
              </h5>
              <ul style={{
                margin: 0,
                paddingLeft: '1.25rem',
                listStyleType: 'disc'
              }}>
                {source.credibility.limitations.map((limitation, index) => (
                  <li key={index} style={{
                    fontSize: '0.8rem',
                    color: '#991b1b',
                    lineHeight: '1.4',
                    marginBottom: '0.25rem'
                  }}>
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Abstract (if available) */}
          {source.abstract && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h5 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                📝 Abstract
              </h5>
              <p style={{
                fontSize: '0.8rem',
                color: '#475569',
                lineHeight: '1.5',
                margin: 0
              }}>
                {source.abstract}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        {/* Save/Unsave Button */}
        <button
          onClick={handleToggleSaved}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: isSaved ? '#22c55e' : '#f3f4f6',
            color: isSaved ? 'white' : '#374151',
            border: `1px solid ${isSaved ? '#22c55e' : '#d1d5db'}`,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = isSaved ? '#16a34a' : '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = isSaved ? '#22c55e' : '#f3f4f6';
            }
          }}
        >
          <span>{isSaving ? '⏳' : isSaved ? '❤️' : '🤍'}</span>
          <span>{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
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
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
          }}
        >
          <span>{isExpanded ? '▲' : '▼'}</span>
          <span>{isExpanded ? 'Less Details' : 'More Details'}</span>
        </button>

        {/* Read Summary Button */}
        <button
          onClick={() => onReadSummary?.(source.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: '1px solid #3b82f6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
          }}
        >
          <span>📖</span>
          <span>Read Summary</span>
        </button>

        {/* Full Text Link */}
        {source.fullTextUrl && (
          <a
            href={source.fullTextUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: '1px solid #10b981',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#10b981';
            }}
          >
            <span>🔗</span>
            <span>Full Text</span>
          </a>
        )}

        {/* Check Quality Button */}
        <button
          onClick={() => onCheckQuality?.(source.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: '1px solid #8b5cf6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6';
          }}
        >
          <span>🔍</span>
          <span>Check Quality</span>
        </button>
      </div>
    </div>
  );
};

export default SourceCard;