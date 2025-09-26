/**
 * Methodology Planning Interface
 * Experimental design guidance with AI recommendations and validation
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Target,
  Users,
  Calculator,
  BarChart3,
  Code,
  FileText,
  Brain,
  Lightbulb,
  TrendingUp
} from 'lucide-react'

// Types for the methodology interface
interface DesignVariable {
  type: 'independent' | 'dependent' | 'confounding'
  name: string
  description: string
}

interface DesignRecommendation {
  researchQuestion: string
  approach: string
  variables: DesignVariable[]
  sampleSize: number
  alternatives: string[]
}

interface DesignIssue {
  type: 'critical' | 'caution'
  title: string
  description: string
  recommendation: string
  severity: 'high' | 'medium' | 'low'
}

interface PowerAnalysis {
  sampleSize: number
  effectSize: number
  power: number
  alpha: number
  recommendedTests: string[]
}

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category: string
}

export default function MethodologyPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [projectTitle, setProjectTitle] = useState('Research Project')
  const [loading, setLoading] = useState(true)
  const [designRecommendation, setDesignRecommendation] = useState<DesignRecommendation | null>(null)
  const [designIssues, setDesignIssues] = useState<DesignIssue[]>([])
  const [powerAnalysis, setPowerAnalysis] = useState<PowerAnalysis | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false)
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false)

  useEffect(() => {
    if (projectId) {
      initializeMethodologyInterface()
    }
  }, [projectId])

  const initializeMethodologyInterface = async () => {
    try {
      // Fetch actual project data
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')

      const data = await response.json()
      const project = data.projects?.find((p: any) => p.id === projectId)

      if (project) {
        setProjectTitle(project.title || 'Research Project')
        const projectLower = project.title.toLowerCase()

        if (projectLower.includes('electrochemical') || projectLower.includes('sensor')) {
          // Electrochemical sensor specific methodology
          const electrochemicalRecommendation: DesignRecommendation = {
            researchQuestion: `How to optimize ${project.title} for enhanced sensitivity and selectivity?`,
            approach: "🔬 Experimental Optimization Design",
            variables: [
              { type: 'independent', name: 'Electrode material', description: 'Carbon, Gold, Platinum electrodes' },
              { type: 'independent', name: 'Surface modification', description: 'Nanoparticles, polymers, biomolecules' },
              { type: 'dependent', name: 'Sensitivity', description: 'Detection limit in nM range' },
              { type: 'dependent', name: 'Selectivity', description: 'Response ratio to interferents' },
              { type: 'confounding', name: 'pH', description: 'Buffer pH control (6.0-8.0)' },
              { type: 'confounding', name: 'Temperature', description: 'Room temperature (25±2°C)' }
            ],
            sampleSize: 45,
            alternatives: [
              "📊 Factorial design for multiple parameter optimization",
              "Response surface methodology (RSM) for optimal conditions",
              "Taguchi method for robust parameter design"
            ]
          }

          const electrochemicalIssues: DesignIssue[] = [
            {
              type: 'critical',
              title: 'Electrode reproducibility: Surface preparation is crucial',
              description: 'Inconsistent electrode preparation can lead to high variability',
              recommendation: 'Standardize polishing and cleaning protocols',
              severity: 'high'
            },
            {
              type: 'caution',
              title: 'Interferent testing: Real sample matrix effects',
              description: 'Lab buffer results may differ from biological samples',
              recommendation: 'Include spiked real sample validation',
              severity: 'medium'
            },
            {
              type: 'caution',
              title: 'Stability testing: Long-term electrode performance',
              description: 'Modified electrodes may degrade over time',
              recommendation: 'Include 30-day stability study in protocol',
              severity: 'medium'
            }
          ]

          const electrochemicalPower: PowerAnalysis = {
            sampleSize: 45,
            effectSize: 0.6,
            power: 0.85,
            alpha: 0.05,
            recommendedTests: [
              'Two-way ANOVA (material × modification)',
              'Tukey HSD for post-hoc comparisons',
              'Linear regression for calibration curves',
              'LOD/LOQ calculations per ICH guidelines'
            ]
          }

          const electrochemicalChecklist: ChecklistItem[] = [
            { id: '1', text: 'Prepare electrode polishing protocol', completed: false, category: 'Preparation' },
            { id: '2', text: 'Validate electrochemical cell setup', completed: false, category: 'Equipment' },
            { id: '3', text: 'Prepare stock solutions and buffers', completed: false, category: 'Materials' },
            { id: '4', text: 'Calibrate potentiostat', completed: false, category: 'Equipment' },
            { id: '5', text: 'Design experiment matrix', completed: false, category: 'Planning' },
            { id: '6', text: 'Set up data acquisition parameters', completed: false, category: 'Methods' }
          ]

          setDesignRecommendation(electrochemicalRecommendation)
          setDesignIssues(electrochemicalIssues)
          setPowerAnalysis(electrochemicalPower)
          setChecklist(electrochemicalChecklist)
        } else {
          // Generic research methodology
          const genericRecommendation: DesignRecommendation = {
            researchQuestion: project.description || `What are the key factors influencing ${project.title}?`,
            approach: "🔬 Mixed Methods Approach",
            variables: [
              { type: 'independent', name: 'Primary Factor', description: 'Main variable of interest' },
              { type: 'dependent', name: 'Outcome Measure', description: 'Primary outcome to measure' },
              { type: 'confounding', name: 'Context', description: 'Environmental factors' }
            ],
            sampleSize: 50,
            alternatives: [
              "📊 Qualitative case study approach",
              "Longitudinal observational design",
              "Cross-sectional survey methodology"
            ]
          }

          setDesignRecommendation(genericRecommendation)
          setDesignIssues([
            {
              type: 'caution',
              title: 'Sample size considerations',
              description: 'Ensure adequate power for your analysis',
              recommendation: 'Conduct power analysis before data collection',
              severity: 'medium'
            }
          ])
          setPowerAnalysis({
            sampleSize: 50,
            effectSize: 0.5,
            power: 0.80,
            alpha: 0.05,
            recommendedTests: ['Appropriate statistical tests based on data type']
          })
          setChecklist([
            { id: '1', text: 'Define research objectives', completed: false, category: 'Planning' },
            { id: '2', text: 'Design data collection instruments', completed: false, category: 'Methods' },
            { id: '3', text: 'Plan analysis strategy', completed: false, category: 'Analysis' }
          ])
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching project:', error)
      setLoading(false)
    }
  }

  const generateNewRecommendation = async () => {
    setIsGeneratingRecommendation(true)
    // Simulate AI generation
    setTimeout(() => {
      setIsGeneratingRecommendation(false)
    }, 2000)
  }

  const runHealthCheck = async () => {
    setIsRunningHealthCheck(true)
    // Simulate health check analysis
    setTimeout(() => {
      setIsRunningHealthCheck(false)
    }, 1500)
  }

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const getIssueColor = (type: string) => {
    return type === 'critical' ? '#dc2626' : '#f59e0b'
  }

  const getVariableIcon = (type: string) => {
    switch (type) {
      case 'independent': return '🎯'
      case 'dependent': return '📊'
      case 'confounding': return '⚠️'
      default: return '📝'
    }
  }

  const completedCount = checklist.filter(item => item.completed).length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280' }}>Loading methodology planning...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => router.push(`/projects/${projectId}`)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Project
              </button>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: '0',
                  fontFamily: 'Georgia, serif'
                }}>Methodology Planning - {projectTitle}</h1>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => router.push(`/projects/${projectId}/writing`)}
                style={{
                  backgroundColor: completedCount >= 6 ? '#10b981' : '#d1d5db',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: completedCount >= 6 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Continue to Writing
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Design Recommendation Section */}
        {designRecommendation && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Brain style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0'
              }}>📋 Research Design (AI-Recommended)</h2>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic',
              marginBottom: '16px'
            }}>
              Based on your research question: "{designRecommendation.researchQuestion}"
            </p>

            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#059669',
              marginBottom: '8px'
            }}>Recommended Approach</h3>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
              {designRecommendation.approach}
            </p>

            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>Key Variables:</h4>

            {designRecommendation.variables.map((variable, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{
                  color: '#10b981',
                  marginRight: '8px',
                  fontSize: '16px'
                }}>✓</span>
                <div>
                  <span style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {getVariableIcon(variable.type)} {variable.name}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginLeft: '8px'
                  }}>
                    ({variable.type})
                  </span>
                </div>
              </div>
            ))}

            <p style={{
              fontSize: '14px',
              color: '#374151',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <strong>Recommended sample size:</strong> {designRecommendation.sampleSize} participants
            </p>

            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '16px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Alternative Approaches:</h4>
              <ul style={{ margin: '0', paddingLeft: '16px' }}>
                {designRecommendation.alternatives.map((alt, index) => (
                  <li key={index} style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>{alt}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={generateNewRecommendation}
                disabled={isGeneratingRecommendation}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  marginRight: '8px',
                  cursor: isGeneratingRecommendation ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {isGeneratingRecommendation ? 'Generating...' : 'Generate New'}
              </button>
              <button
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Use This Design
              </button>
            </div>
          </div>
        )}

        {/* Design Health Check Section */}
        {designIssues.length > 0 && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0'
              }}>⚠️ Design Health Check</h2>
            </div>

            {designIssues.map((issue, index) => (
              <div key={index} style={{
                borderLeft: `4px solid ${getIssueColor(issue.type)}`,
                paddingLeft: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  {issue.type === 'critical' ? (
                    <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626', marginTop: '2px', marginRight: '8px' }} />
                  ) : (
                    <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b', marginTop: '2px', marginRight: '8px' }} />
                  )}
                  <div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: issue.type === 'critical' ? '#dc2626' : '#f59e0b',
                      marginBottom: '4px',
                      margin: '0'
                    }}>{issue.title}</h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#4b5563',
                      margin: '4px 0'
                    }}>{issue.description}</p>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginLeft: '20px',
                      margin: '0'
                    }}>
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <button
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      marginRight: '8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Fix Issue
                  </button>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={runHealthCheck}
              disabled={isRunningHealthCheck}
              style={{
                backgroundColor: isRunningHealthCheck ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: isRunningHealthCheck ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                marginTop: '12px'
              }}
            >
              {isRunningHealthCheck ? 'Running Health Check...' : 'Re-run Health Check'}
            </button>
          </div>
        )}

        {/* Statistical Planning Section */}
        {powerAnalysis && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Calculator style={{ width: '20px', height: '20px', color: '#6366f1' }} />
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0'
              }}>📊 Statistical Planning</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Sample Size: <strong>{powerAnalysis.sampleSize}</strong></p>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Effect Size: <strong>{powerAnalysis.effectSize}</strong></p>
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Statistical Power: <strong>{powerAnalysis.power}</strong></p>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Alpha Level: <strong>{powerAnalysis.alpha}</strong></p>
              </div>
            </div>

            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>Recommended Statistical Tests:</h3>

            <ul style={{
              listStyle: 'disc',
              paddingLeft: '20px',
              fontSize: '14px',
              color: '#4b5563',
              marginBottom: '16px'
            }}>
              {powerAnalysis.recommendedTests.map((test, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{test}</li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  marginRight: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Code style={{ width: '14px', height: '14px', marginRight: '4px', display: 'inline' }} />
                R Code
              </button>
              <button
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Code style={{ width: '14px', height: '14px', marginRight: '4px', display: 'inline' }} />
                SPSS Syntax
              </button>
            </div>
          </div>
        )}

        {/* Interactive Checklist Section */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0'
            }}>📝 Next Steps Checklist</h2>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              marginLeft: 'auto'
            }}>
              {completedCount}/{checklist.length} completed
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {checklist.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  style={{
                    marginRight: '12px',
                    width: '16px',
                    height: '16px'
                  }}
                />
                <label style={{
                  fontSize: '14px',
                  color: item.completed ? '#6b7280' : '#374151',
                  cursor: 'pointer',
                  textDecoration: item.completed ? 'line-through' : 'none'
                }}>
                  {item.text}
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginLeft: '8px'
                  }}>({item.category})</span>
                </label>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Save Progress
            </button>
            <button
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Generate Report
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                color: '#6b7280',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Export Checklist
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderTop: '1px solid #e5e7eb',
          marginTop: '24px'
        }}>
          <button
            onClick={() => router.push(`/projects/${projectId}/literature`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Previous: Literature
          </button>
          <button
            onClick={() => router.push(`/projects/${projectId}/writing`)}
            disabled={completedCount < 6}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: completedCount >= 6 ? '#2563eb' : '#d1d5db',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: completedCount >= 6 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Next Phase: Writing
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}