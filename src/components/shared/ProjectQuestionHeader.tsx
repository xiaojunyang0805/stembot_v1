/**
 * Project Question Header Component
 *
 * Displays the current research question prominently across all project phases
 * Provides quick access to question details and progress
 */

'use client';

import React from 'react';
import { analyzeQuestionProgressCached as analyzeQuestionProgress } from '../../lib/research/cachedQuestionAnalyzer';

interface ProjectQuestionHeaderProps {
  question: string;
  currentPhase: 'question' | 'literature' | 'methodology' | 'writing';
  projectTitle?: string;
  showProgress?: boolean;
  onEdit?: () => void;
  className?: string;
}

const PHASE_LABELS = {
  question: 'Exploring Your Question',
  literature: 'Finding Sources',
  methodology: 'Planning Your Study',
  writing: 'Writing & Analysis'
};

const PHASE_ICONS = {
  question: '❓',
  literature: '📚',
  methodology: '🔬',
  writing: '✍️'
};

const PHASE_CONTEXTS = {
  question: 'Developing your research focus',
  literature: 'Building your knowledge base',
  methodology: 'Planning your approach',
  writing: 'Sharing your findings'
};

export function ProjectQuestionHeader({
  question,
  currentPhase,
  projectTitle,
  showProgress = true,
  onEdit,
  className = ""
}: ProjectQuestionHeaderProps) {
  // Analyze question progress
  const progressAnalysis = analyzeQuestionProgress(question);

  const getStageColor = (stage: string) => {
    const colors = {
      initial: '#9ca3af',      // gray
      emerging: '#f59e0b',     // yellow
      focused: '#3b82f6',      // blue
      'research-ready': '#10b981' // green
    };
    return colors[stage as keyof typeof colors] || '#9ca3af';
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Phase Context */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <span style={{ fontSize: '1rem' }}>{PHASE_ICONS[currentPhase]}</span>
        <span style={{ fontWeight: '500' }}>
          {PHASE_LABELS[currentPhase]}
        </span>
        <span>•</span>
        <span>{PHASE_CONTEXTS[currentPhase]}</span>
      </div>

      {/* Research Question */}
      <div style={{ marginBottom: showProgress ? '1rem' : '0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem'
            }}>
              Research Question
            </div>
            <p style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              lineHeight: '1.6',
              margin: 0
            }}>
              "{question}"
            </p>
            {projectTitle && (
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem',
                margin: 0
              }}>
                Project: {projectTitle}
              </p>
            )}
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: '#374151',
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
              Edit Question
            </button>
          )}
        </div>
      </div>

      {/* Subtle Progress Indicator */}
      {showProgress && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          border: '1px solid #f3f4f6'
        }}>
          {/* Subtle Stage Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '0.375rem',
              height: '0.375rem',
              borderRadius: '50%',
              backgroundColor: getStageColor(progressAnalysis.stage),
              opacity: 0.8
            }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '400',
              color: '#6b7280'
            }}>
              {progressAnalysis.stage === 'research-ready' ? '✨ Ready to research' :
               progressAnalysis.stage === 'focused' ? 'Taking shape' :
               progressAnalysis.stage === 'emerging' ? 'Developing' : 'Starting out'}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ flex: 1, maxWidth: '200px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Question Progress
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: getStageColor(progressAnalysis.stage)
              }}>
                {progressAnalysis.progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '0.375rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '0.25rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressAnalysis.progress}%`,
                height: '100%',
                backgroundColor: getStageColor(progressAnalysis.stage),
                borderRadius: '0.25rem',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Gentle Next Steps Hint */}
          {progressAnalysis.recommendations.length > 0 && progressAnalysis.stage !== 'research-ready' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              {progressAnalysis.stage === 'initial' ? '💭 What aspect interests you most?' :
               progressAnalysis.stage === 'emerging' ? '🔍 Consider what you want to measure' :
               '🎯 Think about your target audience'}
            </div>
          )}

          {/* Celebration for research-ready */}
          {progressAnalysis.stage === 'research-ready' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#10b981',
              fontWeight: '500'
            }}>
              🎉 Your question looks ready for research!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectQuestionHeader;