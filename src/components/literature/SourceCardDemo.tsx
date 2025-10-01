/**
 * SourceCard Demo Component - WP3 Testing and Integration
 *
 * Demonstrates the SourceCard component with sample data for testing
 * and integration into the literature page
 *
 * Location: src/components/literature/SourceCardDemo.tsx
 */

'use client';

import React, { useState } from 'react';
import { SourceCard, SourceData } from './SourceCard';
import { createSampleSources } from '@/lib/services/credibilityAssessment';

interface SourceCardDemoProps {
  projectId: string;
  researchQuestion?: string;
  className?: string;
}

export const SourceCardDemo: React.FC<SourceCardDemoProps> = ({
  projectId,
  researchQuestion = 'How does bacterial resistance to antibiotics develop?',
  className = ''
}) => {
  const [sources, setSources] = useState<SourceData[]>(createSampleSources());
  const [savedSources, setSavedSources] = useState<Set<string>>(new Set(['source-2']));

  // Handle source save/unsave
  const handleToggleSaved = (sourceId: string, isSaved: boolean) => {
    setSavedSources(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(sourceId);
      } else {
        newSet.delete(sourceId);
      }
      return newSet;
    });

    // Update source data
    setSources(prev => prev.map(source =>
      source.id === sourceId
        ? { ...source, isSaved }
        : source
    ));

    console.log(`Source ${sourceId} ${isSaved ? 'saved to' : 'removed from'} project ${projectId}`);
  };

  // Handle read summary
  const handleReadSummary = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (source) {
      alert(`Reading summary for: ${source.title}\n\nThis would open a detailed AI-generated summary of the research paper, highlighting key findings, methodology, and relevance to your research question.`);
    }
  };

  // Handle quality check
  const handleCheckQuality = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (source) {
      alert(`Quality assessment for: ${source.title}\n\nCredibility Level: ${source.credibility.level}\nScore: ${source.credibility.score}/100\n\nThis would show detailed quality metrics, peer review status, journal impact factor, and comparison with other sources in your field.`);
    }
  };

  return (
    <div className={className}>
      {/* Demo Header */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #3b82f6',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1e40af',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🧪 SourceCard Component Demo
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#1e40af',
          lineHeight: '1.6',
          marginBottom: '1rem'
        }}>
          <strong>Research Question:</strong> {researchQuestion}
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: '#3730a3',
          lineHeight: '1.5',
          margin: 0
        }}>
          This demo shows three sources with different credibility levels (High, Moderate, Low)
          to demonstrate the visual indicators, plain-language explanations, and interactive features
          of the SourceCard component.
        </p>
      </div>

      {/* Source Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
            {sources.filter(s => s.credibility.level === 'High').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#166534' }}>High Quality</div>
        </div>

        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #eab308',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟡</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a16207' }}>
            {sources.filter(s => s.credibility.level === 'Moderate').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#a16207' }}>Moderate Quality</div>
        </div>

        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔴</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
            {sources.filter(s => s.credibility.level === 'Low').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>Low Quality</div>
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#475569' }}>
            {savedSources.size}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Saved Sources</div>
        </div>
      </div>

      {/* Sources List */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📚 Literature Sources ({sources.length})
        </h3>

        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={{
              ...source,
              isSaved: savedSources.has(source.id)
            }}
            projectId={projectId}
            onToggleSaved={handleToggleSaved}
            onReadSummary={handleReadSummary}
            onCheckQuality={handleCheckQuality}
          />
        ))}
      </div>

      {/* Integration Notes */}
      <div style={{
        backgroundColor: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h4 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#334155',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔧 Integration Features
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          listStyleType: 'disc'
        }}>
          <li style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            <strong>Color-coded credibility:</strong> Green (High), Yellow (Moderate), Red (Low) border indicators
          </li>
          <li style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            <strong>Plain-language explanations:</strong> AI-generated explanations help novice researchers understand quality
          </li>
          <li style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            <strong>Interactive functionality:</strong> Save sources to project, expand details, access full text
          </li>
          <li style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            <strong>Supabase integration:</strong> Automatically saves/removes sources from project_sources table
          </li>
          <li style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: '1.5'
          }}>
            <strong>Responsive design:</strong> Works on all screen sizes with inline styles for reliable rendering
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SourceCardDemo;