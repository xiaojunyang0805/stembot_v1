'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import ResearchLayout from '../../../../components/layout/ResearchLayout';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function WritingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();

  const memoryHints = [
    {
      id: 'hint-1',
      title: 'Writing Structure',
      content: 'Your methodology section needs to detail the sleep assessment protocol and statistical analysis plan',
      type: 'reminder' as const,
      confidence: 0.94
    },
    {
      id: 'hint-2',
      title: 'Citation Style',
      content: 'Psychology journals typically use APA 7th edition. Ensure consistency throughout your manuscript',
      type: 'suggestion' as const,
      confidence: 0.89
    }
  ];

  // Convert AuthUser to User format expected by ResearchLayout
  const layoutUser = user ? {
    id: user.id,
    name: user.email?.split('@')[0] || 'Researcher',
    email: user.email || '',
    avatar: undefined
  } : undefined;

  return (
    <ResearchLayout
      currentPhase="writing"
      projectTitle="Sleep & Memory Research Study"
      projectId={params.id}
      user={layoutUser}
      memoryHints={memoryHints}
    >
      <div style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Navigation Banner */}
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
            {[
              { id: 'workspace', label: 'Workspace', path: `/projects/${params.id}`, active: false },
              { id: 'literature', label: 'Literature Review', path: `/projects/${params.id}/literature`, active: false },
              { id: 'methodology', label: 'Methodology', path: `/projects/${params.id}/methodology`, active: false },
              { id: 'writing', label: 'Academic Writing', path: `/projects/${params.id}/writing`, active: true }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => nav.active ? null : router.push(nav.path)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: nav.active ? '#2563eb' : 'white',
                  color: nav.active ? 'white' : '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: nav.active ? 'default' : 'pointer',
                  opacity: nav.active ? 1 : 0.8
                }}
                onMouseEnter={(e) => {
                  if (!nav.active) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!nav.active) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                  }
                }}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            ✍️ Academic Writing & Publication
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Transform your research into compelling academic papers with AI-powered writing assistance.
            Get help with structure, citations, and academic tone to meet publication standards.
          </p>
        </div>

        {/* Writing Interface */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#d97706',
            color: 'white'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <span style={{fontSize: '1.5rem'}}>✍️</span>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                margin: 0
              }}>
                Academic Writing Assistant
              </h2>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                AI-Powered Writing Support v2.1
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{
            padding: '2rem'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📝</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#d97706'
              }}>
                Academic Writing Workspace
              </div>
              <div style={{fontSize: '1rem', marginBottom: '2rem'}}>
                Professional writing tools with citation management, structure guidance, and publication support.
                This workspace will include:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginTop: '2rem',
                textAlign: 'left'
              }}>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📋</div>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Structure Templates</div>
                  <div style={{fontSize: '0.875rem', color: '#b45309'}}>Pre-built templates for research papers, theses, and journal articles</div>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📖</div>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Citation Management</div>
                  <div style={{fontSize: '0.875rem', color: '#b45309'}}>Automatic APA, MLA, Chicago formatting with reference tracking</div>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🎯</div>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Academic Tone</div>
                  <div style={{fontSize: '0.875rem', color: '#b45309'}}>AI suggestions for improving clarity, flow, and academic voice</div>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🚀</div>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Publication Ready</div>
                  <div style={{fontSize: '0.875rem', color: '#b45309'}}>Journal submission guidelines and peer review preparation</div>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📊</div>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Data Visualization</div>
                  <div style={{fontSize: '0.875rem', color: '#b45309'}}>Charts, tables, and figures integrated with your findings</div>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>✅</div>
                  <div style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Quality Assurance</div>
                  <div style={{fontSize: '0.875rem', color: '#b45309'}}>Grammar checking, plagiarism detection, and consistency validation</div>
                </div>
              </div>

              <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                backgroundColor: '#fef3c7',
                borderRadius: '0.5rem',
                border: '1px solid #fcd34d'
              }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '0.75rem'
                }}>
                  📝 Coming Soon: Advanced Writing Features
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#b45309',
                  textAlign: 'left'
                }}>
                  Our writing workspace is being enhanced with collaborative editing, real-time feedback,
                  and integration with major academic databases. Sign up for early access to these
                  professional writing tools designed specifically for STEM research.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResearchLayout>
  );
}