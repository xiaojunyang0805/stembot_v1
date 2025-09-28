'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CreateProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    researchQuestion: '',
    field: 'psychology',
    timeline: '3-6 months'
  });

  const researchFields = [
    { value: 'psychology', label: 'Psychology & Cognitive Science' },
    { value: 'education', label: 'Educational Research' },
    { value: 'neuroscience', label: 'Neuroscience' },
    { value: 'biology', label: 'Biology & Life Sciences' },
    { value: 'medicine', label: 'Medical Research' },
    { value: 'social', label: 'Social Sciences' },
    { value: 'other', label: 'Other STEM Field' }
  ];

  const timelineOptions = [
    { value: '1-3 months', label: '1-3 months (Course Project)' },
    { value: '3-6 months', label: '3-6 months (Semester Thesis)' },
    { value: '6-12 months', label: '6-12 months (Master\'s Thesis)' },
    { value: '1-2 years', label: '1-2 years (PhD Chapter)' },
    { value: '2+ years', label: '2+ years (Major Research)' }
  ];

  const userName = user?.email?.split('@')[0] || 'Research User';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProject = async () => {
    if (!formData.title.trim() || !formData.researchQuestion.trim()) {
      alert('Please fill in both the project title and research question.');
      return;
    }

    setIsCreating(true);

    try {
      // Mock project creation - will be replaced with Supabase integration
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockProjectId = 'proj_' + Date.now();
      console.log('Creating project:', { ...formData, userId: user?.id, projectId: mockProjectId });

      // Redirect to the new project workspace
      router.push(`/projects/${mockProjectId}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.researchQuestion.trim();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              borderLeft: '1px solid #d1d5db',
              paddingLeft: '1rem'
            }}>
              ✨ Create New Project
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem'
          }}>
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: '0.875rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Welcome Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Start Your Research Journey
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Create a new research project with AI-powered guidance. Just provide the essential information
            to get started - you can add more details as your research evolves.
          </p>
        </div>

        {/* Project Creation Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          border: '1px solid #e5e7eb',
          padding: '2.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {/* Project Title */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                📝 Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Sleep Patterns and Memory Performance in College Students"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#2563eb'; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; }}
              />
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                Give your research project a clear, descriptive title.
              </p>
            </div>

            {/* Research Question */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                ❓ Research Question *
              </label>
              <textarea
                value={formData.researchQuestion}
                onChange={(e) => handleInputChange('researchQuestion', e.target.value)}
                placeholder="e.g., How does sleep deprivation affect memory consolidation in undergraduate students compared to older adults?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#2563eb'; }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb'; }}
              />
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                What specific question are you trying to answer? This can be refined later.
              </p>
            </div>

            {/* Research Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                🔬 Research Field
              </label>
              <select
                value={formData.field}
                onChange={(e) => handleInputChange('field', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {researchFields.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                This helps us provide relevant research guidance and templates.
              </p>
            </div>

            {/* Timeline */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                ⏰ Expected Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {timelineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                This helps us create appropriate milestones and deadlines.
              </p>
            </div>
          </div>

          {/* Create Button */}
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleCreateProject}
              disabled={!isFormValid || isCreating}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                backgroundColor: isFormValid && !isCreating ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: isFormValid && !isCreating ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                if (isFormValid && !isCreating) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid && !isCreating) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }
              }}
            >
              {isCreating ? (
                <>
                  <span style={{ fontSize: '1rem' }}>⏳</span>
                  Creating Your Project...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1rem' }}>🚀</span>
                  Create Project & Start Research
                </>
              )}
            </button>

            {!isFormValid && (
              <p style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#dc2626',
                marginTop: '0.75rem'
              }}>
                Please fill in the required fields (marked with *) to continue.
              </p>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            💡 <strong>Pro tip:</strong> Don't worry about getting everything perfect.
            You can refine your research question and add more details as you work through the literature review and methodology phases.
          </p>
        </div>
      </main>
    </div>
  );
}