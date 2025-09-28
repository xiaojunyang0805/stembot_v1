'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import ResearchLayout from '../../../../components/layout/ResearchLayout';
import MethodologyGuide from '../../../../components/research/MethodologyGuide';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function MethodologyPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleMethodologyUpdate = (methodology: any) => {
    console.log('Methodology updated:', methodology);
  };

  const memoryHints = [
    {
      id: 'hint-1',
      title: 'Research Design Pattern',
      content: 'Cross-sectional designs work well for sleep-memory correlations in undergraduate populations',
      type: 'suggestion' as const,
      confidence: 0.89
    },
    {
      id: 'hint-2',
      title: 'Sample Size Memory',
      content: 'Previous discussions indicated n=120 needed for 80% power with medium effect size',
      type: 'reminder' as const,
      confidence: 0.94
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
      currentPhase="methodology"
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
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            🔬 Methodology Design & Validation
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Design your research methodology with AI-powered validation and flaw detection.
            Our intelligent system helps identify potential issues before you begin data collection.
          </p>
        </div>

        <MethodologyGuide
          currentProjectId={params.id}
          onMethodologyUpdate={handleMethodologyUpdate}
        />
      </div>
    </ResearchLayout>
  );
}