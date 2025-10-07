'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showFallback?: boolean;
  fallbackContent?: React.ReactNode;
}

/**
 * Error Display Component for Methodology Features
 * Provides clear error messages and recovery options
 */
export function ErrorDisplay({ error, onRetry, showFallback, fallbackContent }: ErrorDisplayProps) {
  return (
    <div style={{
      backgroundColor: '#fef2f2',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #fecaca',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '0.5rem',
            margin: 0
          }}>
            Something went wrong
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#7f1d1d',
            marginBottom: '1rem',
            margin: 0,
            marginTop: '0.5rem'
          }}>
            {error}
          </p>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
                }}
              >
                🔄 Try Again
              </button>
            )}

            {showFallback && fallbackContent && (
              <button
                onClick={() => {
                  const fallbackDiv = document.getElementById('fallback-content');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = fallbackDiv.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#991b1b',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #fecaca',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }}
              >
                📋 Show Generic Guidelines
              </button>
            )}
          </div>

          {showFallback && fallbackContent && (
            <div
              id="fallback-content"
              style={{
                display: 'none',
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.375rem',
                border: '1px solid #fecaca'
              }}
            >
              {fallbackContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SaveErrorProps {
  onRetry: () => void;
  localCopySaved?: boolean;
}

/**
 * Save Error Display with Auto-Retry
 */
export function SaveErrorDisplay({ onRetry, localCopySaved = true }: SaveErrorProps) {
  return (
    <div style={{
      backgroundColor: '#fef3c7',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #fde68a',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '1.25rem' }}>💾</span>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '0.25rem',
            margin: 0
          }}>
            Save Failed
          </h4>
          <p style={{
            fontSize: '0.75rem',
            color: '#78350f',
            marginBottom: '0.75rem',
            margin: 0,
            marginTop: '0.25rem'
          }}>
            {localCopySaved
              ? "Don't worry! Your work is saved locally and we'll keep trying to sync it."
              : "We're having trouble saving your work. Please try again."}
          </p>
          <button
            onClick={onRetry}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.25rem',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#d97706';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f59e0b';
            }}
          >
            Retry Save Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface GenericGuidelinesProps {
  methodologyType?: string;
}

/**
 * Generic Methodology Guidelines Fallback
 */
export function GenericMethodologyGuidelines({ methodologyType = 'research' }: GenericGuidelinesProps) {
  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '1rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      color: '#374151'
    }}>
      <h4 style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '0.75rem',
        margin: 0
      }}>
        Generic {methodologyType} Guidelines
      </h4>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.25rem'
        }}>
          1. Define Your Variables
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>
          Clearly identify what you're measuring (dependent variables) and what you're manipulating or observing (independent variables).
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.25rem'
        }}>
          2. Plan Your Sample
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>
          Determine who will participate, how many participants you need, and how you'll recruit them.
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.25rem'
        }}>
          3. Design Your Procedure
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>
          Outline step-by-step what participants will do and what data you'll collect at each stage.
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.25rem'
        }}>
          4. Consider Ethics
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>
          Ensure participant consent, confidentiality, and consult with your advisor about institutional review requirements.
        </p>
      </div>

      <div>
        <div style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.25rem'
        }}>
          5. Plan Your Analysis
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>
          Decide how you'll analyze your data before you collect it. This ensures you collect the right information.
        </p>
      </div>
    </div>
  );
}

/**
 * Utility function to retry async operations with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Local storage manager for methodology data
 */
export class MethodologyLocalStorage {
  private static KEY_PREFIX = 'methodology_draft_';

  static save(projectId: string, data: any): void {
    try {
      const key = this.KEY_PREFIX + projectId;
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  static load(projectId: string): any | null {
    try {
      const key = this.KEY_PREFIX + projectId;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const { data, timestamp } = JSON.parse(stored);

      // Expire after 7 days
      const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > MAX_AGE) {
        this.clear(projectId);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load from local storage:', error);
      return null;
    }
  }

  static clear(projectId: string): void {
    try {
      const key = this.KEY_PREFIX + projectId;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear local storage:', error);
    }
  }
}
