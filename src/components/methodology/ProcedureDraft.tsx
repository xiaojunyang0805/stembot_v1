'use client';

import { useState, useEffect, useRef } from 'react';

interface ProcedureDraftProps {
  initialProcedure: string;
  onSave: (procedure: string) => Promise<void>;
  onRequestFeedback: (procedure: string) => Promise<string>;
}

export function ProcedureDraft({
  initialProcedure,
  onSave,
  onRequestFeedback
}: ProcedureDraftProps) {
  const [procedure, setProcedure] = useState(initialProcedure);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingFeedback, setIsRequestingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // Auto-save every 30 seconds
  useEffect(() => {
    if (procedure !== initialProcedure) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [procedure]);

  const handleAutoSave = async () => {
    if (procedure === initialProcedure) return;

    try {
      await onSave(procedure);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await onSave(procedure);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving procedure:', error);
      alert('Failed to save procedure. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!procedure.trim()) {
      alert('Please write a procedure before requesting feedback.');
      return;
    }

    setIsRequestingFeedback(true);
    setFeedback(null);

    try {
      const aiFeedback = await onRequestFeedback(procedure);
      setFeedback(aiFeedback);
    } catch (error) {
      console.error('Error getting feedback:', error);
      alert('Failed to get AI feedback. Please try again.');
    } finally {
      setIsRequestingFeedback(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>📝</span> Procedure Draft
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lastSaved && (
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={isSaving || procedure === initialProcedure}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: procedure === initialProcedure ? '#e5e7eb' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: procedure === initialProcedure ? 'not-allowed' : 'pointer',
              opacity: procedure === initialProcedure ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (procedure !== initialProcedure && !isSaving) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (procedure !== initialProcedure && !isSaving) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
              }
            }}
          >
            {isSaving ? 'Saving...' : '💾 Save Now'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fde047',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>💡</span>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', margin: 0 }}>
            Writing Your Procedure
          </h4>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.75rem', color: '#78350f', lineHeight: '1.6' }}>
          <li>Write step-by-step instructions for your study</li>
          <li>Include specific details: what, when, where, how</li>
          <li>Consider: materials needed, participant instructions, data collection methods</li>
          <li>Auto-saves every 30 seconds - no need to worry about losing work</li>
        </ul>
      </div>

      {/* Text Area */}
      <textarea
        value={procedure}
        onChange={(e) => setProcedure(e.target.value)}
        placeholder="Write your procedure here...

Example format:

1. Preparation
   - Gather materials: [list items]
   - Set up testing environment

2. Introduction (5 minutes)
   - Explain study purpose to participants
   - Obtain informed consent

3. Main Procedure (20 minutes)
   - Step 1: [detailed description]
   - Step 2: [detailed description]

4. Data Collection
   - Record measurements using [method]
   - Note any observations

5. Conclusion (5 minutes)
   - Debrief participants
   - Thank them for participation"
        style={{
          width: '100%',
          minHeight: '400px',
          padding: '1rem',
          border: '2px solid #d1d5db',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          lineHeight: '1.8',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: 'white'
        }}
      />

      {/* Feedback Button */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleGetFeedback}
          disabled={isRequestingFeedback || !procedure.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isRequestingFeedback || !procedure.trim() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: isRequestingFeedback || !procedure.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!isRequestingFeedback && procedure.trim()) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!isRequestingFeedback && procedure.trim()) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {isRequestingFeedback ? (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span>Getting AI Feedback...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Get AI Feedback on Procedure</span>
            </>
          )}
        </button>
      </div>

      {/* AI Feedback Display */}
      {feedback && (
        <div
          style={{
            marginTop: '1rem',
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e40af', margin: 0 }}>
              AI Feedback
            </h4>
          </div>
          <div
            style={{
              fontSize: '0.875rem',
              color: '#1e40af',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}
          >
            {feedback}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
