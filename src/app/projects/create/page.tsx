'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { createProject } from '../../../lib/database/projects';
import { LimitReached } from '../../../components/upgrade';
import { supabase } from '../../../lib/supabase';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface BillingData {
  subscription: {
    tier: string;
  };
  usage: {
    activeProjects: {
      current: number;
      limit: number | null;
      percentage: number;
      unlimited: boolean;
    };
  };
}

export default function CreateProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    researchQuestion: '',
    field: 'psychology',
    timeline: '3-6 months'
  });

  // Fetch project limits
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const billingResponse = await fetch('/api/billing/status', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (billingResponse.ok) {
            const result = await billingResponse.json();
            setBillingData(result.data);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch billing data:', error);
      } finally {
        setIsLoadingLimits(false);
      }
    };

    fetchBillingData();
  }, [user]);

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
      // Check if we should use mocks (fallback for development)
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
                      process.env.NEXT_PUBLIC_INTEGRATION_METHOD === 'mock';

      if (useMocks) {
        // Mock project creation for development
        console.log('🎭 Using mock project creation (development mode)');
        const mockProject = {
          id: `mock-${Date.now()}`,
          title: formData.title,
          researchQuestion: formData.researchQuestion,
          field: formData.field,
          timeline: formData.timeline
        };

        setTimeout(() => {
          console.log('Mock project created:', mockProject);
          router.push(`/projects/${mockProject.id}`);
        }, 1500);
        return;
      }

      // Try real Supabase project creation
      const { data: project, error } = await createProject({
        title: formData.title,
        researchQuestion: formData.researchQuestion,
        field: formData.field,
        timeline: formData.timeline
      });

      if (error) {
        console.error('Failed to create project:', error);

        // If Supabase fails, check if we should fallback to mocks
        if (process.env.NEXT_PUBLIC_FALLBACK_TO_MOCKS === 'true') {
          console.log('🎭 Falling back to mock project creation');
          const mockProject = {
            id: `mock-fallback-${Date.now()}`,
            title: formData.title,
            researchQuestion: formData.researchQuestion,
            field: formData.field,
            timeline: formData.timeline
          };

          setTimeout(() => {
            console.log('Fallback mock project created:', mockProject);
            router.push(`/projects/${mockProject.id}`);
          }, 1500);
          return;
        }

        // Show specific error messages
        if (error.message?.includes('Invalid API key')) {
          alert('⚠️ Database not configured. Please set up Supabase or enable mock mode. See SUPABASE_SETUP.md for instructions.');
        } else {
          alert(`Failed to create project: ${error.message || 'Please try again.'}`);
        }
        return;
      }

      if (project) {
        console.log('Project created successfully:', project);
        router.push(`/projects/${project.id}`);
      } else {
        alert('Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.researchQuestion.trim();

  // Check if user has hit project limit
  const projectsData = billingData?.usage.activeProjects;
  const hasHitLimit = projectsData && !projectsData.unlimited &&
                      projectsData.current >= (projectsData.limit || 0);
  const isApproachingLimit = projectsData && !projectsData.unlimited &&
                             projectsData.percentage >= 80;

  // Show loading state while checking limits
  if (isLoadingLimits) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ color: '#6b7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Show limit reached screen if user has hit project limit
  if (hasHitLimit) {
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
            </div>
          </div>
        </header>

        {/* Limit Reached Content */}
        <main style={{
          maxWidth: '800px',
          margin: '3rem auto',
          padding: '2rem'
        }}>
          <LimitReached
            feature="projects"
            onUpgradeClick={() => router.push('/settings?tab=billing')}
          />
        </main>
      </div>
    );
  }

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

        {/* Approaching Limit Warning */}
        {isApproachingLimit && projectsData && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #fde047',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div style={{ fontSize: '2rem' }}>⚠️</div>
              <div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '0.25rem'
                }}>
                  Approaching Project Limit
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#78350f',
                  lineHeight: '1.4'
                }}>
                  You have {projectsData.limit! - projectsData.current} project slot{projectsData.limit! - projectsData.current !== 1 ? 's' : ''} remaining on the {billingData.subscription.tier === 'free' ? 'Free' : 'Student Pro'} tier.
                  {projectsData.limit! - projectsData.current === 0 && ' This will be your last project.'}
                </div>
              </div>
            </div>
            {billingData.subscription.tier === 'free' && (
              <button
                onClick={() => router.push('/settings?tab=billing')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
              >
                View Plans
              </button>
            )}
          </div>
        )}

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