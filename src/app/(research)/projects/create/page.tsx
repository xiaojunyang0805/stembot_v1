'use client'

import { useState, useRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

interface ProjectFormData {
  title: string
  initialIdea: string
  dueDate: string
}

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    initialIdea: '',
    dueDate: ''
  })
  const [titleError, setTitleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Auto-focus on title input when page loads
  useEffect(() => {
    if (titleInputRef.current !== null) {
      titleInputRef.current.focus()
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea !== null) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`
    }
  }, [formData.initialIdea])

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleTitleChange = (value: string) => {
    // Validate title (1-100 characters, no special characters except spaces, hyphens, ampersands)
    if (value.length > 100) {
      setTitleError('Title must be 100 characters or less')
      return
    }

    const invalidChars = /[^a-zA-Z0-9\s\-&]/
    if (invalidChars.test(value)) {
      setTitleError('Title can only contain letters, numbers, spaces, hyphens, and ampersands')
      return
    }

    setTitleError('')
    setFormData(prev => ({ ...prev, title: value }))
  }

  const handleInitialIdeaChange = (value: string) => {
    if (value.length > 500) {
      return
    }
    setFormData(prev => ({ ...prev, initialIdea: value }))
  }

  const handleDueDateChange = (value: string) => {
    // Validate future date
    if (value.length > 0) {
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate <= today) {
        // Allow the value to be set but don't show error in UI for now
        // The validation will be shown on submit if needed
      }
    }
    setFormData(prev => ({ ...prev, dueDate: value }))
  }

  const canSubmit = formData.title.trim().length > 0 && titleError.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    // Validate due date on submit
    if (formData.dueDate.length > 0) {
      const selectedDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate <= today) {
        // eslint-disable-next-line no-alert
        alert('Due date must be in the future')
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Call our projects API to create the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          initialIdea: formData.initialIdea || undefined,
          dueDate: formData.dueDate || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      // Redirect to the new project workspace
      const projectId = result.project?.id
      if (projectId) {
        const welcomeMessage = formData.initialIdea
          ? `Let's start working on your idea: "${formData.initialIdea.slice(0, 100)}${formData.initialIdea.length > 100 ? '...' : ''}"`
          : "Let's start refining your research question!"

        router.push(`/projects/${projectId}?welcome=true&message=${encodeURIComponent(welcomeMessage)}`)
      } else {
        throw new Error('No project ID returned')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      // eslint-disable-next-line no-alert
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Creating Your Research Project
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Setting up your workspace and AI mentor...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={handleBack}
          style={{
            fontSize: '16px',
            color: '#6b7280',
            textDecoration: 'none',
            marginRight: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0'
          }}
        >
          ← Dashboard
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0',
          display: 'inline'
        }}>
          Create New Research Project
        </h1>
      </div>

      {/* Welcome Section */}
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Start Your Research Journey
          <span style={{ fontSize: '32px', marginLeft: '8px' }}>🚀</span>
        </h2>
      </div>

      {/* Form Container */}
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          {/* Project Title Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'block'
            }}>
              Project Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Sleep and Memory in College Students"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: titleError.length > 0 ? '2px solid #dc2626' : '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (titleError.length === 0) {
                  e.target.style.borderColor = '#2563eb'
                }
              }}
              onBlur={(e) => {
                if (titleError.length === 0) {
                  e.target.style.borderColor = '#d1d5db'
                }
              }}
            />
            {titleError.length > 0 && (
              <p style={{
                color: '#dc2626',
                fontSize: '14px',
                marginTop: '4px'
              }}>
                {titleError}
              </p>
            )}
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Initial Research Idea Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '8px',
              display: 'block'
            }}>
              Initial Research Idea (optional)
            </label>
            <textarea
              ref={textareaRef}
              value={formData.initialIdea}
              onChange={(e) => handleInitialIdeaChange(e.target.value)}
              placeholder="I want to study how sleep affects memory, maybe focus on college students since they don't get enough sleep..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                minHeight: '120px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              {formData.initialIdea.length}/500 characters
            </p>
          </div>

          {/* Due Date Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '8px',
              display: 'block'
            }}>
              Due Date (optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                }}
              />
              <span style={{
                fontSize: '14px',
                color: '#6b7280',
                fontStyle: 'italic',
                marginLeft: '12px'
              }}>
                Don&apos;t worry - you can change this later
              </span>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#f0f8ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '20px', marginRight: '8px' }}>💡</span>
            What happens next?
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              I&apos;ll help you refine your research question through conversation
            </li>
            <li style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              Upload documents anytime - papers, data, notes, lab results
            </li>
            <li style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              I&apos;ll remember everything and guide you through each phase
            </li>
            <li style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              Add methodology, literature, and writing as you progress
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          gap: '16px',
          justifyContent: 'space-between'
        }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              padding: '12px 24px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? '#2563eb' : '#e5e7eb',
              color: canSubmit ? 'white' : '#9ca3af',
              padding: '12px 32px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (canSubmit) {
                e.currentTarget.style.backgroundColor = '#1d4ed8'
              }
            }}
            onMouseOut={(e) => {
              if (canSubmit) {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🚀</span>
            Start Research Project
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}