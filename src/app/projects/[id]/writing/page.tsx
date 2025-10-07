'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject } from '../../../../lib/database/projects';
import { trackProjectActivity } from '../../../../lib/database/activity';
import type { Project } from '../../../../types/database';
import ExportDialog from '../../../../components/ui/ExportDialog';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface PaperSection {
  id: string;
  section_name: string;
  content: string;
  word_count: number;
  status: 'not_started' | 'in_progress' | 'completed';
  updated_at: string;
}

const DEFAULT_SECTIONS = [
  { name: 'Introduction', icon: '✍️', target: 800 },
  { name: 'Methods', icon: '🔬', target: 600 },
  { name: 'Results', icon: '📊', target: 800 },
  { name: 'Discussion', icon: '💬', target: 1000 },
  { name: 'Conclusion', icon: '🔚', target: 400 }
];

export default function WritingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<PaperSection[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('Introduction');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showHelp, setShowHelp] = useState(false);
  const [helpSuggestions, setHelpSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch project data and sections
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

        // Track project activity
        trackProjectActivity(params.id).catch(err => {
          console.warn('Failed to track project activity:', err);
        });

        // Fetch sections
        await fetchSections();

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user]);

  // Fetch sections from database
  const fetchSections = async () => {
    try {
      const response = await fetch(`/api/writing/sections?projectId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);

        // Load content for current section
        const current = data.sections?.find((s: PaperSection) => s.section_name === currentSection);
        if (current) {
          setContent(current.content || '');
        }
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  // Auto-save functionality
  const saveContent = useCallback(async (sectionName: string, newContent: string) => {
    try {
      setSaveStatus('saving');

      const wordCount = newContent.trim().split(/\s+/).filter(w => w.length > 0).length;
      const status = wordCount === 0 ? 'not_started' : wordCount > 50 ? 'in_progress' : 'not_started';

      const response = await fetch('/api/writing/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: params.id,
          sectionName,
          content: newContent,
          wordCount,
          status
        })
      });

      if (response.ok) {
        setSaveStatus('saved');
        // Refresh sections to update word counts and status
        await fetchSections();
      } else {
        setSaveStatus('unsaved');
      }
    } catch (err) {
      console.error('Error saving content:', err);
      setSaveStatus('unsaved');
    }
  }, [params.id]);

  // Handle content change with debounced auto-save
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus('unsaved');

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (30 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(currentSection, newContent);
    }, 30000);
  };

  // Manual save on section switch
  const handleSectionChange = async (sectionName: string) => {
    // Save current section first
    if (saveStatus !== 'saved' && content.trim()) {
      await saveContent(currentSection, content);
    }

    // Switch to new section
    setCurrentSection(sectionName);
    const section = sections.find(s => s.section_name === sectionName);
    setContent(section?.content || '');
    setShowHelp(false);
  };

  // Get writing help suggestions
  const getHelpSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/writing/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: params.id,
          sectionName: currentSection,
          currentContent: content
        })
      });

      if (response.ok) {
        const data = await response.json();
        setHelpSuggestions(data.suggestions || []);
        setShowHelp(true);
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Calculate total progress
  const totalWordCount = sections.reduce((sum, s) => sum + s.word_count, 0);
  const targetWordCount = DEFAULT_SECTIONS.reduce((sum, s) => sum + s.target, 0);
  const progressPercentage = Math.round((totalWordCount / targetWordCount) * 100);

  // Current section info
  const currentSectionData = sections.find(s => s.section_name === currentSection);
  const currentWordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const currentTarget = DEFAULT_SECTIONS.find(s => s.name === currentSection)?.target || 800;

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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
              {project.title} - Writing
            </h1>
          </div>
          <button
            onClick={() => setShowExportDialog(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            📄 Export Paper
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left Sidebar - Section List */}
        <div style={{
          width: '200px',
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          {/* Progress */}
          <div>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.75rem'
            }}>
              Progress
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#111827',
              fontWeight: '600',
              marginBottom: '0.25rem'
            }}>
              {totalWordCount} / {targetWordCount} words
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              ({progressPercentage}%)
            </p>
          </div>

          {/* Section List */}
          <div>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.75rem'
            }}>
              Sections
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DEFAULT_SECTIONS.map((section) => {
                const sectionData = sections.find(s => s.section_name === section.name);
                const status = sectionData?.status || 'not_started';
                const isActive = currentSection === section.name;

                return (
                  <button
                    key={section.name}
                    onClick={() => handleSectionChange(section.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      border: isActive ? '1px solid #3b82f6' : '1px solid transparent',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      color: isActive ? '#3b82f6' : '#374151',
                      fontWeight: isActive ? '600' : '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{section.icon}</span>
                    <span style={{ flex: 1 }}>{section.name}</span>
                    {status === 'in_progress' && (
                      <span style={{ fontSize: '0.75rem' }}>⏳</span>
                    )}
                    {status === 'not_started' && (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>○</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Writing Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Section Header */}
          <div style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white',
            flexShrink: 0
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              {currentSection}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <span>
                {currentWordCount} / {currentTarget} words
              </span>
              <span>•</span>
              <span style={{
                color: saveStatus === 'saved' ? '#10b981' : saveStatus === 'saving' ? '#f59e0b' : '#6b7280'
              }}>
                {saveStatus === 'saved' ? '✓ All changes saved' : saveStatus === 'saving' ? '⏳ Saving...' : '○ Unsaved changes'}
              </span>
            </div>
          </div>

          {/* Editor */}
          <div style={{
            flex: 1,
            padding: '2rem',
            overflow: 'auto',
            backgroundColor: '#ffffff'
          }}>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Start writing your ${currentSection.toLowerCase()}...`}
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '1rem',
                fontSize: '1rem',
                lineHeight: '1.75',
                color: '#111827',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                // Save on blur
                if (saveStatus !== 'saved') {
                  saveContent(currentSection, content);
                }
              }}
            />

            {/* Writing Help Panel */}
            <div style={{
              marginTop: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => {
                  if (!showHelp) {
                    getHelpSuggestions();
                  } else {
                    setShowHelp(false);
                  }
                }}
                disabled={loadingSuggestions}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  border: 'none',
                  borderBottom: showHelp ? '1px solid #e5e7eb' : 'none',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: loadingSuggestions ? 'wait' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  if (!loadingSuggestions) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
                }}
              >
                <span>💡 Writing Help from Memory</span>
                <span>{loadingSuggestions ? '⏳' : showHelp ? '▼' : '▶'}</span>
              </button>

              {showHelp && (
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white'
                }}>
                  {helpSuggestions.length > 0 ? (
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {helpSuggestions.map((suggestion, index) => (
                        <li key={index} style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          lineHeight: '1.6'
                        }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      No suggestions available. Add more sources or methodology to get contextual writing help.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        projectId={params.id}
        projectTitle={project.title}
      />
    </div>
  );
}
