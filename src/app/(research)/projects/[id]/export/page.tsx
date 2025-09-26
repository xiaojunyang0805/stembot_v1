/**
 * Export and Presentation Page
 * Document generation and presentation builder
 */

'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Download,
  FileText,
  Presentation,
  Share2,
  Copy,
  Eye,
  Settings,
  CheckCircle,
  ArrowLeft,
  Globe,
  Mail,
  Printer,
  Image,
  BarChart3,
  Users,
  Calendar,
  Clock,
  Star,
  Target,
  BookOpen,
  Zap
} from 'lucide-react'



export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [exportFormats, setExportFormats] = useState<any[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([])
  const [presentationMode, setPresentationMode] = useState<'document' | 'slides'>('document')
  const [shareSettings, setShareSettings] = useState({
    public: false,
    allowComments: false,
    expiresAt: null as Date | null,
    password: ''
  })
  const [showShareModal, setShowShareModal] = useState(false)
  const [customizations, setCustomizations] = useState({
    includeAppendices: true,
    includeFigures: true,
    includeTables: true,
    includeReferences: true,
    formatting: 'academic',
    fontSize: 12,
    lineSpacing: 'double'
  })

  useEffect(() => {
    if (projectId) {
      fetchExportOptions()
      fetchGeneratedFiles()
    }
  }, [projectId])

  const fetchExportOptions = async () => {
    try {
      // TODO: Implement API call
      const mockFormats = [
        {
          id: 'pdf',
          name: 'PDF Document',
          description: 'Professional PDF format suitable for submission',
          icon: FileText,
          recommended: true
        },
        {
          id: 'docx',
          name: 'Word Document',
          description: 'Microsoft Word format for further editing',
          icon: FileText,
          recommended: false
        },
        {
          id: 'latex',
          name: 'LaTeX Source',
          description: 'LaTeX source code for academic publishing',
          icon: FileText,
          recommended: false
        },
        {
          id: 'slides',
          name: 'Presentation Slides',
          description: 'PowerPoint slides for presentations',
          icon: Presentation,
          recommended: true
        },
        {
          id: 'poster',
          name: 'Research Poster',
          description: 'Academic poster for conferences',
          icon: Image,
          recommended: false
        },
        {
          id: 'web',
          name: 'Web Publication',
          description: 'Interactive web version',
          icon: Globe,
          recommended: false
        }
      ]
      setExportFormats(mockFormats)
    } catch (error) {
      console.error('Failed to fetch export options:', error)
    }
  }

  const fetchGeneratedFiles = async () => {
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/projects/${projectId}/exports`)
      // const data = await response.json()
      // setGeneratedFiles(data)
    } catch (error) {
      console.error('Failed to fetch generated files:', error)
    }
  }

  const generateDocument = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/research/export/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          format: selectedFormat,
          mode: presentationMode,
          customizations
        })
      })

      if (response.ok) {
        const result = await response.json()
        setGeneratedFiles(prev => [result, ...prev])
      }
    } catch (error) {
      console.error('Failed to generate document:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareDocument = async (fileId: string) => {
    try {
      const response = await fetch('/api/research/export/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          settings: shareSettings
        })
      })

      if (response.ok) {
        const shareLink = await response.json()
        navigator.clipboard.writeText(shareLink.url)
        setShowShareModal(false)
      }
    } catch (error) {
      console.error('Failed to share document:', error)
    }
  }

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`/api/research/export/download/${fileId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }

  const getFormatIcon = (format: string) => {
    const icons = {
      pdf: FileText,
      docx: FileText,
      latex: FileText,
      slides: Presentation,
      poster: Image,
      web: Globe
    }
    return icons[format as keyof typeof icons] || FileText
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'generating': 'bg-yellow-100 text-yellow-800',
      'ready': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.ready
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
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
                <ArrowLeft style={{width: '16px', height: '16px'}} />
                Back to Project
              </button>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: '0'
                }}>Export & Share</h1>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  Generate documents and presentations from your research
                </p>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <button
                onClick={() => setShowShareModal(true)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ea580c',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ea580c',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Share2 style={{width: '16px', height: '16px'}} />
                Share Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px'
        }}>

          {/* Export Interface */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <Download style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              color: '#9ca3af'
            }} />
            <h3 style={{
              marginBottom: '8px',
              fontSize: '18px',
              fontWeight: '500',
              color: '#111827'
            }}>Export & Share Interface</h3>
            <p style={{
              color: '#6b7280',
              margin: '0 0 24px 0'
            }}>
              Generate documents and presentations from your research work.
            </p>

            {/* Export Format Options */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <FileText style={{width: '24px', height: '24px', color: '#ea580c', margin: '0 auto 8px'}} />
                <div style={{fontSize: '14px', fontWeight: '500', color: '#c2410c'}}>PDF Document</div>
                <div style={{fontSize: '12px', color: '#7c2d12', marginTop: '4px'}}>Academic format</div>
              </div>
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <Presentation style={{width: '24px', height: '24px', color: '#d97706', margin: '0 auto 8px'}} />
                <div style={{fontSize: '14px', fontWeight: '500', color: '#b45309'}}>Presentation</div>
                <div style={{fontSize: '12px', color: '#92400e', marginTop: '4px'}}>Slide deck</div>
              </div>
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <Globe style={{width: '24px', height: '24px', color: '#0369a1', margin: '0 auto 8px'}} />
                <div style={{fontSize: '14px', fontWeight: '500', color: '#0c4a6e'}}>Web Version</div>
                <div style={{fontSize: '12px', color: '#164e63', marginTop: '4px'}}>Online sharing</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button style={{
                backgroundColor: '#ea580c',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Zap style={{width: '16px', height: '16px'}} />
                Generate Document
              </button>
              <button style={{
                backgroundColor: 'transparent',
                color: '#ea580c',
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #ea580c',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Share2 style={{width: '16px', height: '16px'}} />
                Share Project
              </button>
            </div>

            {/* Project Summary */}
            <div style={{
              marginTop: '32px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BarChart3 style={{width: '16px', height: '16px'}} />
                Project Summary
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '14px'
              }}>
                <div style={{color: '#6b7280'}}>Completion: <span style={{color: '#16a34a', fontWeight: '500'}}>95%</span></div>
                <div style={{color: '#6b7280'}}>Word Count: <span style={{color: '#111827', fontWeight: '500'}}>8,245</span></div>
                <div style={{color: '#6b7280'}}>Sources: <span style={{color: '#111827', fontWeight: '500'}}>32</span></div>
                <div style={{color: '#6b7280'}}>Duration: <span style={{color: '#111827', fontWeight: '500'}}>3 months</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '24px',
            margin: '0 16px',
            width: '100%',
            maxWidth: '448px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>Share Project</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="checkbox"
                    checked={shareSettings.public}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, public: e.target.checked }))}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '2px',
                      border: '1px solid #d1d5db',
                      accentColor: '#ea580c'
                    }}
                  />
                  <span style={{fontSize: '14px', color: '#374051'}}>Make public</span>
                </label>
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="checkbox"
                    checked={shareSettings.allowComments}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '2px',
                      border: '1px solid #d1d5db',
                      accentColor: '#ea580c'
                    }}
                  />
                  <span style={{fontSize: '14px', color: '#374051'}}>Allow comments</span>
                </label>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374051',
                  marginBottom: '4px'
                }}>Password (optional)</label>
                <input
                  type="password"
                  value={shareSettings.password}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '16px'
              }}>
                <button
                  onClick={() => setShowShareModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => shareDocument('current')}
                  style={{
                    flex: 1,
                    backgroundColor: '#ea580c',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}