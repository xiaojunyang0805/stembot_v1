'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function MethodologyPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState('design');

  const userName = user?.email?.split('@')[0] || 'Research User';

  const phases = [
    { id: 'design', label: 'Research Design', icon: '🏗️', status: 'active' },
    { id: 'ethics', label: 'Ethics Review', icon: '⚖️', status: 'pending' },
    { id: 'recruitment', label: 'Participant Recruitment', icon: '👥', status: 'pending' },
    { id: 'data-collection', label: 'Data Collection', icon: '📊', status: 'pending' },
    { id: 'analysis', label: 'Data Analysis', icon: '🔬', status: 'pending' }
  ];

  const methodologyData = {
    researchType: 'Mixed Methods',
    studyDesign: 'Cross-sectional with longitudinal follow-up',
    participants: {
      target: 120,
      criteria: 'Undergraduate students aged 18-25',
      recruitment: 'University psychology participant pool',
      powerAnalysis: 'Calculated for medium effect size (d=0.5), α=0.05, power=0.80'
    },
    measures: [
      { name: 'Pittsburgh Sleep Quality Index (PSQI)', type: 'Questionnaire', duration: '5 min' },
      { name: 'Cognitive Assessment Battery', type: 'Performance', duration: '30 min' },
      { name: 'Academic Records Review', type: 'Archival', duration: 'N/A' },
      { name: 'Sleep Diary', type: 'Self-report', duration: '7 days' }
    ],
    timeline: {
      preparation: '2 weeks',
      recruitment: '4 weeks',
      dataCollection: '8 weeks',
      analysis: '6 weeks',
      writeUp: '4 weeks'
    },
    ethicsConsiderations: [
      'Informed consent procedures',
      'Data privacy and confidentiality',
      'Voluntary participation and withdrawal',
      'Minimal risk assessment',
      'Academic record access permissions'
    ]
  };

  const analysisPlans = [
    {
      question: 'How does sleep quality relate to academic performance?',
      approach: 'Pearson correlation analysis',
      variables: 'PSQI scores vs. GPA',
      assumptions: 'Normal distribution, linear relationship'
    },
    {
      question: 'Do sleep interventions improve cognitive performance?',
      approach: 'Repeated measures ANOVA',
      variables: 'Pre/post cognitive battery scores',
      assumptions: 'Sphericity, normal distribution'
    },
    {
      question: 'What predicts sleep quality in students?',
      approach: 'Multiple regression analysis',
      variables: 'Demographics, lifestyle, academic stress',
      assumptions: 'Linearity, independence, homoscedasticity'
    }
  ];

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
      {/* Professional Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Navigation */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button
              onClick={() => router.push(`/projects/${params.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2563eb'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#6b7280'; }}
            >
              ← Back to Project
            </button>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827'
            }}>
              📋 Methodology Planning
            </div>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              Sleep & Memory Study
            </span>
          </div>

          {/* User Profile */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              {userName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Phase Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {phases.map((phase, index) => (
              <div key={phase.id} style={{display: 'flex', alignItems: 'center'}}>
                <button
                  onClick={() => setSelectedPhase(phase.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    backgroundColor: selectedPhase === phase.id ? '#eff6ff' : 'transparent',
                    border: selectedPhase === phase.id ? '1px solid #bfdbfe' : '1px solid transparent',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    backgroundColor: phase.status === 'active' ? '#2563eb' :
                                   phase.status === 'completed' ? '#10b981' : '#e5e7eb',
                    color: phase.status === 'pending' ? '#9ca3af' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem'
                  }}>
                    {phase.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: selectedPhase === phase.id ? '#2563eb' : '#6b7280',
                    textAlign: 'center'
                  }}>
                    {phase.label}
                  </div>
                </button>
                {index < phases.length - 1 && (
                  <div style={{
                    width: '2rem',
                    height: '2px',
                    backgroundColor: '#e5e7eb',
                    margin: '0 0.5rem'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Research Design Phase */}
        {selectedPhase === 'design' && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
            {/* Main Design Content */}
            <div>
              {/* Study Overview */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🏗️ Study Design Overview
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Research Type
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      {methodologyData.researchType}
                    </div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Study Design
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      {methodologyData.studyDesign}
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  👥 Participant Information
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                      Target Sample Size
                    </div>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb'}}>
                      {methodologyData.participants.target}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                      Inclusion Criteria
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      {methodologyData.participants.criteria}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                      Recruitment Method
                    </div>
                    <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      {methodologyData.participants.recruitment}
                    </div>
                  </div>
                </div>
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '0.375rem',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.25rem'}}>
                    Power Analysis
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#1e40af'}}>
                    {methodologyData.participants.powerAnalysis}
                  </div>
                </div>
              </div>

              {/* Measures */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📊 Measurement Tools
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  {methodologyData.measures.map((measure, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          {measure.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {measure.type}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        color: '#374151'
                      }}>
                        {measure.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Timeline */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⏱️ Project Timeline
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  {Object.entries(methodologyData.timeline).map(([phase, duration]) => (
                    <div
                      key={phase}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        textTransform: 'capitalize'
                      }}>
                        {phase.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#2563eb'
                      }}>
                        {duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethics Checklist */}
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #fde047'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚖️ Ethics Considerations
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  {methodologyData.ethicsConsiderations.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#92400e'
                      }}
                    >
                      <span style={{fontSize: '0.75rem'}}>⚠️</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Planning (for other phases, show placeholder) */}
        {selectedPhase === 'analysis' && (
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🔬 Statistical Analysis Plan
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {analysisPlans.map((plan, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem'
                  }}>
                    Research Question {index + 1}
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                        Question
                      </div>
                      <div style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem'}}>
                        {plan.question}
                      </div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                        Statistical Approach
                      </div>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        {plan.approach}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                        Variables
                      </div>
                      <div style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem'}}>
                        {plan.variables}
                      </div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>
                        Assumptions
                      </div>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        {plan.assumptions}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for other phases */}
        {!['design', 'analysis'].includes(selectedPhase) && (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>
              {phases.find(p => p.id === selectedPhase)?.icon}
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              {phases.find(p => p.id === selectedPhase)?.label}
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              This section will be developed as you progress through your research phases.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}