'use client';

import React, { useState } from 'react';

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

interface ProjectMemoryPanelProps {
  currentQuestion?: string;
  questionStage?: keyof typeof QUESTION_STAGES;
  questionHistory?: QuestionVersion[];
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
  className = ""
}: ProjectMemoryPanelProps) {
  const [showHistory, setShowHistory] = useState(false);

  const currentStage = QUESTION_STAGES[questionStage];
  const progressPercentage = currentStage.progress;

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