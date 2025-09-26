/**
 * UserTypeSelector Component
 *
 * Reusable component for selecting user type (Student/Educator/Parent)
 * with educational context messaging for each type.
 * Features interactive selection cards with inline CSS styling.
 *
 * Location: src/components/auth/UserTypeSelector.tsx
 */

'use client'

import { useState } from 'react';

export type UserType = 'student' | 'educator' | 'parent';

interface UserTypeOption {
  type: UserType;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

interface UserTypeSelectorProps {
  selectedType?: UserType;
  onTypeChange: (type: UserType) => void;
  className?: string;
}

const userTypeOptions: UserTypeOption[] = [
  {
    type: 'student',
    icon: '🎓',
    title: 'Student',
    description: 'I want to learn and explore STEM subjects',
    features: [
      'Interactive learning modules',
      'Personalized study plans',
      'Progress tracking',
      'Gamified challenges'
    ]
  },
  {
    type: 'educator',
    icon: '👩‍🏫',
    title: 'Educator',
    description: 'I teach and want to help students learn',
    features: [
      'Classroom management tools',
      'Student progress analytics',
      'Curriculum alignment',
      'Assignment creation'
    ]
  },
  {
    type: 'parent',
    icon: '👨‍👩‍👧‍👦',
    title: 'Parent',
    description: 'I support my child\'s learning journey',
    features: [
      'Child progress monitoring',
      'Learning activity suggestions',
      'Educational resource library',
      'Communication with educators'
    ]
  }
];

export function UserTypeSelector({
  selectedType = 'student',
  onTypeChange,
  className
}: UserTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<UserType | null>(null);

  const handleTypeSelect = (type: UserType) => {
    onTypeChange(type);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Label */}
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '12px'
      }}>
        👤 I am a:
      </label>

      {/* User Type Cards */}
      <div style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: '1fr'
      }}>
        {userTypeOptions.map((option) => {
          const isSelected = selectedType === option.type;
          const isHovered = hoveredType === option.type;

          return (
            <div
              key={option.type}
              onClick={() => handleTypeSelect(option.type)}
              onMouseEnter={() => setHoveredType(option.type)}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                padding: '16px',
                border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                borderRadius: '12px',
                backgroundColor: isSelected ? '#eff6ff' : (isHovered ? '#f9fafb' : 'white'),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                  : (isHovered ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)')
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '24px',
                  marginRight: '12px'
                }}>
                  {option.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isSelected ? '#1d4ed8' : '#111827',
                    margin: 0,
                    marginBottom: '2px'
                  }}>
                    {option.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {option.description}
                  </p>
                </div>
                {/* Selection Indicator */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                  backgroundColor: isSelected ? '#2563eb' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {isSelected && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'white'
                    }} />
                  )}
                </div>
              </div>

              {/* Features List */}
              {(isSelected || isHovered) && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    What you'll get:
                  </p>
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none'
                  }}>
                    {option.features.map((feature, index) => (
                      <li
                        key={index}
                        style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{
                          width: '4px',
                          height: '4px',
                          backgroundColor: '#2563eb',
                          borderRadius: '50%',
                          marginRight: '8px',
                          flexShrink: 0
                        }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Educational Context Message */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <p style={{
            fontSize: '14px',
            color: '#0369a1',
            margin: 0,
            fontWeight: '500'
          }}>
            {selectedType === 'student' &&
              "Perfect! StemBot adapts to your learning style and pace, making STEM subjects engaging and fun."
            }
            {selectedType === 'educator' &&
              "Excellent! StemBot provides powerful tools to enhance your teaching and track student progress effectively."
            }
            {selectedType === 'parent' &&
              "Great choice! StemBot helps you stay connected with your child's learning journey and provides valuable insights."
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserTypeSelector;