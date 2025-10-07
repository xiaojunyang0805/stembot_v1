'use client';

/**
 * WP4-2.2: Critical Check Results UI
 * Displays methodology validation results in clear, non-overwhelming way
 *
 * Design Philosophy:
 * - Green checkmark if all good
 * - Orange/red warnings for issues
 * - Simple card layout with actionable fixes
 * - Students can proceed even with warnings
 */

import { CriticalCheckResult, CriticalIssue } from '@/lib/research/criticalChecker';

interface CriticalCheckResultsProps {
  result: CriticalCheckResult | null;
  loading?: boolean;
  onCheckAgain?: () => void;
  onSaveAnyway?: () => void;
  onSaveAndContinue?: () => void;
}

export function CriticalCheckResults({
  result,
  loading = false,
  onCheckAgain,
  onSaveAnyway,
  onSaveAndContinue
}: CriticalCheckResultsProps) {
  // Loading state
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '2px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginTop: '2rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Checking your methodology for critical issues...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  // ============================================================================
  // SUCCESS STATE: No Critical Issues
  // ============================================================================
  if (result.valid && result.warningCount === 0) {
    return (
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginTop: '2rem'
        }}
      >
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '2rem'
            }}
          >
            ✅
          </div>
        </div>

        {/* Success Title */}
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#166534',
            textAlign: 'center',
            marginBottom: '1rem'
          }}
        >
          No Critical Issues Found
        </h3>

        {/* Success Message */}
        <p
          style={{
            color: '#15803d',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}
        >
          Your methodology looks solid! Remember to:
        </p>

        {/* Reminders List */}
        <ul
          style={{
            backgroundColor: 'white',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            listStyle: 'none'
          }}
        >
          <li
            style={{
              color: '#166534',
              marginBottom: '0.75rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              fontSize: '0.9375rem'
            }}
          >
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Consult your advisor before starting data collection
          </li>
          <li
            style={{
              color: '#166534',
              marginBottom: '0.75rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              fontSize: '0.9375rem'
            }}
          >
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Get ethics approval if using human participants
          </li>
          <li
            style={{
              color: '#166534',
              paddingLeft: '1.5rem',
              position: 'relative',
              fontSize: '0.9375rem',
              marginBottom: 0
            }}
          >
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Keep good records of your procedure and any changes
          </li>
        </ul>

        {/* Action Button */}
        {onSaveAndContinue && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onSaveAndContinue}
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#22c55e';
              }}
            >
              Save & Continue →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // ERROR/WARNING STATE: Issues Found
  // ============================================================================
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');

  return (
    <div
      style={{
        backgroundColor: result.valid ? '#fffbeb' : '#fef2f2',
        border: `2px solid ${result.valid ? '#fde047' : '#fca5a5'}`,
        borderRadius: '0.75rem',
        padding: '2rem',
        marginTop: '2rem'
      }}
    >
      {/* Warning Icon */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: result.valid ? '#f59e0b' : '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: '2rem'
          }}
        >
          {result.valid ? '⚠️' : '🚨'}
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: result.valid ? '#92400e' : '#991b1b',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}
      >
        {result.valid ? 'Warnings to Review' : 'Critical Issues to Address'}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          color: result.valid ? '#b45309' : '#dc2626',
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '0.9375rem'
        }}
      >
        {result.valid
          ? `Found ${result.warningCount} warning(s). Review these suggestions before continuing.`
          : `Found ${result.errorCount} critical issue(s) that should be fixed before proceeding.`}
      </p>

      {/* Error Cards */}
      {errors.length > 0 && (
        <div style={{ marginBottom: warnings.length > 0 ? '1.5rem' : '2rem' }}>
          <h4
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#991b1b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🚨</span>
            <span>ERRORS (must fix before proceeding)</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errors.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} index={idx + 1} isError={true} />
            ))}
          </div>
        </div>
      )}

      {/* Warning Cards */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>⚠️</span>
            <span>WARNINGS (review recommended)</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {warnings.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} index={idx + 1} isError={false} />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        {onCheckAgain && (
          <button
            onClick={onCheckAgain}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Check Again
          </button>
        )}

        {onSaveAnyway && (
          <button
            onClick={onSaveAnyway}
            style={{
              backgroundColor: result.valid ? '#22c55e' : '#6b7280',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = result.valid ? '#16a34a' : '#4b5563';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = result.valid ? '#22c55e' : '#6b7280';
            }}
          >
            {result.valid ? 'Save & Continue' : 'Save Anyway'}
          </button>
        )}
      </div>

      {/* Help Text for Errors */}
      {!result.valid && (
        <p
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#dc2626',
            fontStyle: 'italic'
          }}
        >
          Note: You can save anyway, but we strongly recommend fixing critical issues first.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// ISSUE CARD COMPONENT
// ============================================================================

interface IssueCardProps {
  issue: CriticalIssue;
  index: number;
  isError: boolean;
}

function IssueCard({ issue, index, isError }: IssueCardProps) {
  const categoryEmoji: Record<string, string> = {
    sample: '📊',
    ethics: '🔒',
    feasibility: '⚙️'
  };

  const categoryLabel: Record<string, string> = {
    sample: 'SAMPLE SIZE',
    ethics: 'ETHICS',
    feasibility: 'FEASIBILITY'
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: `2px solid ${isError ? '#fca5a5' : '#fcd34d'}`,
        borderRadius: '0.5rem',
        padding: '1.25rem'
      }}
    >
      {/* Issue Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>{categoryEmoji[issue.category]}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: isError ? '#991b1b' : '#92400e',
              letterSpacing: '0.05em',
              marginBottom: '0.25rem'
            }}
          >
            {categoryLabel[issue.category]} • Issue #{index}
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div
        style={{
          backgroundColor: isError ? '#fef2f2' : '#fffbeb',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '0.75rem'
        }}
      >
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: isError ? '#991b1b' : '#92400e',
            marginBottom: '0.25rem'
          }}
        >
          Problem:
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: isError ? '#dc2626' : '#b45309',
            margin: 0,
            lineHeight: '1.5'
          }}
        >
          {issue.problem}
        </p>
      </div>

      {/* Fix Suggestion */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #bbf7d0'
        }}
      >
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: '#166534',
            marginBottom: '0.25rem'
          }}
        >
          {isError ? 'Fix:' : 'Suggestion:'}
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#15803d',
            margin: 0,
            lineHeight: '1.5'
          }}
        >
          {issue.fix}
        </p>
      </div>
    </div>
  );
}
