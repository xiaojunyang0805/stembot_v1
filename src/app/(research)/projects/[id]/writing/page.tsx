/**
 * Academic Writing Page
 * AI-assisted academic writing workspace with structure guidance
 */

'use client'

import { useState, useEffect, useRef } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  PenTool,
  FileText,
  Eye,
  Save,
  Download,
  Undo,
  Redo,
  AlignLeft,
  Type,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Quote,
  Lightbulb,
  Brain,
  Target,
  BarChart3,
  Clock,
  Users
} from 'lucide-react'

import { WritingProgress, DocumentOutline, WritingSection } from '../../../../../types/writing'


export default function WritingPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const [writingProgress, setWritingProgress] = useState<WritingProgress | null>(null)
  const [currentSection, setCurrentSection] = useState<WritingSection | null>(null)
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write')
  const [showOutline, setShowOutline] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago'>('APA')
  const [showCitations, setShowCitations] = useState(false)
  const [writingAssistant, setWritingAssistant] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchWritingProgress()
    }
  }, [projectId])

  useEffect(() => {
    // Count words
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)

    // Auto-save
    if (autoSave && content !== '') {
      const timer = setTimeout(() => {
        saveContent()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [content, autoSave])

  const fetchWritingProgress = async () => {
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/projects/${projectId}/writing`)
      // const data = await response.json()
      // setWritingProgress(data)
      // if (data.sections.length > 0) {
      //   setCurrentSection(data.sections[0])
      //   setContent(data.sections[0].content)
      // }
    } catch (error) {
      console.error('Failed to fetch writing progress:', error)
    }
  }

  const saveContent = async () => {
    if (!currentSection) {
return
}

    try {
      const response = await fetch(`/api/research/writing/sections/${currentSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          wordCount
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  const generateAISuggestions = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/research/writing/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sectionId: currentSection?.id,
          content,
          type: 'improvement'
        })
      })

      if (response.ok) {
        const suggestions = await response.json()
        setAiSuggestions(suggestions.suggestions)
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateContent = async (prompt: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/research/writing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sectionId: currentSection?.id,
          prompt,
          style: 'academic',
          citationStyle
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newContent = `${content}\n\n${data.content}`
        setContent(newContent)
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const insertCitation = (citation: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = content.substring(0, start)
      const after = content.substring(end)
      const newContent = before + citation + after
      setContent(newContent)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + citation.length, start + citation.length)
      }, 0)
    }
  }

  const getWordCountColor = () => {
    if (!currentSection?.estimatedWords) {
return 'text-gray-600'
}
    const percentage = (wordCount / currentSection.estimatedWords) * 100
    if (percentage < 50) {
return 'text-red-600'
}
    if (percentage < 80) {
return 'text-yellow-600'
}
    if (percentage < 120) {
return 'text-green-600'
}
    return 'text-orange-600'
  }

  const defaultOutline = {
    structure: [
      { id: '1', title: 'Abstract', level: 1, purpose: 'Summarize research', keyPoints: ['Background', 'Methods', 'Results', 'Conclusions'], estimatedWords: 250, subsections: [] },
      { id: '2', title: 'Introduction', level: 1, purpose: 'Introduce topic and research question', keyPoints: ['Background', 'Problem statement', 'Research question', 'Significance'], estimatedWords: 800, subsections: [] },
      { id: '3', title: 'Literature Review', level: 1, purpose: 'Review existing research', keyPoints: ['Theoretical framework', 'Previous studies', 'Research gaps'], estimatedWords: 1500, subsections: [] },
      { id: '4', title: 'Methodology', level: 1, purpose: 'Explain research methods', keyPoints: ['Research design', 'Participants', 'Data collection', 'Analysis'], estimatedWords: 1000, subsections: [] },
      { id: '5', title: 'Results', level: 1, purpose: 'Present findings', keyPoints: ['Data analysis', 'Key findings', 'Statistical results'], estimatedWords: 1200, subsections: [] },
      { id: '6', title: 'Discussion', level: 1, purpose: 'Interpret results', keyPoints: ['Interpretation', 'Implications', 'Limitations', 'Future research'], estimatedWords: 1500, subsections: [] },
      { id: '7', title: 'Conclusion', level: 1, purpose: 'Summarize study', keyPoints: ['Summary', 'Contributions', 'Final thoughts'], estimatedWords: 500, subsections: [] }
    ]
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
                }}>Academic Writing</h1>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  AI-assisted academic writing with structure guidance
                </p>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {lastSaved && `Saved ${lastSaved.toLocaleTimeString()}`}
              </div>
              <button
                onClick={() => router.push(`/projects/${projectId}/export`)}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Continue to Export
                <ArrowRight style={{width: '16px', height: '16px'}} />
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

          {/* Writing Interface */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <PenTool style={{
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
            }}>Academic Writing Interface</h3>
            <p style={{
              color: '#6b7280',
              margin: '0 0 24px 0'
            }}>
              AI-assisted academic writing with structure guidance will be available here.
            </p>

            {/* Writing Area Preview */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <FileText style={{width: '20px', height: '20px', color: '#4f46e5'}} />
                <span style={{fontWeight: '500', color: '#111827'}}>Document Sections:</span>
              </div>
              <div style={{color: '#6b7280', fontSize: '14px', lineHeight: '1.6'}}>
                • Abstract • Introduction • Literature Review<br/>
                • Methodology • Results • Discussion • Conclusion
              </div>
            </div>

            {/* Features Preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '24px'
            }}>
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <Brain style={{width: '20px', height: '20px', color: '#2563eb', margin: '0 auto 8px'}} />
                <div style={{fontSize: '14px', fontWeight: '500', color: '#1e40af'}}>AI Writing Assistant</div>
              </div>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <Quote style={{width: '20px', height: '20px', color: '#16a34a', margin: '0 auto 8px'}} />
                <div style={{fontSize: '14px', fontWeight: '500', color: '#15803d'}}>Citation Management</div>
              </div>
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <Target style={{width: '20px', height: '20px', color: '#d97706', margin: '0 auto 8px'}} />
                <div style={{fontSize: '14px', fontWeight: '500', color: '#b45309'}}>Progress Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}