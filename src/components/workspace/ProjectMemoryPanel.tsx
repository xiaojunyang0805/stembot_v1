'use client';

import React, { useState, useEffect } from 'react';
import { LiteratureProgress, ProjectLiteratureState } from '@/lib/research/crossPhaseIntegration';
import Link from 'next/link';
import { getWritingStatus, WritingStatus } from '@/lib/ai/writingContext';
import { getMemoryPanelNudge } from '@/lib/ai/nudgeDetector';
import UsageWarning from '@/components/upgrade/UsageWarning';
import { supabase } from '@/lib/supabase';

interface BillingUsageData {
  subscription: {
    tier: string;
  };
  usage: {
    aiInteractions: {
      current: number;
      limit: number | null;
      percentage: number;
      color: string;
      unlimited: boolean;
    };
  };
}

// Question stages with colors and descriptions
const QUESTION_STAGES = {
  initial: { label: 'Initial', color: '#9ca3af', progress: 25, description: 'Starting idea' },
  emerging: { label: 'Emerging', color: '#f59e0b', progress: 50, description: 'Taking shape' },
  focused: { label: 'Focused', color: '#3b82f6', progress: 75, description: 'Clear direction' },
  'research-ready': { label: 'Research-Ready', color: '#10b981', progress: 100, description: 'Ready to research' }
};

interface QuestionVersion {
  id: string;
  text: string;
  stage: keyof typeof QUESTION_STAGES;
  createdAt: Date;
  improvements: string[];
}

interface MethodologyState {
  methodType?: string;
  status?: 'ready' | 'in-progress' | 'needs-attention';
  completedSections?: number;
  totalSections?: number;
}

interface ProjectMemoryPanelProps {
  currentQuestion?: string;
  questionStage?: keyof typeof QUESTION_STAGES;
  questionHistory?: QuestionVersion[];
  projectId?: string;
  literatureState?: ProjectLiteratureState | null;
  methodologyState?: MethodologyState | null;
  className?: string;
}

export function ProjectMemoryPanel({
  currentQuestion = "How does social media affect student performance?",
  questionStage = "emerging",
  questionHistory = [
    {
      id: '1',
      text: "Social media effects",
      stage: 'initial',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      improvements: []
    },
    {
      id: '2',
      text: "How does social media affect students?",
      stage: 'emerging',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      improvements: ['Added target population!', 'Made more specific']
    }
  ],
  projectId,
  literatureState,
  methodologyState,
  className = ""
}: ProjectMemoryPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showLiterature, setShowLiterature] = useState(false);
  const [writingStatus, setWritingStatus] = useState<WritingStatus | null>(null);
  const [writingNudge, setWritingNudge] = useState<{ message: string; actionUrl: string } | null>(null);
  const [billingData, setBillingData] = useState<BillingUsageData | null>(null);

  // Fetch writing status and billing data when component mounts
  useEffect(() => {
    if (projectId) {
      getWritingStatus(projectId).then(status => {
        setWritingStatus(status);
        if (status) {
          const nudge = getMemoryPanelNudge(status, projectId);
          setWritingNudge(nudge);
        }
      }).catch(err => {
        console.warn('Failed to fetch writing status for memory panel:', err);
      });
    }

    // Fetch billing data for usage warnings
    const fetchBillingData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
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
      } catch (error) {
        console.warn('Failed to fetch billing data for memory panel:', error);
      }
    };

    fetchBillingData();
  }, [projectId]);

  const currentStage = QUESTION_STAGES[questionStage];
  const progressPercentage = currentStage.progress;

  // Extract literature metrics
  const literatureProgress = literatureState?.literatureProgress;
  const sourceCount = literatureProgress?.sourceCount || 0;
  const gapsCount = literatureState?.gapAnalysis?.identifiedGaps.length || 0;
  const literaturePercentage = literatureProgress?.progressPercentage || 0;
  const latestSource = literatureState?.sources[0];
  const hasLiterature = sourceCount > 0;

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: '1.25rem' }}>📋</span>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          Research Question Progress
        </h3>
      </div>

      {/* Current Question */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
        borderLeft: `4px solid ${currentStage.color}`
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '500',
          color: '#6b7280',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Current Question
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: '#111827',
          margin: 0,
          lineHeight: '1.5'
        }}>
          "{currentQuestion}"
        </p>
      </div>

      {/* Progress Stages */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151'
          }}>
            Progress to Research-Ready
          </span>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: currentStage.color
          }}>
            {progressPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '0.5rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem',
          overflow: 'hidden',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: currentStage.color,
            borderRadius: '0.25rem',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Stage Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {Object.entries(QUESTION_STAGES).map(([stage, config]) => {
            const isActive = QUESTION_STAGES[questionStage].progress >= config.progress;
            const isCurrent = stage === questionStage;

            return (
              <div
                key={stage}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1
                }}
              >
                {/* Circle indicator */}
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: isActive ? config.color : '#e5e7eb',
                  border: isCurrent ? `2px solid ${config.color}` : 'none',
                  marginBottom: '0.25rem'
                }} />

                {/* Stage label */}
                <span style={{
                  fontSize: '0.625rem',
                  color: isActive ? config.color : '#9ca3af',
                  fontWeight: isCurrent ? '600' : '400',
                  textAlign: 'center'
                }}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Status */}
      <div style={{
        backgroundColor: `${currentStage.color}10`,
        padding: '0.75rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
        border: `1px solid ${currentStage.color}40`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            backgroundColor: currentStage.color
          }} />
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: currentStage.color
          }}>
            {currentStage.label} Stage
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            • {currentStage.description}
          </span>
        </div>
      </div>

      {/* Literature Review Section */}
      {hasLiterature && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          border: '1px solid #bae6fd'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>📚</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#0369a1'
              }}>
                Literature Review
              </span>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#0369a1',
              backgroundColor: '#dbeafe',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem'
            }}>
              {literaturePercentage}%
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{
                fontSize: '0.625rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Sources
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0369a1'
              }}>
                {sourceCount}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{
                fontSize: '0.625rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Gaps
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: gapsCount > 0 ? '#f59e0b' : '#10b981'
              }}>
                {gapsCount}
              </div>
            </div>
          </div>

          {latestSource && (
            <div style={{
              backgroundColor: 'white',
              padding: '0.625rem',
              borderRadius: '0.25rem',
              marginBottom: '0.75rem',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{
                fontSize: '0.625rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Latest Source
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#111827',
                lineHeight: '1.3',
                fontWeight: '500'
              }}>
                {latestSource.title.substring(0, 60)}{latestSource.title.length > 60 ? '...' : ''}
              </div>
              <div style={{
                fontSize: '0.625rem',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                {latestSource.authors[0]} ({latestSource.year})
              </div>
            </div>
          )}

          {literatureProgress && literatureProgress.nextActions.length > 0 && (
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              marginBottom: '0.75rem',
              border: '1px solid #fde68a'
            }}>
              <div style={{
                fontSize: '0.625rem',
                color: '#92400e',
                marginBottom: '0.25rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Next Action
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#78350f',
                lineHeight: '1.3'
              }}>
                {literatureProgress.nextActions[0]}
              </div>
            </div>
          )}

          {projectId && (
            <Link
              href={`/projects/${projectId}/literature`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: '#0369a1',
                color: 'white',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#075985';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#0369a1';
              }}
            >
              View Literature Review →
            </Link>
          )}
        </div>
      )}

      {/* Methodology Section */}
      {methodologyState && (
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>🔬</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#15803d'
              }}>
                Methodology
              </span>
            </div>
            {methodologyState.status === 'ready' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#15803d',
                backgroundColor: '#dcfce7',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                ✅ Ready
              </span>
            )}
            {methodologyState.status === 'in-progress' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#f59e0b',
                backgroundColor: '#fef3c7',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                In Progress
              </span>
            )}
            {methodologyState.status === 'needs-attention' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                Needs Attention
              </span>
            )}
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '0.75rem',
            border: '1px solid #dcfce7'
          }}>
            <div style={{
              fontSize: '0.625rem',
              color: '#6b7280',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Method
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#111827',
              fontWeight: '600'
            }}>
              {methodologyState.methodType || 'Experimental Design'}
            </div>
          </div>

          {methodologyState.completedSections !== undefined && methodologyState.totalSections !== undefined && (
            <div style={{
              backgroundColor: 'white',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              marginBottom: '0.75rem',
              border: '1px solid #dcfce7'
            }}>
              <div style={{
                fontSize: '0.625rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Progress
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  flex: 1,
                  height: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.25rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(methodologyState.completedSections / methodologyState.totalSections) * 100}%`,
                    height: '100%',
                    backgroundColor: '#22c55e',
                    borderRadius: '0.25rem',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#15803d',
                  whiteSpace: 'nowrap'
                }}>
                  {methodologyState.completedSections}/{methodologyState.totalSections}
                </span>
              </div>
            </div>
          )}

          {projectId && (
            <Link
              href={`/projects/${projectId}/methodology`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: '#15803d',
                color: 'white',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#166534';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#15803d';
              }}
            >
              View Details →
            </Link>
          )}
        </div>
      )}

      {/* Writing Progress Nudge */}
      {writingNudge && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          border: '1px solid #fde68a'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>💡</span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#92400e'
            }}>
              Writing Tip
            </span>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: '#78350f',
            margin: 0,
            marginBottom: '0.75rem',
            lineHeight: '1.4'
          }}>
            {writingNudge.message}
          </p>

          <Link
            href={writingNudge.actionUrl}
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#d97706';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#f59e0b';
            }}
          >
            Continue Writing →
          </Link>
        </div>
      )}

      {/* Usage Warning for Free Users */}
      {billingData && billingData.subscription.tier === 'free' && (
        <div style={{ marginBottom: '1rem' }}>
          <UsageWarning
            current={billingData.usage.aiInteractions.current}
            limit={billingData.usage.aiInteractions.limit}
            tier="free"
            feature="ai_chat"
            compact={true}
            showUpgradeButton={true}
          />
        </div>
      )}

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: showHistory ? '#f3f4f6' : 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#374151',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!showHistory) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (!showHistory) {
            (e.target as HTMLButtonElement).style.backgroundColor = 'white';
          }
        }}
      >
        <span>Question Evolution History</span>
        <span style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {/* Expandable History */}
      {showHistory && (
        <div style={{
          marginTop: '1rem',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            All Versions ({questionHistory.length + 1})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Current version */}
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '0.75rem',
              border: '1px solid #bae6fd'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#0369a1',
                  backgroundColor: '#dbeafe',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  CURRENT • {currentStage.label.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  Now
                </span>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#111827',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                "{currentQuestion}"
              </p>
              {questionHistory.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.25rem'
                }}>
                  {questionHistory[questionHistory.length - 1].improvements.map((improvement, index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: '0.625rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem'
                      }}
                    >
                      ✨ {improvement}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Previous versions */}
            {questionHistory.slice().reverse().map((version, index) => {
              const versionStage = QUESTION_STAGES[version.stage];
              return (
                <div
                  key={version.id}
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    marginBottom: '0.75rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: versionStage.color,
                      backgroundColor: `${versionStage.color}20`,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      V{questionHistory.length - index} • {versionStage.label.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {version.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    margin: 0,
                    marginBottom: '0.5rem'
                  }}>
                    "{version.text}"
                  </p>
                  {version.improvements.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.25rem'
                    }}>
                      {version.improvements.map((improvement, improvementIndex) => (
                        <span
                          key={improvementIndex}
                          style={{
                            fontSize: '0.625rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem'
                          }}
                        >
                          ✨ {improvement}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMemoryPanel;