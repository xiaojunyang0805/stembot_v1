'use client';

import { useRouter } from 'next/navigation';

interface Section {
  name: string;
  wordCount: number;
  targetWords: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface WritingProgressDetailProps {
  sections: Section[];
  overallProgress: number;
  projectId: string;
}

export default function WritingProgressDetail({
  sections,
  overallProgress,
  projectId
}: WritingProgressDetailProps) {
  const router = useRouter();

  return (
    <div style={{
      backgroundColor: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>
            Writing
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0
          }}>
            Manuscript and report preparation
          </p>
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#8b5cf6'
        }}>
          {overallProgress}%
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '0.5rem',
        backgroundColor: '#e5e7eb',
        borderRadius: '0.25rem',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: `${overallProgress}%`,
          height: '100%',
          backgroundColor: '#8b5cf6',
          borderRadius: '0.25rem',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Section Status */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.75rem'
        }}>
          Section Status:
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {sections.map((section, index) => {
            const percentage = Math.round((section.wordCount / section.targetWords) * 100);
            const statusText = section.status === 'not_started' ? 'Not started' :
                             section.status === 'in_progress' ? 'In Progress' : 'Completed';
            const statusColor = section.status === 'not_started' ? '#9ca3af' :
                              section.status === 'in_progress' ? '#f59e0b' : '#10b981';

            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1
                }}>
                  <span style={{ color: statusColor }}>•</span>
                  <span style={{
                    fontSize: '0.8125rem',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {section.name}:
                  </span>
                  <span style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280'
                  }}>
                    {section.wordCount}/{section.targetWords} words
                  </span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: statusColor,
                  fontWeight: '500'
                }}>
                  ({statusText})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Writing Button */}
      <button
        onClick={() => router.push(`/projects/${projectId}/writing`)}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6';
        }}
      >
        ✍️ Continue Writing
      </button>
    </div>
  );
}
