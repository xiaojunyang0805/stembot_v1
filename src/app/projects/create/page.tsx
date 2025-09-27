'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CreateProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    researchQuestion: '',
    methodology: '',
    timeline: ''
  });

  const subjects = [
    { value: 'psychology', label: 'Psychology', emoji: '🧠', color: '#2563eb' },
    { value: 'biology', label: 'Biology', emoji: '🧬', color: '#10b981' },
    { value: 'chemistry', label: 'Chemistry', emoji: '⚗️', color: '#f59e0b' },
    { value: 'physics', label: 'Physics', emoji: '🔬', color: '#8b5cf6' },
    { value: 'neuroscience', label: 'Neuroscience', emoji: '🧠', color: '#ec4899' },
    { value: 'medicine', label: 'Medicine', emoji: '⚕️', color: '#ef4444' },
    { value: 'engineering', label: 'Engineering', emoji: '⚙️', color: '#6b7280' },
    { value: 'computer-science', label: 'Computer Science', emoji: '💻', color: '#3b82f6' }
  ];

  const userName = user?.email?.split('@')[0] || 'Research User';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Mock project creation - in real app would save to database
    console.log('Creating project:', formData);
    router.push('/projects/4'); // Navigate to new project
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title && formData.subject && formData.description;
      case 2:
        return formData.researchQuestion;
      case 3:
        return formData.methodology && formData.timeline;
      default:
        return false;
    }
  };

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
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo and Navigation */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button
              onClick={() => router.push('/dashboard')}
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
              ← Back to Dashboard
            </button>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb'
            }}>
              🧠 StemBot
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#6b7280',
              borderLeft: '1px solid #d1d5db',
              paddingLeft: '1rem'
            }}>
              New Research Project
            </div>
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
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Progress Indicator */}
        <div style={{marginBottom: '3rem'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} style={{display: 'flex', alignItems: 'center'}}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  backgroundColor: step >= stepNumber ? '#2563eb' : '#e5e7eb',
                  color: step >= stepNumber ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div style={{
                    width: '4rem',
                    height: '2px',
                    backgroundColor: step > stepNumber ? '#2563eb' : '#e5e7eb',
                    margin: '0 1rem'
                  }} />
                )}
              </div>
            ))}
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Step {step} of 3: {
              step === 1 ? 'Basic Information' :
              step === 2 ? 'Research Question' :
              'Methodology & Timeline'
            }
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              🎯 Project Basics
            </h2>

            {/* Project Title */}
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Sleep Patterns and Memory in College Students"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Subject Selection */}
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Research Subject *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem'
              }}>
                {subjects.map((subject) => (
                  <button
                    key={subject.value}
                    onClick={() => handleInputChange('subject', subject.value)}
                    style={{
                      padding: '1rem',
                      border: formData.subject === subject.value ?
                        `2px solid ${subject.color}` : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      backgroundColor: formData.subject === subject.value ?
                        `${subject.color}10` : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.subject !== subject.value) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.subject !== subject.value) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{fontSize: '1.25rem'}}>{subject.emoji}</span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: formData.subject === subject.value ? subject.color : '#374151'
                      }}>
                        {subject.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Description */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Brief Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Briefly describe what you want to research and why it interests you..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Research Question */}
        {step === 2 && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              ❓ Research Question
            </h2>

            <div style={{
              backgroundColor: '#eff6ff',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #bfdbfe',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{fontSize: '1rem'}}>💡</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1e40af'
                }}>
                  Tips for a Good Research Question
                </span>
              </div>
              <ul style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                margin: 0,
                paddingLeft: '1.25rem'
              }}>
                <li>Specific and focused</li>
                <li>Answerable through research</li>
                <li>Relevant to your field</li>
                <li>Not too broad or too narrow</li>
              </ul>
            </div>

            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Your Research Question *
              </label>
              <textarea
                value={formData.researchQuestion}
                onChange={(e) => handleInputChange('researchQuestion', e.target.value)}
                placeholder="e.g., How do different sleep schedules affect memory retention and academic performance in college students?"
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Methodology & Timeline */}
        {step === 3 && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              📋 Methodology & Timeline
            </h2>

            {/* Methodology */}
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Research Methodology *
              </label>
              <textarea
                value={formData.methodology}
                onChange={(e) => handleInputChange('methodology', e.target.value)}
                placeholder="Describe your research approach: quantitative, qualitative, mixed methods, experimental design, etc."
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Timeline */}
            <div style={{marginBottom: '2rem'}}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Project Timeline *
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select timeline...</option>
                <option value="1-month">1 Month</option>
                <option value="2-months">2 Months</option>
                <option value="3-months">3 Months</option>
                <option value="6-months">6 Months</option>
                <option value="1-year">1 Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem'
        }}>
          <button
            onClick={handleBack}
            disabled={step === 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: step === 1 ? '#f3f4f6' : 'white',
              color: step === 1 ? '#9ca3af' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: step === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isStepValid() ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isStepValid() ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (isStepValid()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isStepValid() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isStepValid() ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (isStepValid()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
                }
              }}
            >
              🚀 Create Project
            </button>
          )}
        </div>
      </main>
    </div>
  );
}