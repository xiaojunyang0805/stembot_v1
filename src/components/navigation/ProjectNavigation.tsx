'use client';

import { useRouter } from 'next/navigation';

interface ProjectNavigationProps {
  projectId: string;
  currentPhase: 'workspace' | 'literature' | 'methodology' | 'writing';
}

export default function ProjectNavigation({ projectId, currentPhase }: ProjectNavigationProps) {
  const router = useRouter();

  const navigationItems = [
    { id: 'workspace', label: 'Workspace', path: `/projects/${projectId}` },
    { id: 'literature', label: 'Literature Review', path: `/projects/${projectId}/literature` },
    { id: 'methodology', label: 'Methodology', path: `/projects/${projectId}/methodology` },
    { id: 'writing', label: 'Academic Writing', path: `/projects/${projectId}/writing` }
  ];

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      borderRadius: '0.5rem'
    }}>
      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        {navigationItems.map((nav) => {
          const isActive = currentPhase === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => isActive ? null : router.push(nav.path)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isActive ? '#2563eb' : 'white',
                color: isActive ? 'white' : '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isActive ? 'default' : 'pointer',
                opacity: isActive ? 1 : 0.8
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }
              }}
            >
              {nav.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}