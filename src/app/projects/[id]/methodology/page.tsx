'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject } from '../../../../lib/database/projects';
import { getProjectDocuments, type DocumentMetadata } from '../../../../lib/database/documents';
import { trackProjectActivity } from '../../../../lib/database/activity';
import { MethodRecommendationCard } from '../../../../components/methodology/MethodRecommendationCard';
import { StudyDesignForm } from '../../../../components/methodology/StudyDesignForm';
import type { Project } from '../../../../types/database';
import { saveMethodology, getProjectMethodology, type MethodologyData } from '@/lib/supabase/methodology';
import { createMethodologyEmbedding } from '@/lib/pinecone/methodologyEmbeddings';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Variable {
  id: string;
  name: string;
  description: string;
}

interface ParticipantsData {
  targetPopulation: string;
  sampleSize: string;
  recruitmentStrategy: string;
}

interface MethodRecommendation {
  title: string;
  rationale: string;
  keySteps: string[];
  timeEstimate: string;
  alternative?: {
    title: string;
    description: string;
  };
}

export default function MethodologyPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Methodology state
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<MethodRecommendation | null>(null);
  const [methodologySelected, setMethodologySelected] = useState(false);

  // Study design state
  const [independentVars, setIndependentVars] = useState<Variable[]>([]);
  const [dependentVars, setDependentVars] = useState<Variable[]>([]);
  const [controlVars, setControlVars] = useState<Variable[]>([]);
  const [participants, setParticipants] = useState<ParticipantsData>({
    targetPopulation: '',
    sampleSize: '',
    recruitmentStrategy: ''
  });
  const [procedure, setProcedure] = useState('');

  // Fetch project data and documents
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch project data
        const { data: projectData, error: projectError } = await getProject(params.id);
        if (projectError) {
          setError('Failed to load project');
          return;
        }
        setProject(projectData);

        // Track project activity for dashboard 'Continue Research'
        trackProjectActivity(params.id).catch(err => {
          console.warn('Failed to track project activity:', err);
        });

        // Fetch documents
        const { data: documentsData, error: docsError } = await getProjectDocuments(params.id);
        if (docsError) {
          console.warn('Error loading documents:', docsError);
        } else if (documentsData) {
          setDocuments(documentsData);
        }

        // Load existing methodology if it exists (gracefully handle 404 if table doesn't exist)
        const { data: existingMethodology, error: methodologyError } = await getProjectMethodology(params.id);

        // If table doesn't exist (404), skip loading existing data
        if (methodologyError && methodologyError.code === 'PGRST116') {
          console.log('ℹ️ No existing methodology found (table may not exist yet)');
        } else if (existingMethodology) {
          // Restore methodology state
          setRecommendation({
            title: existingMethodology.methodName,
            rationale: existingMethodology.reasoning || '',
            keySteps: [], // We don't store steps, so we'll leave empty or regenerate
            timeEstimate: '4-8 weeks' // Default fallback
          });
          setMethodologySelected(true);

          // Restore variables
          if (existingMethodology.independentVariables) {
            setIndependentVars(existingMethodology.independentVariables.map((v: any, i: number) => ({
              id: `iv-${i}`,
              name: v.name,
              description: v.description
            })));
          }
          if (existingMethodology.dependentVariables) {
            setDependentVars(existingMethodology.dependentVariables.map((v: any, i: number) => ({
              id: `dv-${i}`,
              name: v.name,
              description: v.description
            })));
          }
          if (existingMethodology.controlVariables) {
            setControlVars(existingMethodology.controlVariables.map((v: any, i: number) => ({
              id: `cv-${i}`,
              name: v.name,
              description: v.description
            })));
          }

          // Restore participants
          setParticipants({
            targetPopulation: existingMethodology.participantCriteria || '',
            sampleSize: existingMethodology.estimatedSampleSize?.toString() || '',
            recruitmentStrategy: existingMethodology.recruitmentStrategy || ''
          });

          // Restore procedure
          setProcedure(existingMethodology.procedureDraft || '');
        }

        // If we need to generate recommendation, set loading state FIRST to prevent flash
        if (!existingMethodology && projectData?.research_question) {
          setLoadingRecommendation(true);
        }

        // Set loading to false AFTER setting recommendation loading state
        // This ensures smooth transition from page load to recommendation load
        setLoading(false);

        // Generate recommendation in background if no existing methodology loaded
        // Don't await - let it load asynchronously
        if (!existingMethodology && projectData?.research_question) {
          generateMethodologyRecommendation(projectData.research_question).catch(err => {
            console.error('Error generating recommendation:', err);
            setLoadingRecommendation(false); // Clear loading state on error
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user]);

  // Generate methodology recommendation
  const generateMethodologyRecommendation = async (researchQuestion: string) => {
    setLoadingRecommendation(true);
    try {
      // Call AI API to generate recommendation
      const response = await fetch('/api/ai/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `You are a research methods advisor for undergraduate students. Based on this research question: "${researchQuestion}", recommend the most appropriate research methodology.

IMPORTANT: Tailor your recommendation to the research domain:
- Chemistry/Biology: Focus on experimental controls, lab safety, measurement precision
- Psychology/Social Science: Focus on validated instruments, ethical considerations, sampling strategies
- Observational studies: Explain why manipulation isn't appropriate, focus on systematic observation

Provide your recommendation in JSON format with:
1. **title**: Clear methodology name (e.g., "Experimental Study", "Correlational Survey", "Observational Field Study")
2. **rationale**: 2-3 sentences explaining why this methodology is ideal for THIS specific question. Use novice-friendly language.
3. **keySteps**: 4-6 detailed, actionable steps. Include domain-specific considerations:
   - For experiments: Control variables, randomization, measurement protocols
   - For surveys: Question design, sampling, validated scales
   - For observations: Coding schemes, inter-rater reliability, field protocols
4. **timeEstimate**: Realistic timeline (format: "X-Y weeks")
5. **alternative**: One alternative approach with brief rationale (especially if experimental design isn't feasible)

JSON structure:
{
  "title": "methodology name",
  "rationale": "why this works for this specific question, in student-friendly language",
  "keySteps": ["step 1 with specific details", "step 2...", ...],
  "timeEstimate": "4-8 weeks",
  "alternative": {
    "title": "alternative method name",
    "description": "brief explanation of when/why to use this instead"
  }
}

Make your language encouraging and accessible for novice researchers.`
            }
          ],
          projectContext: {
            projectId: params.id,
            researchQuestion: researchQuestion
          },
          useEnhanced: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.message.content;

        // Try to parse JSON from response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setRecommendation(parsed);
          } else {
            // Fallback recommendation
            setRecommendation({
              title: 'Survey Research',
              rationale: 'Based on your research question, a survey approach would allow you to collect data from multiple participants efficiently.',
              keySteps: [
                'Design survey questions aligned with your research question',
                'Pilot test the survey with a small group',
                'Distribute survey to target population',
                'Collect and organize responses',
                'Analyze data using statistical methods',
                'Draw conclusions and identify patterns'
              ],
              timeEstimate: '4-6 weeks',
              alternative: {
                title: 'Experimental Study',
                description: 'If you want to establish cause-and-effect relationships, consider an experimental design with control and treatment groups.'
              }
            });
          }
        } catch (parseError) {
          console.error('Error parsing recommendation:', parseError);
          // Use fallback
          setRecommendation({
            title: 'Observational Study',
            rationale: 'An observational approach allows you to study phenomena in natural settings without manipulation.',
            keySteps: [
              'Define what you will observe',
              'Create observation protocol',
              'Conduct observations systematically',
              'Record detailed field notes',
              'Analyze patterns and themes',
              'Draw conclusions from observations'
            ],
            timeEstimate: '3-5 weeks'
          });
        }
      }
    } catch (error) {
      console.error('Error generating recommendation:', error);
      // Set fallback recommendation
      setRecommendation({
        title: 'Exploratory Study',
        rationale: 'An exploratory approach will help you investigate your research question systematically.',
        keySteps: [
          'Review relevant literature',
          'Identify key variables',
          'Design data collection method',
          'Collect data from participants',
          'Analyze collected data',
          'Draw conclusions and recommendations'
        ],
        timeEstimate: '4-6 weeks'
      });
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // Handle methodology selection
  const handleAcceptMethodology = async () => {
    if (!recommendation || !project) return;

    try {
      // Save methodology to database
      const { data, error } = await saveMethodology(params.id, {
        methodType: recommendation.title.toLowerCase().replace(' ', '_'),
        methodName: recommendation.title,
        reasoning: recommendation.rationale,
        independentVariables: [],
        dependentVariables: [],
        controlVariables: []
      });

      if (error) {
        console.error('Error saving methodology:', error);
        alert('Failed to save methodology. Please try again.');
        return;
      }

      // Create embedding for AI context
      if (data) {
        await createMethodologyEmbedding(params.id, data);
      }

      setMethodologySelected(true);
      console.log('✅ Methodology saved successfully:', data);
    } catch (err) {
      console.error('Error in handleAcceptMethodology:', err);
      alert('Failed to save methodology. Please try again.');
    }
  };

  const handleRequestDifferent = async () => {
    if (project?.research_question) {
      await generateMethodologyRecommendation(project.research_question);
    }
  };

  // Handle study design saves
  const handleSaveVariables = async (data: {
    independentVars: Variable[];
    dependentVars: Variable[];
    controlVars: Variable[];
  }) => {
    try {
      // Update local state
      setIndependentVars(data.independentVars);
      setDependentVars(data.dependentVars);
      setControlVars(data.controlVars);

      // Save to database
      const { data: saved, error } = await saveMethodology(params.id, {
        methodType: recommendation?.title.toLowerCase().replace(' ', '_') || 'unknown',
        methodName: recommendation?.title || 'Research Method',
        reasoning: recommendation?.rationale,
        independentVariables: data.independentVars.map(v => ({ name: v.name, description: v.description })),
        dependentVariables: data.dependentVars.map(v => ({ name: v.name, description: v.description })),
        controlVariables: data.controlVars.map(v => ({ name: v.name, description: v.description })),
        participantCriteria: participants.targetPopulation,
        estimatedSampleSize: parseInt(participants.sampleSize) || undefined,
        recruitmentStrategy: participants.recruitmentStrategy,
        procedureDraft: procedure
      });

      if (error) {
        console.error('Error saving variables:', error);
        return;
      }

      // Update embedding
      if (saved) {
        await createMethodologyEmbedding(params.id, saved);
      }

      console.log('✅ Variables saved successfully');
    } catch (err) {
      console.error('Error in handleSaveVariables:', err);
    }
  };

  const handleSaveParticipants = async (data: ParticipantsData) => {
    try {
      // Update local state
      setParticipants(data);

      // Save to database
      const { data: saved, error } = await saveMethodology(params.id, {
        methodType: recommendation?.title.toLowerCase().replace(' ', '_') || 'unknown',
        methodName: recommendation?.title || 'Research Method',
        reasoning: recommendation?.rationale,
        independentVariables: independentVars.map(v => ({ name: v.name, description: v.description })),
        dependentVariables: dependentVars.map(v => ({ name: v.name, description: v.description })),
        controlVariables: controlVars.map(v => ({ name: v.name, description: v.description })),
        participantCriteria: data.targetPopulation,
        estimatedSampleSize: parseInt(data.sampleSize) || undefined,
        recruitmentStrategy: data.recruitmentStrategy,
        procedureDraft: procedure
      });

      if (error) {
        console.error('Error saving participants:', error);
        return;
      }

      // Update embedding
      if (saved) {
        await createMethodologyEmbedding(params.id, saved);
      }

      console.log('✅ Participants saved successfully');
    } catch (err) {
      console.error('Error in handleSaveParticipants:', err);
    }
  };

  const handleSaveProcedure = async (procedureText: string) => {
    try {
      // Update local state
      setProcedure(procedureText);

      // Save to database
      const { data: saved, error } = await saveMethodology(params.id, {
        methodType: recommendation?.title.toLowerCase().replace(' ', '_') || 'unknown',
        methodName: recommendation?.title || 'Research Method',
        reasoning: recommendation?.rationale,
        independentVariables: independentVars.map(v => ({ name: v.name, description: v.description })),
        dependentVariables: dependentVars.map(v => ({ name: v.name, description: v.description })),
        controlVariables: controlVars.map(v => ({ name: v.name, description: v.description })),
        participantCriteria: participants.targetPopulation,
        estimatedSampleSize: parseInt(participants.sampleSize) || undefined,
        recruitmentStrategy: participants.recruitmentStrategy,
        procedureDraft: procedureText
      });

      if (error) {
        console.error('Error saving procedure:', error);
        return;
      }

      // Update embedding
      if (saved) {
        await createMethodologyEmbedding(params.id, saved);
      }

      console.log('✅ Procedure saved successfully');
    } catch (err) {
      console.error('Error in handleSaveProcedure:', err);
    }
  };

  const handleRequestProcedureFeedback = async (procedureText: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Review this research procedure and provide constructive feedback:

${procedureText}

Provide feedback on:
1. Clarity and completeness
2. Logical flow of steps
3. Potential issues or missing details
4. Suggestions for improvement`
            }
          ],
          projectContext: {
            projectId: params.id,
            researchQuestion: project?.research_question
          },
          useEnhanced: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message.content;
      } else {
        return 'Unable to get feedback at this time. Please try again later.';
      }
    } catch (error) {
      console.error('Error getting procedure feedback:', error);
      return 'Error getting feedback. Please check your procedure and try again.';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1rem',
        color: '#6b7280'
      }}>
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1rem',
        color: '#ef4444'
      }}>
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
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
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                color: '#374151',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }}
            >
              ← Dashboard
            </button>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              {project.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Left Sidebar (25% width) */}
        <div style={{
          width: isSidebarOpen ? '25%' : '0',
          minWidth: isSidebarOpen ? '300px' : '0',
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
            {/* Navigation Menu */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 1rem 0'
              }}>
                Project Navigation
              </h3>

              {[
                { id: 'workspace', label: '💬 Workspace', path: `/projects/${params.id}`, active: false, icon: '💬' },
                { id: 'literature', label: '📚 Literature Review', path: `/projects/${params.id}/literature`, active: false, icon: '📚' },
                { id: 'methodology', label: '🔬 Methodology', path: `/projects/${params.id}/methodology`, active: true, icon: '🔬' },
                { id: 'writing', label: '✍️ Writing and Docs', path: `/projects/${params.id}/writing`, active: false, icon: '✍️' },
                { id: 'progress', label: '📊 Progress', path: `/projects/${params.id}/progress`, active: false, icon: '📊' },
                { id: 'settings', label: '⚙️ Project Settings', path: `/projects/${params.id}/settings`, active: false, icon: '⚙️' }
              ].map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => nav.active ? null : router.push(nav.path)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: nav.active ? '#eff6ff' : 'transparent',
                    color: nav.active ? '#3b82f6' : '#6b7280',
                    border: nav.active ? '1px solid #3b82f6' : '1px solid transparent',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: nav.active ? '600' : '500',
                    cursor: nav.active ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!nav.active) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!nav.active) {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{nav.icon}</span>
                  <span>{nav.label.replace(/^[^\s]+\s/, '')}</span>
                </button>
              ))}
            </div>

            {/* Research Question */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0
                }}>
                  Research Question
                </h3>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0,
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                {project.research_question}
              </p>
            </div>

            {/* Recent Documents */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>📄</span>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0
                  }}>
                    Recent Documents ({documents.length})
                  </h3>
                </div>
                <button
                  onClick={() => router.push(`/projects/${params.id}/literature`)}
                  style={{
                    fontSize: '0.75rem',
                    color: '#3b82f6',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {documents.length > 0 ? documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLDivElement).style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLDivElement).style.backgroundColor = 'white';
                  }}
                  >
                    <span>📄</span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {doc.original_name}
                    </span>
                  </div>
                )) : (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem'
                  }}>
                    No documents uploaded yet.
                    Use 📎 in Workspace to upload files.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area (75% width) */}
        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span>🔬</span> Methodology Planning
            </h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Method Recommendation Card */}
          <MethodRecommendationCard
            recommendation={recommendation}
            loading={loadingRecommendation}
            onAccept={handleAcceptMethodology}
            onRequestDifferent={handleRequestDifferent}
          />

          {/* Study Design Form (shown after methodology selected) */}
          {methodologySelected && (
            <StudyDesignForm
              data={{
                independentVars,
                dependentVars,
                controlVars,
                participants,
                procedure
              }}
              onSaveVariables={handleSaveVariables}
              onSaveParticipants={handleSaveParticipants}
              onSaveProcedure={handleSaveProcedure}
              onRequestProcedureFeedback={handleRequestProcedureFeedback}
            />
          )}
        </div>
      </div>
    </div>
  );
}
