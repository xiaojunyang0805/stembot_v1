'use client';

import { useState } from 'react';
import { getSampleSizeGuidance, getSampleSizeFeedback } from '@/lib/research/sampleSizeGuidance';

interface ParticipantsData {
  targetPopulation: string;
  sampleSize: string;
  recruitmentStrategy: string;
}

interface ParticipantsPlanningProps {
  data: ParticipantsData;
  onSave: (data: ParticipantsData) => Promise<void>;
  methodologyType?: string;
  methodologyName?: string;
}

export function ParticipantsPlanning({
  data: initialData,
  onSave,
  methodologyType = '',
  methodologyName = ''
}: ParticipantsPlanningProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ParticipantsData>(initialData);

  // Get sample size guidance for this methodology type
  const sampleSizeGuidance = getSampleSizeGuidance(methodologyType, methodologyName);

  // Get feedback if sample size is entered
  const sampleSizeFeedback =
    data.sampleSize && parseInt(data.sampleSize)
      ? getSampleSizeFeedback(parseInt(data.sampleSize), methodologyType)
      : null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving participants data:', error);
      alert('Failed to save participants data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isEmpty = !data.targetPopulation && !data.sampleSize && !data.recruitmentStrategy;

  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>👥</span> Participants
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            ✏️ Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : '✅ Save'}
            </button>
            <button
              onClick={() => {
                setData(initialData);
                setIsEditing(false);
              }}
              disabled={isSaving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#6b7280';
                }
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {isEmpty && !isEditing ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px dashed #d1d5db'
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>👥</span>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            No participant information defined yet. Click "Edit" to add details about your target population, sample size, and recruitment strategy.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Target Population */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🎯</span>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Target Population
              </h4>
              <span
                style={{
                  fontSize: '0.625rem',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem'
                }}
              >
                Who will you study?
              </span>
            </div>
            {isEditing ? (
              <textarea
                value={data.targetPopulation}
                onChange={(e) => setData({ ...data, targetPopulation: e.target.value })}
                placeholder="Describe your target population (e.g., 'High school students aged 14-18 in urban areas')"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  minHeight: '80px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {data.targetPopulation || <em style={{ color: '#9ca3af' }}>Not specified</em>}
              </p>
            )}
          </div>

          {/* Sample Size */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📊</span>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Sample Size
              </h4>
              <span
                style={{
                  fontSize: '0.625rem',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem'
                }}
              >
                How many participants?
              </span>
            </div>

            {/* Sample Size Guidance Box */}
            {isEditing && methodologyType && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>💡</span>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: 0 }}>
                    Sample Size Guidance
                  </h5>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600', margin: '0.5rem 0' }}>
                  {sampleSizeGuidance.guideline}
                </p>
                {sampleSizeGuidance.example && (
                  <p style={{ fontSize: '0.8125rem', color: '#3b82f6', margin: '0.5rem 0', fontStyle: 'italic' }}>
                    {sampleSizeGuidance.example}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', color: '#60a5fa', margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>
                  {sampleSizeGuidance.explanation}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.75rem 0 0 0', fontStyle: 'italic' }}>
                  This is a rule of thumb. Consult your advisor for your specific study.
                </p>
              </div>
            )}

            {isEditing ? (
              <input
                type="text"
                value={data.sampleSize}
                onChange={(e) => setData({ ...data, sampleSize: e.target.value })}
                placeholder="e.g., '50' or 'To be calculated based on power analysis'"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {data.sampleSize || <em style={{ color: '#9ca3af' }}>Not specified</em>}
              </p>
            )}

            {/* Sample Size Feedback */}
            {isEditing && sampleSizeFeedback && (
              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.8125rem',
                  color: '#b45309',
                  backgroundColor: '#fef3c7',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #fde047'
                }}
              >
                {sampleSizeFeedback}
              </div>
            )}
          </div>

          {/* Recruitment Strategy */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📢</span>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Recruitment Strategy
              </h4>
              <span
                style={{
                  fontSize: '0.625rem',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem'
                }}
              >
                How will you find them?
              </span>
            </div>
            {isEditing ? (
              <textarea
                value={data.recruitmentStrategy}
                onChange={(e) => setData({ ...data, recruitmentStrategy: e.target.value })}
                placeholder="Describe how you'll recruit participants (e.g., 'School announcements, social media, and flyers')"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  minHeight: '80px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {data.recruitmentStrategy || <em style={{ color: '#9ca3af' }}>Not specified</em>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
