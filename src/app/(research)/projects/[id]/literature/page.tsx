/**
 * Literature Review Interface
 * Curated, novice-friendly source management with AI guidance
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  BookOpen,
  ExternalLink,
  Eye,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface LiteratureSource {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  keyFindings: string
  relevanceScore: number
  qualityLevel: 'high' | 'moderate' | 'low'
  relevanceText: string
  warningFlags?: string[]
  citationCount: number
  url: string
}

interface SearchSuggestion {
  terms: string[]
  databases: string[]
  reasoning: string
}

interface GapAnalysis {
  insights: string[]
  identifiedGaps: string[]
  recommendations: string[]
}

export default function LiteratureReviewPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [projectTitle, setProjectTitle] = useState('Research Project')
  const [loading, setLoading] = useState(true)
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion>({
    terms: [],
    databases: [],
    reasoning: ''
  })

  const [sources, setSources] = useState<LiteratureSource[]>([])
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis>({
    insights: [],
    identifiedGaps: [],
    recommendations: []
  })

  // Fetch project data on mount
  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')

      const data = await response.json()
      const project = data.projects?.find((p: any) => p.id === projectId)

      if (project) {
        setProjectTitle(project.title || 'Research Project')

        // Generate content based on project type
        const projectLower = project.title.toLowerCase()

        if (projectLower.includes('electrochemical') || projectLower.includes('sensor')) {
          // Electrochemical sensor specific content
          setSearchSuggestions({
            terms: ['"electrochemical sensors"', '"biosensors"', '"electrode materials"', '"sensitivity optimization"'],
            databases: ['Web of Science', 'IEEE Xplore', 'ScienceDirect'],
            reasoning: 'Based on your electrochemical sensor project, search for: "electrochemical sensors" + "selectivity" + your target analyte'
          })

          setSources(generateElectrochemicalSources())
          setGapAnalysis(generateElectrochemicalGapAnalysis())
        } else {
          // Generic research content
          setSearchSuggestions({
            terms: [`"${project.subject}"`, '"research methods"', '"recent advances"'],
            databases: ['Google Scholar', 'PubMed', 'Web of Science'],
            reasoning: `Based on your ${project.subject} research, explore recent publications and methodological approaches in your field`
          })

          setSources(generateGenericSources(project))
          setGapAnalysis(generateGenericGapAnalysis(project))
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching project:', error)
      setLoading(false)
    }
  }

  const generateElectrochemicalSources = (): LiteratureSource[] => [
    {
      id: 'src-1',
      title: 'Recent Advances in Electrochemical Biosensor Development',
      authors: ['Wang, X.', 'Liu, J.', 'Zhang, Y.'],
      journal: 'Biosensors and Bioelectronics',
      year: 2024,
      keyFindings: 'Comprehensive review of nanostructured electrodes, detection limits reaching femtomolar range',
      relevanceScore: 0.95,
      qualityLevel: 'high',
      relevanceText: 'Excellent overview of current electrode materials and surface modifications',
      citationCount: 342,
      url: 'https://example.com/electrochemical-biosensor-advances'
    },
    {
      id: 'src-2',
      title: 'Carbon-Based Nanomaterials for Electrochemical Sensing Applications',
      authors: ['Chen, M.', 'Kumar, A.', 'Park, S.'],
      journal: 'Analytical Chemistry',
      year: 2024,
      keyFindings: 'Graphene and CNT electrodes show 10x sensitivity improvement for biomolecule detection',
      relevanceScore: 0.89,
      qualityLevel: 'high',
      relevanceText: 'Directly relevant for electrode material selection in your sensor design',
      citationCount: 156,
      url: 'https://example.com/carbon-nanomaterials-sensing'
    },
    {
      id: 'src-3',
      title: 'Selectivity Enhancement Strategies in Electrochemical Sensors',
      authors: ['Rodriguez, P.', 'Smith, J.', 'Lee, K.'],
      journal: 'Trends in Analytical Chemistry',
      year: 2023,
      keyFindings: 'Molecular imprinting and aptamer functionalization improve selectivity by 100-fold',
      relevanceScore: 0.92,
      qualityLevel: 'high',
      relevanceText: 'Critical insights for addressing selectivity vs sensitivity trade-offs',
      warningFlags: ['Complex fabrication procedures may limit scalability'],
      citationCount: 198,
      url: 'https://example.com/selectivity-enhancement'
    },
    {
      id: 'src-4',
      title: 'Screen-Printed Electrodes for Point-of-Care Diagnostics',
      authors: ['Martinez, A.', 'Wilson, R.'],
      journal: 'Sensors and Actuators B',
      year: 2024,
      keyFindings: 'Low-cost fabrication methods achieving clinical-grade sensitivity',
      relevanceScore: 0.81,
      qualityLevel: 'moderate',
      relevanceText: 'Good reference for practical sensor implementation',
      citationCount: 89,
      url: 'https://example.com/screen-printed-electrodes'
    },
    {
      id: 'src-5',
      title: 'Machine Learning in Electrochemical Sensor Data Analysis',
      authors: ['Thompson, D.', 'Zhang, L.', 'Patel, R.'],
      journal: 'ACS Sensors',
      year: 2024,
      keyFindings: 'ML algorithms improve detection accuracy by 35% in complex matrices',
      relevanceScore: 0.78,
      qualityLevel: 'high',
      relevanceText: 'Innovative approach for data analysis and calibration',
      warningFlags: ['Requires significant dataset for training'],
      citationCount: 67,
      url: 'https://example.com/ml-electrochemical-sensors'
    }
  ]

  const generateGenericSources = (project: any): LiteratureSource[] => [
    {
      id: 'src-1',
      title: `Recent Advances in ${project.subject || 'Research'} Studies`,
      authors: ['Author, A.', 'Researcher, B.'],
      journal: 'Journal of Advanced Research',
      year: 2024,
      keyFindings: 'Comprehensive review of current methodologies and findings in the field',
      relevanceScore: 0.85,
      qualityLevel: 'high',
      relevanceText: 'Provides excellent theoretical foundation for your research',
      citationCount: 145,
      url: 'https://example.com/recent-advances'
    },
    {
      id: 'src-2',
      title: `Methodological Approaches in ${project.subject || 'Research'}`,
      authors: ['Smith, C.', 'Jones, D.'],
      journal: 'Research Methods Quarterly',
      year: 2023,
      keyFindings: 'Comparison of quantitative and qualitative approaches with practical examples',
      relevanceScore: 0.78,
      qualityLevel: 'moderate',
      relevanceText: 'Useful for methodology design considerations',
      citationCount: 92,
      url: 'https://example.com/methodology-approaches'
    }
  ]

  const generateElectrochemicalGapAnalysis = (): GapAnalysis => ({
    insights: [
      'Most electrochemical sensors focus on single-analyte detection, limiting real-world applications in complex matrices',
      'Trade-off between sensitivity and selectivity remains a key challenge in sensor development',
      'Nanostructured electrodes show promise but face reproducibility and scalability issues'
    ],
    identifiedGaps: [
      'Limited studies on long-term stability of modified electrodes in biological fluids',
      'Need for standardized protocols for electrode surface characterization',
      'Insufficient research on multiplexed detection systems for simultaneous multi-analyte sensing',
      'Gap in understanding fouling mechanisms and mitigation strategies'
    ],
    recommendations: [
      'Investigate hybrid nanomaterials combining carbon and metal nanoparticles for enhanced performance',
      'Develop in-situ regeneration methods to extend sensor lifetime',
      'Consider machine learning approaches for signal processing and interference correction',
      'Implement rigorous validation protocols with real samples alongside standard solutions'
    ]
  })

  const generateGenericGapAnalysis = (project: any): GapAnalysis => ({
    insights: [
      `Current research in ${project.subject || 'this field'} shows promising developments but lacks comprehensive integration`,
      'Interdisciplinary approaches are underutilized in addressing complex research questions',
      'Most studies focus on short-term outcomes rather than longitudinal impacts'
    ],
    identifiedGaps: [
      'Need for larger, more diverse sample populations in studies',
      'Limited replication studies to validate key findings',
      'Insufficient exploration of practical applications',
      'Gap between theoretical frameworks and empirical validation'
    ],
    recommendations: [
      'Design studies with both exploratory and confirmatory phases',
      'Include diverse perspectives and methodological approaches',
      'Consider real-world applicability in research design',
      'Collaborate with practitioners to ensure relevance'
    ]
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280' }}>Loading literature review...</p>
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

  const handleBackToProject = () => {
    router.push(`/projects/${projectId}`)
  }

  const handleSearchDatabase = (database: string) => {
    console.log(`Searching ${database}...`)
  }

  const handleAddToLibrary = (sourceId: string) => {
    console.log(`Adding source ${sourceId} to library`)
  }

  const handleViewSource = (url: string) => {
    window.open(url, '_blank')
  }

  const getQualityIndicatorColor = (quality: string) => {
    switch (quality) {
      case 'high': return '#10b981'
      case 'moderate': return '#f59e0b'
      case 'low': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header Section */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <button
              onClick={handleBackToProject}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Project
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                lineHeight: '1.2',
                margin: 0,
                fontFamily: 'Georgia, serif'
              }}>
                Literature Review - {projectTitle}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Search Strategy Section */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{
            backgroundColor: '#f0f8ff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <Search style={{ width: '24px', height: '24px', color: '#3b82f6', marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  margin: 0
                }}>
                  🔍 Search Strategy (Memory-Guided)
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  margin: '0 0 16px 0',
                  lineHeight: '1.5'
                }}>
                  {searchSuggestions.reasoning}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                color: '#1f2937'
              }}>
                Recommended Search Terms:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {searchSuggestions.terms.map((term, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      color: '#374151',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    "{term}"
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                color: '#1f2937'
              }}>
                Recommended Databases:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {searchSuggestions.databases.map((database) => (
                  <button
                    key={database}
                    onClick={() => handleSearchDatabase(database)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      margin: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'
                    }}
                  >
                    {database}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  marginRight: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#059669'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'
                }}
              >
                Start Automated Search
              </button>
              <button
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  marginRight: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#059669'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'
                }}
              >
                Refine Strategy
              </button>
            </div>
          </div>
        </section>

        {/* Source Display Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
            fontFamily: 'Georgia, serif'
          }}>
            📊 Your Sources ({sources.length} found) - Curated by AI
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px',
            fontFamily: 'Georgia, serif'
          }}>
            High-quality, relevant sources selected for your research
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sources.map((source) => (
              <div
                key={source.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative'
                }}
              >
                {/* Quality Indicator */}
                <div
                  style={{
                    width: '4px',
                    height: '100%',
                    backgroundColor: getQualityIndicatorColor(source.qualityLevel),
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    borderRadius: '4px 0 0 4px'
                  }}
                />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>
                      {source.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      {source.authors.join(', ')}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      {source.journal} ({source.year}) • {source.citationCount} citations
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: getQualityIndicatorColor(source.qualityLevel),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {source.qualityLevel} Quality
                    </span>
                    <span style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {Math.round(source.relevanceScore * 100)}% Relevant
                    </span>
                  </div>
                </div>

                {/* Key Findings */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Key Findings:
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    {source.keyFindings}
                  </p>
                </div>

                {/* Relevance */}
                <div style={{
                  fontSize: '14px',
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <CheckCircle style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                  <span>{source.relevanceText}</span>
                </div>

                {/* Warning Flags */}
                {source.warningFlags && source.warningFlags.length > 0 && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    marginBottom: '16px',
                    backgroundColor: '#fef2f2',
                    padding: '8px',
                    borderRadius: '4px'
                  }}>
                    <AlertTriangle style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong>Consider:</strong> {source.warningFlags.join(', ')}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleViewSource(source.url)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                    }}
                  >
                    <Eye style={{ width: '14px', height: '14px' }} />
                    View Full Text
                  </button>
                  <button
                    onClick={() => handleAddToLibrary(source.id)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                    }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                    Add to Library
                  </button>
                  <button
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                    }}
                  >
                    <Download style={{ width: '14px', height: '14px' }} />
                    Save Citation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gap Analysis Section */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                fontSize: '24px',
                color: '#d97706',
                marginBottom: '8px'
              }}>
                💡
              </div>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  💡 AI Gap Analysis
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  Based on the curated sources, I've identified key insights and research gaps that could strengthen your study.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '12px'
              }}>
                Key Insights from Literature:
              </h3>
              <ul style={{
                listStyle: 'disc',
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#92400e',
                lineHeight: '1.6'
              }}>
                {gapAnalysis.insights.map((insight, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{insight}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '12px'
              }}>
                Research Gaps Identified:
              </h3>
              <ul style={{
                listStyle: 'disc',
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#92400e',
                lineHeight: '1.6'
              }}>
                {gapAnalysis.identifiedGaps.map((gap, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{gap}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '12px'
              }}>
                Recommendations for Your Study:
              </h3>
              <ul style={{
                listStyle: 'disc',
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#92400e',
                lineHeight: '1.6'
              }}>
                {gapAnalysis.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => router.push(`/projects/${projectId}/question`)}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
            Previous Phase: Question
          </button>

          <button
            onClick={() => router.push(`/projects/${projectId}/methodology`)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'
            }}
          >
            Next Phase: Methodology
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </nav>
      </main>
    </div>
  )
}
