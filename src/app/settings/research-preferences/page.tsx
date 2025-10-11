'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { getUserPreferences, updateResearchPreferences, getDefaultPreferences, type ResearchPreferences } from '../../../lib/database/userPreferences';

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const METHODOLOGIES = [
  { value: 'experimental', label: 'Experimental Research', description: 'Controlled experiments with variables' },
  { value: 'survey', label: 'Survey Research', description: 'Data collection through questionnaires' },
  { value: 'observational', label: 'Observational Studies', description: 'Systematic observation without intervention' },
  { value: 'case_study', label: 'Case Study', description: 'In-depth analysis of specific cases' },
  { value: 'longitudinal', label: 'Longitudinal Study', description: 'Data collection over extended periods' },
  { value: 'mixed_methods', label: 'Mixed Methods', description: 'Combining qualitative and quantitative approaches' }
];

const STATISTICAL_SOFTWARE = [
  'SPSS', 'R', 'Python (pandas/scipy)', 'Excel', 'STATA', 'SAS', 'MATLAB', 'Other'
];

const CITATION_STYLES = [
  { value: 'APA', label: 'APA (American Psychological Association)' },
  { value: 'MLA', label: 'MLA (Modern Language Association)' },
  { value: 'Chicago', label: 'Chicago/Turabian' },
  { value: 'IEEE', label: 'IEEE (Institute of Electrical and Electronics Engineers)' },
  { value: 'Harvard', label: 'Harvard' },
  { value: 'Vancouver', label: 'Vancouver' }
];

const AI_ASSISTANCE_LEVELS = [
  { value: 'minimal', label: 'Minimal', description: 'Only provide assistance when explicitly requested' },
  { value: 'moderate', label: 'Moderate', description: 'Offer suggestions proactively but not too frequently' },
  { value: 'maximum', label: 'Maximum', description: 'Provide frequent guidance and suggestions throughout' }
];

export default function ResearchPreferencesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<ResearchPreferences>({
    methodologies: [],
    statistical_software: 'SPSS',
    citation_style: 'APA',
    ai_assistance_level: 'moderate',
    auto_save: true,
    default_timeline_weeks: 12
  });

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data: userPrefs, error } = await getUserPreferences();

        if (error) {
          console.warn('Error loading preferences:', error);
        } else if (userPrefs) {
          setPreferences(userPrefs.research_preferences);
        } else {
          // Use defaults
          const defaults = getDefaultPreferences(user.id);
          setPreferences(defaults.research_preferences);
        }
      } catch (error) {
        console.error('Error loading research preferences:', error);
      }
    };

    loadPreferences();
  }, [user]);

  const handleMethodologyToggle = (methodology: string) => {
    setPreferences(prev => ({
      ...prev,
      methodologies: prev.methodologies.includes(methodology)
        ? prev.methodologies.filter(m => m !== methodology)
        : [...prev.methodologies, methodology]
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const { error } = await updateResearchPreferences(preferences);

      if (error) {
        setSaveError('Failed to save research preferences. Please try again.');
        console.error('Error saving preferences:', error);
      } else {
        setSaveMessage('Research preferences saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveError('An unexpected error occurred. Please try again.');
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '0.5rem'
      }}>
        🔬 Research Preferences
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Customize your research workflow and default settings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Preferred Research Methodologies */}
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            Preferred Research Methodologies
          </h3>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Select the research approaches you typically use. This helps us provide more relevant suggestions.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.75rem'
          }}>
            {METHODOLOGIES.map((methodology) => (
              <label
                key={methodology.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: preferences.methodologies.includes(methodology.value) ? '#eff6ff' : '#f9fafb',
                  border: `1px solid ${preferences.methodologies.includes(methodology.value) ? '#bae6fd' : '#e5e7eb'}`,
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!preferences.methodologies.includes(methodology.value)) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!preferences.methodologies.includes(methodology.value)) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={preferences.methodologies.includes(methodology.value)}
                  onChange={() => handleMethodologyToggle(methodology.value)}
                  style={{
                    marginTop: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ flex: '1' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {methodology.label}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {methodology.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Statistical Software */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            Statistical Software Preference
          </label>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.75rem'
          }}>
            Choose your preferred statistical analysis tool.
          </p>
          <select
            value={preferences.statistical_software}
            onChange={(e) => setPreferences(prev => ({ ...prev, statistical_software: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            {STATISTICAL_SOFTWARE.map(software => (
              <option key={software} value={software}>{software}</option>
            ))}
          </select>
        </div>

        {/* Citation Style */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            Default Citation Style
          </label>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.75rem'
          }}>
            Select your preferred citation format for research papers.
          </p>
          <select
            value={preferences.citation_style}
            onChange={(e) => setPreferences(prev => ({ ...prev, citation_style: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            {CITATION_STYLES.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>

        {/* AI Assistance Level */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            AI Assistance Level
          </label>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Control how proactively the AI provides suggestions and guidance.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {AI_ASSISTANCE_LEVELS.map((level) => (
              <label
                key={level.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: preferences.ai_assistance_level === level.value ? '#eff6ff' : '#f9fafb',
                  border: `1px solid ${preferences.ai_assistance_level === level.value ? '#bae6fd' : '#e5e7eb'}`,
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (preferences.ai_assistance_level !== level.value) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (preferences.ai_assistance_level !== level.value) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                  }
                }}
              >
                <input
                  type="radio"
                  name="ai_assistance"
                  checked={preferences.ai_assistance_level === level.value}
                  onChange={() => setPreferences(prev => ({ ...prev, ai_assistance_level: level.value as any }))}
                  style={{
                    marginTop: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ flex: '1' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {level.label}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {level.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Auto-save Settings */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                Auto-save Work
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Automatically save your progress every few minutes
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.auto_save}
              onChange={(e) => setPreferences(prev => ({ ...prev, auto_save: e.target.checked }))}
              style={{
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer'
              }}
            />
          </label>
        </div>

        {/* Default Timeline Duration */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            Default Project Timeline
          </label>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.75rem'
          }}>
            Set the default duration for new research projects.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <input
              type="range"
              min="4"
              max="52"
              step="2"
              value={preferences.default_timeline_weeks}
              onChange={(e) => setPreferences(prev => ({ ...prev, default_timeline_weeks: parseInt(e.target.value) }))}
              style={{
                flex: '1',
                height: '0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            />
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1e40af',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              {preferences.default_timeline_weeks} weeks
              <div style={{
                fontSize: '0.625rem',
                fontWeight: '400',
                marginTop: '0.125rem'
              }}>
                (~{Math.round(preferences.default_timeline_weeks / 4)} months)
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#1e40af',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <span>💡</span>
            <div>
              <strong>Tip:</strong> These preferences help us tailor the research assistance to your specific needs.
              You can always change them later as your research focus evolves.
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(saveMessage || saveError) && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: saveMessage ? '#d1fae5' : '#fee2e2',
            color: saveMessage ? '#065f46' : '#991b1b',
            border: `1px solid ${saveMessage ? '#a7f3d0' : '#fecaca'}`
          }}>
            {saveMessage ? '✅ ' + saveMessage : '❌ ' + saveError}
          </div>
        )}

        {/* Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : (
              <>💾 Save Preferences</>
            )}
          </button>
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
