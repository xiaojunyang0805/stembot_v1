'use client';

import { useState } from 'react';

interface MethodRecommendation {
  title: string;
  rationale: string;
  keySteps: string[];
  timeEstimate: string;
  alternative?: {
    title: string;
    description: string;
  };
}

interface MethodRecommendationCardProps {
  recommendation: MethodRecommendation | null;
  loading: boolean;
  onAccept: () => void;
  onRequestDifferent: () => void;
  onShowAlternative?: () => void;
}

export function MethodRecommendationCard({
  recommendation,
  loading,
  onAccept,
  onRequestDifferent,
  onShowAlternative
}: MethodRecommendationCardProps) {
  const [showAlternative, setShowAlternative] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #bfdbfe',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #dbeafe',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p style={{ color: '#1e40af', fontSize: '1rem', margin: 0 }}>
            Analyzing your research question and generating methodology recommendations...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div
        style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #fde047',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔬</span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', margin: 0 }}>
          No Methodology Recommendation Yet
        </h3>
        <p style={{ color: '#78350f', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
          Methodology recommendations will appear here based on your research question.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '0.75rem',
        padding: '2rem',
        marginBottom: '2rem'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🎯</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
            {recommendation.title}
          </h2>
        </div>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          ⏱️ Estimated Time: {recommendation.timeEstimate}
        </div>
      </div>

      {/* Why This Works */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>💡</span> Why This Works
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.6', margin: 0 }}>
          {recommendation.rationale}
        </p>
      </div>

      {/* Key Steps */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>📋</span> Key Steps You'll Follow
        </h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          {recommendation.keySteps.map((step, index) => (
            <li
              key={index}
              style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                lineHeight: '1.6',
                marginBottom: '0.5rem'
              }}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Alternative Method */}
      {recommendation.alternative && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setShowAlternative(!showAlternative)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              marginBottom: '0.5rem'
            }}
          >
            {showAlternative ? '▼' : '▶'} View Alternative Method
          </button>
          {showAlternative && (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #bfdbfe',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '0.5rem'
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem', margin: 0 }}>
                {recommendation.alternative.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#3b82f6', margin: '0.5rem 0 0 0' }}>
                {recommendation.alternative.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={onAccept}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
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
          ✅ Use This Method
        </button>
        <button
          onClick={onRequestDifferent}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'white',
            color: '#3b82f6',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#f0f9ff';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'white';
          }}
        >
          🔄 Request Different Method
        </button>
      </div>
    </div>
  );
}
