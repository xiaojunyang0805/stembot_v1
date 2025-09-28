'use client';

import { useState } from 'react';

interface MethodologyStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'flagged';
  validationScore: number;
  aiComments: string[];
  requiredInputs: string[];
  completedInputs: string[];
}

interface DesignFlaw {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'sampling' | 'ethics' | 'validity' | 'reliability' | 'confounding';
  description: string;
  recommendation: string;
  confidence: number;
}

interface MethodologyGuideProps {
  currentProjectId?: string;
  onMethodologyUpdate?: (methodology: any) => void;
  className?: string;
}

export default function MethodologyGuide({
  currentProjectId,
  onMethodologyUpdate,
  className = ''
}: MethodologyGuideProps) {
  const [activeStep, setActiveStep] = useState<string>('design');
  const [analysisMode, setAnalysisMode] = useState<'guided' | 'review' | 'validate'>('guided');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFlaws, setDetectedFlaws] = useState<DesignFlaw[]>([]);

  const methodologySteps: MethodologyStep[] = [
    {
      id: 'design',
      title: 'Research Design',
      description: 'Choose your overall research approach and strategy',
      status: 'in_progress',
      validationScore: 0.75,
      aiComments: [
        'Cross-sectional design appropriate for exploring correlations',
        'Consider adding longitudinal component for causal inference'
      ],
      requiredInputs: ['Research Type', 'Design Rationale', 'Timeline'],
      completedInputs: ['Research Type']
    },
    {
      id: 'participants',
      title: 'Participants & Sampling',
      description: 'Define your target population and sampling strategy',
      status: 'pending',
      validationScore: 0.0,
      aiComments: [],
      requiredInputs: ['Population', 'Sample Size', 'Recruitment', 'Inclusion Criteria'],
      completedInputs: []
    },
    {
      id: 'measures',
      title: 'Measures & Instruments',
      description: 'Select validated instruments and measurement approaches',
      status: 'pending',
      validationScore: 0.0,
      aiComments: [],
      requiredInputs: ['Primary Measures', 'Secondary Measures', 'Validity Evidence'],
      completedInputs: []
    },
    {
      id: 'procedure',
      title: 'Data Collection Procedure',
      description: 'Plan your data collection protocol step by step',
      status: 'pending',
      validationScore: 0.0,
      aiComments: [],
      requiredInputs: ['Protocol Steps', 'Environment', 'Duration', 'Quality Control'],
      completedInputs: []
    },
    {
      id: 'analysis',
      title: 'Statistical Analysis Plan',
      description: 'Outline your analytical approach and statistical tests',
      status: 'pending',
      validationScore: 0.0,
      aiComments: [],
      requiredInputs: ['Primary Analysis', 'Secondary Analysis', 'Assumptions'],
      completedInputs: []
    },
    {
      id: 'ethics',
      title: 'Ethical Considerations',
      description: 'Address ethical issues and IRB requirements',
      status: 'pending',
      validationScore: 0.0,
      aiComments: [],
      requiredInputs: ['IRB Protocol', 'Consent Process', 'Risk Assessment'],
      completedInputs: []
    }
  ];

  const mockDesignFlaws: DesignFlaw[] = [
    {
      id: 'flaw-1',
      severity: 'high',
      category: 'sampling',
      description: 'Convenience sampling from single university may limit generalizability',
      recommendation: 'Consider stratified sampling across multiple institutions or acknowledge limitations',
      confidence: 0.87
    },
    {
      id: 'flaw-2',
      severity: 'medium',
      category: 'confounding',
      description: 'Sleep patterns may be confounded by academic stress levels during exam periods',
      recommendation: 'Control for academic calendar timing or measure stress as covariate',
      confidence: 0.82
    },
    {
      id: 'flaw-3',
      severity: 'low',
      category: 'validity',
      description: 'Self-reported sleep measures may have recall bias',
      recommendation: 'Consider objective measures (actigraphy) or daily sleep diaries',
      confidence: 0.79
    }
  ];

  const getSeverityColor = (severity: DesignFlaw['severity']) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: DesignFlaw['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📝';
    }
  };

  const getStepStatusColor = (status: MethodologyStep['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#2563eb';
      case 'flagged': return '#dc2626';
      case 'pending': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getStepStatusIcon = (status: MethodologyStep['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'flagged': return '🚩';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const handleRunValidation = async () => {
    setIsAnalyzing(true);
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDetectedFlaws(mockDesignFlaws);
    setIsAnalyzing(false);
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#2563eb',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <span style={{fontSize: '1.5rem'}}>🔬</span>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0
          }}>
            Methodology Guide
          </h2>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            AI-Powered Design Review
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          {[
            { id: 'guided', label: '🎯 Guided Setup', icon: '🎯' },
            { id: 'review', label: '📋 Design Review', icon: '📋' },
            { id: 'validate', label: '🔍 Flaw Detection', icon: '🔍' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAnalysisMode(mode.id as any)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: analysisMode === mode.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        padding: '1.5rem'
      }}>
        {analysisMode === 'guided' && (
          <div>
            {/* Progress Overview */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                Methodology Development Progress
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {methodologySteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    style={{
                      padding: '1rem',
                      backgroundColor: activeStep === step.id ? '#eff6ff' : '#f9fafb',
                      border: activeStep === step.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: getStepStatusColor(step.status)
                      }}>
                        {getStepStatusIcon(step.status)}
                      </span>
                      <h4 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: 0
                      }}>
                        {step.title}
                      </h4>
                    </div>

                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4'
                    }}>
                      {step.description}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        {step.completedInputs.length}/{step.requiredInputs.length} complete
                      </span>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${step.validationScore * 100}%`,
                          height: '100%',
                          backgroundColor: getStepStatusColor(step.status)
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {analysisMode === 'validate' && (
          <div>
            {/* Validation Controls */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  AI Design Validation
                </h3>
                <button
                  onClick={handleRunValidation}
                  disabled={isAnalyzing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isAnalyzing ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isAnalyzing ? '🔄 Analyzing...' : '🔍 Run Full Validation'}
                </button>
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                AI will review your methodology for potential design flaws, validity threats,
                and ethical considerations. This analysis considers best practices from
                educational psychology and sleep research.
              </div>
            </div>

            {/* Detected Flaws */}
            {detectedFlaws.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Design Review Results
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {detectedFlaws.map((flaw) => (
                    <div
                      key={flaw.id}
                      style={{
                        padding: '1.5rem',
                        backgroundColor: '#fefefe',
                        border: `1px solid ${getSeverityColor(flaw.severity)}30`,
                        borderLeft: `4px solid ${getSeverityColor(flaw.severity)}`,
                        borderRadius: '0.375rem'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{fontSize: '1rem'}}>
                            {getSeverityIcon(flaw.severity)}
                          </span>
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            color: getSeverityColor(flaw.severity),
                            textTransform: 'uppercase'
                          }}>
                            {flaw.severity} Priority
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px'
                          }}>
                            {flaw.category}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          {Math.round(flaw.confidence * 100)}% confidence
                        </span>
                      </div>

                      <div style={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        marginBottom: '1rem',
                        lineHeight: '1.5'
                      }}>
                        <strong>Issue:</strong> {flaw.description}
                      </div>

                      <div style={{
                        fontSize: '0.875rem',
                        color: '#059669',
                        backgroundColor: '#f0fdf4',
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        lineHeight: '1.5'
                      }}>
                        <strong>💡 Recommendation:</strong> {flaw.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {analysisMode === 'review' && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📋</div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Design Review Mode
            </div>
            <div style={{fontSize: '0.875rem'}}>
              Comprehensive methodology review interface coming soon...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}