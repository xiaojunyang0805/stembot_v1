'use client';

interface TimelinePhase {
  name: string;
  weeks: string;
  status: 'completed' | 'in_progress' | 'pending';
  icon: string;
  subItems?: Array<{
    name: string;
    progress: string;
    status: 'completed' | 'in_progress' | 'pending';
  }>;
}

interface ProjectTimelineProps {
  phases: TimelinePhase[];
  currentPhase: string;
  nextMilestone: string;
  estimatedCompletion: string;
}

export default function ProjectTimeline({
  phases,
  currentPhase,
  nextMilestone,
  estimatedCompletion
}: ProjectTimelineProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📅 Project Timeline
      </h2>

      {/* Timeline Phases */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {phases.map((phase, index) => {
          const isActive = phase.status === 'in_progress';
          const isCompleted = phase.status === 'completed';

          return (
            <div key={index}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: isActive ? '#eff6ff' : isCompleted ? '#f0fdf4' : '#f9fafb',
                borderRadius: '0.5rem',
                border: isActive ? '2px solid #3b82f6' : '1px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '1.25rem' }}>{phase.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    color: isCompleted ? '#16a34a' : isActive ? '#3b82f6' : '#6b7280'
                  }}>
                    {phase.name} ({phase.weeks})
                  </div>
                </div>
                {isActive && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#3b82f6',
                    fontWeight: '600'
                  }}>
                    ← You are here
                  </span>
                )}
              </div>

              {/* Sub-items for active phase */}
              {isActive && phase.subItems && (
                <div style={{
                  marginLeft: '2.5rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {phase.subItems.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: '#4b5563'
                    }}>
                      <span>
                        {item.status === 'completed' ? '✅' :
                         item.status === 'in_progress' ? '✍️' : '⏳'}
                      </span>
                      <span>{item.name} {item.progress && `(${item.progress})`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Milestone */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.5rem',
        border: '1px solid #fcd34d',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#92400e',
          marginBottom: '0.25rem'
        }}>
          Next Milestone
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#78350f'
        }}>
          {nextMilestone}
        </div>
      </div>

      {/* Estimated Completion */}
      <div style={{
        fontSize: '0.8125rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Estimated Completion: <span style={{ fontWeight: '600', color: '#111827' }}>{estimatedCompletion}</span>
      </div>
    </div>
  );
}
