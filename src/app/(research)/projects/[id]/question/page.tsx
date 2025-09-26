/**
 * Question Formation Page
 * AI-powered Socratic coaching for research question refinement
 */

'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Target,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain,
  History,
  BookOpen,
  ArrowLeft
} from 'lucide-react'

import { ResearchProject, ResearchQuestion } from '../../../../../types/research'


export default function QuestionFormationPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ResearchProject | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [refinementHistory, setRefinementHistory] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [questionScore, setQuestionScore] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/projects/${projectId}`)
      // const data = await response.json()
      // setProject(data)
      // setCurrentQuestion(data.question?.refinedQuestion || data.question?.originalQuestion || '')
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }

  const analyzeQuestion = async () => {
    if (!currentQuestion.trim()) {
return
}

    setIsAnalyzing(true)
    try {
      // TODO: Implement AI analysis
      const response = await fetch('/api/research/questions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          question: currentQuestion,
          field: project?.field
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        setQuestionScore(analysis.score)
        setAiSuggestions(analysis.suggestions)
      }
    } catch (error) {
      console.error('Question analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) {
return
}

    const userMessage = { role: 'user', content: chatInput, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      // TODO: Implement AI mentor chat
      const response = await fetch('/api/chat/research-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: chatInput,
          context: {
            stage: 'question-formation',
            currentQuestion,
            field: project?.field
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions
        }
        setChatMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Chat failed:', error)
    } finally {
      setIsChatLoading(false)
    }
  }

  const saveQuestionVersion = async () => {
    if (!currentQuestion.trim()) {
return
}

    try {
      // TODO: Implement question saving
      const response = await fetch('/api/research/questions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          question: currentQuestion,
          score: questionScore,
          feedback: aiSuggestions
        })
      })

      if (response.ok) {
        const newVersion = await response.json()
        setRefinementHistory(prev => [newVersion, ...prev])
      }
    } catch (error) {
      console.error('Failed to save question:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) {
      return { color: '#16a34a', backgroundColor: '#dcfce7' }
    }
    if (score >= 6) {
      return { color: '#d97706', backgroundColor: '#fef3c7' }
    }
    return { color: '#dc2626', backgroundColor: '#fee2e2' }
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) {
return CheckCircle
}
    if (score >= 6) {
return AlertCircle
}
    return Target
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
                }}>Question Formation</h1>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  Refine your research question with AI guidance
                </p>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <button
                onClick={() => router.push(`/projects/${projectId}/literature`)}
                disabled={!questionScore || questionScore.overall < 7}
                style={{
                  backgroundColor: (!questionScore || questionScore.overall < 7) ? '#d1d5db' : '#2563eb',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (!questionScore || questionScore.overall < 7) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Continue to Literature Review
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
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>

          {/* Main Question Workspace */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>

            {/* Current Question */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  borderRadius: '8px',
                  backgroundColor: '#dbeafe',
                  padding: '8px'
                }}>
                  <Target style={{width: '20px', height: '20px', color: '#2563eb'}} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0'
                  }}>Research Question</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0'
                  }}>Craft a focused, answerable research question</p>
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={{
                    marginBottom: '8px',
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374051'
                  }}>
                    Current Research Question
                  </label>
                  <textarea
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Enter your research question here..."
                    rows={4}
                    style={{
                      width: '100%',
                      resize: 'none',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{display: 'flex', gap: '12px'}}>
                  <button
                    onClick={analyzeQuestion}
                    disabled={!currentQuestion.trim() || isAnalyzing}
                    style={{
                      backgroundColor: (!currentQuestion.trim() || isAnalyzing) ? '#d1d5db' : '#2563eb',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (!currentQuestion.trim() || isAnalyzing) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: '2px solid transparent',
                          borderTopColor: 'white',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain style={{width: '16px', height: '16px'}} />
                        Analyze Question
                      </>
                    )}
                  </button>

                  {questionScore && (
                    <button
                      onClick={saveQuestionVersion}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#16a34a',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: '1px solid #16a34a',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle style={{width: '16px', height: '16px'}} />
                      Save Version
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Analysis Results */}
            {questionScore && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0'
                  }}>Question Analysis</h3>
                  <div style={{
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    ...getScoreColor(questionScore.overall)
                  }}>
                    Score: {questionScore.overall}/10
                  </div>
                </div>

                <div style={{
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '16px'
                }}>
                  {Object.entries(questionScore.criteria).map(([criterion, score]: [string, any]) => {
                    const Icon = getScoreIcon(score)
                    const scoreStyle = getScoreColor(score)
                    return (
                      <div key={criterion} style={{textAlign: 'center'}}>
                        <div style={{
                          margin: '0 auto 8px',
                          display: 'flex',
                          width: '32px',
                          height: '32px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          ...scoreStyle
                        }}>
                          <Icon style={{width: '16px', height: '16px'}} />
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827',
                          textTransform: 'capitalize'
                        }}>
                          {criterion.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>{score}/10</div>
                      </div>
                    )
                  })}
                </div>

                {aiSuggestions.length > 0 && (
                  <div>
                    <h4 style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374051'
                    }}>
                      <Lightbulb style={{width: '16px', height: '16px'}} />
                      AI Suggestions for Improvement
                    </h4>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} style={{
                          borderRadius: '8px',
                          border: '1px solid #bfdbfe',
                          backgroundColor: '#eff6ff',
                          padding: '12px'
                        }}>
                          <p style={{
                            fontSize: '14px',
                            color: '#1e40af',
                            margin: '0'
                          }}>{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Research Mentor Chat */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  borderRadius: '8px',
                  backgroundColor: '#f3e8ff',
                  padding: '8px'
                }}>
                  <MessageSquare style={{width: '20px', height: '20px', color: '#7c3aed'}} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0'
                  }}>AI Research Mentor</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0'
                  }}>Get Socratic guidance on your research question</p>
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                {/* Chat Messages */}
                <div style={{
                  height: '256px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '16px'
                }}>
                  {chatMessages.length === 0 ? (
                    <div style={{
                      marginTop: '32px',
                      textAlign: 'center',
                      color: '#6b7280'
                    }}>
                      <MessageSquare style={{
                        width: '32px',
                        height: '32px',
                        margin: '0 auto 8px',
                        color: '#9ca3af'
                      }} />
                      <p style={{fontSize: '14px', margin: '0'}}>Start a conversation with your AI research mentor</p>
                      <p style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        margin: '0'
                      }}>Ask about question formation, research scope, or methodology</p>
                    </div>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '280px',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          backgroundColor: message.role === 'user' ? '#2563eb' : '#f3f4f6',
                          color: message.role === 'user' ? 'white' : '#111827'
                        }}>
                          <p style={{fontSize: '14px', margin: '0'}}>{message.content}</p>
                          <p style={{
                            marginTop: '4px',
                            fontSize: '12px',
                            opacity: 0.7,
                            margin: '4px 0 0 0'
                          }}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div style={{display: 'flex', justifyContent: 'flex-start'}}>
                      <div style={{
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        padding: '12px 16px'
                      }}>
                        <div style={{display: 'flex', gap: '4px'}}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#9ca3af',
                            animation: 'bounce 1.4s ease-in-out infinite both'
                          }}></div>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#9ca3af',
                            animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
                          }}></div>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#9ca3af',
                            animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your research question..."
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    style={{
                      backgroundColor: (!chatInput.trim() || isChatLoading) ? '#d1d5db' : '#7c3aed',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: (!chatInput.trim() || isChatLoading) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MessageSquare style={{width: '16px', height: '16px'}} />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Refinement History */}
            {refinementHistory.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    padding: '8px'
                  }}>
                    <History style={{width: '20px', height: '20px', color: '#6b7280'}} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0'
                    }}>Refinement History</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0'
                    }}>Track your question evolution</p>
                  </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {refinementHistory.map((version, index) => (
                    <div key={version.id} style={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '16px'
                    }}>
                      <div style={{
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827'
                        }}>
                          Version {refinementHistory.length - index}
                        </span>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <span style={{
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            ...getScoreColor(version.score)
                          }}>
                            {version.score}/10
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            {new Date(version.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: '#374051',
                        margin: '0'
                      }}>{version.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            {/* Memory Hub */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                color: '#111827'
              }}>
                <Brain style={{width: '16px', height: '16px'}} />
                Memory Hub
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0'
              }}>
                AI tracks your question formation progress and insights.
              </p>
            </div>

            {/* Question Guidelines */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BookOpen style={{width: '16px', height: '16px', color: '#2563eb'}} />
                <h4 style={{
                  fontWeight: '500',
                  color: '#111827',
                  margin: '0'
                }}>Good Research Questions</h4>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <CheckCircle style={{
                    marginTop: '2px',
                    width: '12px',
                    height: '12px',
                    flexShrink: 0,
                    color: '#16a34a'
                  }} />
                  <span>Specific and focused scope</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <CheckCircle style={{
                    marginTop: '2px',
                    width: '12px',
                    height: '12px',
                    flexShrink: 0,
                    color: '#16a34a'
                  }} />
                  <span>Answerable with available methods</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <CheckCircle style={{
                    marginTop: '2px',
                    width: '12px',
                    height: '12px',
                    flexShrink: 0,
                    color: '#16a34a'
                  }} />
                  <span>Significant to your field</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <CheckCircle style={{
                    marginTop: '2px',
                    width: '12px',
                    height: '12px',
                    flexShrink: 0,
                    color: '#16a34a'
                  }} />
                  <span>Clear and unambiguous</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <CheckCircle style={{
                    marginTop: '2px',
                    width: '12px',
                    height: '12px',
                    flexShrink: 0,
                    color: '#16a34a'
                  }} />
                  <span>Original contribution</span>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{
                marginBottom: '12px',
                fontWeight: '500',
                color: '#111827'
              }}>Research Progress</h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2563eb'
                  }}>Question Formation</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Current</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0.5
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Literature Review</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#9ca3af'
                  }}>Next</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0.3
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Methodology</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#9ca3af'
                  }}>Later</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0.3
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Writing</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#9ca3af'
                  }}>Later</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}