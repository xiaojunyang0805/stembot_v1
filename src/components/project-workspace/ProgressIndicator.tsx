/**
 * Progress Indicator Component
 * Phase circles with labels and progress tracking
 */

'use client'

import { CheckCircle, Circle, Play } from 'lucide-react'
import { PhaseProgress, ResearchPhase } from '../../types/project-workspace'

interface ProgressIndicatorProps {
  phases: PhaseProgress[]
  currentPhase: ResearchPhase
  onPhaseClick?: (phase: ResearchPhase) => void
  compact?: boolean
}

export default function ProgressIndicator({
  phases,
  currentPhase,
  onPhaseClick,
  compact = false
}: ProgressIndicatorProps) {
  const getPhaseStyle = (phase: PhaseProgress) => {
    if (phase.isCompleted) {
      return {
        backgroundColor: phase.color,
        borderColor: phase.color,
        color: 'white'
      }
    } else if (phase.isActive) {
      return {
        backgroundColor: 'white',
        borderColor: phase.color,
        color: phase.color,
        borderWidth: '2px'
      }
    } else {
      return {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
        color: '#9ca3af'
      }
    }
  }

  const getConnectorStyle = (index: number) => {
    const currentPhaseIndex = phases.findIndex(p => p.phase === currentPhase)
    const isCompleted = index < currentPhaseIndex || phases[index].isCompleted

    return {
      backgroundColor: isCompleted ? phases[index]?.color || '#10b981' : '#e5e7eb'
    }
  }

  const getTextColor = (phase: PhaseProgress) => {
    if (phase.isActive) return '#111827'
    if (phase.isCompleted) return '#374151'
    return '#6b7280'
  }

  const getDescriptionColor = (phase: PhaseProgress) => {
    if (phase.isActive) return '#4b5563'
    if (phase.isCompleted) return '#6b7280'
    return '#9ca3af'
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {phases.map((phase, index) => {
          const style = getPhaseStyle(phase)

          return (
            <div key={phase.phase} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => onPhaseClick?.(phase.phase)}
                style={{
                  position: 'relative',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: (!phase.isCompleted && !phase.isActive) ? 'not-allowed' : 'pointer'
                }}
                disabled={!phase.isCompleted && !phase.isActive}
                onMouseEnter={(e) => {
                  const tooltip = (e.currentTarget as HTMLButtonElement).querySelector('.tooltip') as HTMLElement
                  if (tooltip) tooltip.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  const tooltip = (e.currentTarget as HTMLButtonElement).querySelector('.tooltip') as HTMLElement
                  if (tooltip) tooltip.style.opacity = '0'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                    ...style
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLDivElement).style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLDivElement).style.transform = 'scale(1)'
                  }}
                >
                  {phase.isCompleted ? (
                    <CheckCircle style={{ width: '12px', height: '12px' }} />
                  ) : phase.isActive ? (
                    <Play style={{ width: '12px', height: '12px' }} />
                  ) : (
                    <Circle style={{ width: '12px', height: '12px' }} />
                  )}
                </div>

                {/* Tooltip */}
                <div className="tooltip" style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '4px',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 10
                }}>
                  {phase.label}
                </div>
              </button>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div
                  style={{
                    width: '16px',
                    height: '2px',
                    margin: '0 4px',
                    transition: 'background-color 0.3s',
                    ...getConnectorStyle(index)
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#111827',
        marginBottom: '16px'
      }}>Research Progress</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {phases.map((phase, index) => {
          const style = getPhaseStyle(phase)

          return (
            <div key={phase.phase} style={{ position: 'relative' }}>
              {/* Connector Line for non-compact view */}
              {index < phases.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '32px',
                  width: '2px',
                  height: '24px',
                  transition: 'background-color 0.3s',
                  ...getConnectorStyle(index)
                }} />
              )}

              <button
                onClick={() => onPhaseClick?.(phase.phase)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: (!phase.isCompleted && !phase.isActive) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                disabled={!phase.isCompleted && !phase.isActive}
                onMouseEnter={(e) => {
                  if (phase.isCompleted || phase.isActive) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    const circle = (e.currentTarget as HTMLButtonElement).querySelector('.phase-circle') as HTMLElement
                    if (circle) circle.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  const circle = (e.currentTarget as HTMLButtonElement).querySelector('.phase-circle') as HTMLElement
                  if (circle) circle.style.transform = 'scale(1)'
                }}
              >
                {/* Phase Circle */}
                <div
                  className="phase-circle"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                    ...style
                  }}
                >
                  {phase.isCompleted ? (
                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                  ) : phase.isActive ? (
                    <Play style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <Circle style={{ width: '16px', height: '16px' }} />
                  )}
                </div>

                {/* Phase Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: getTextColor(phase)
                    }}>
                      {phase.label}
                    </h4>

                    {phase.isCompleted && phase.completedAt && (
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {phase.completedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '12px',
                    marginTop: '4px',
                    color: getDescriptionColor(phase)
                  }}>
                    {phase.description}
                  </p>

                  {phase.isActive && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }} />
                      <span style={{
                        fontSize: '12px',
                        color: '#2563eb',
                        fontWeight: '500'
                      }}>In Progress</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Overall Progress */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151'
          }}>Overall Progress</span>
          <span style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {Math.round((phases.filter(p => p.isCompleted).length / phases.length) * 100)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          height: '8px'
        }}>
          <div
            style={{
              backgroundColor: '#3b82f6',
              height: '8px',
              borderRadius: '9999px',
              transition: 'all 0.5s',
              width: `${(phases.filter(p => p.isCompleted).length / phases.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}