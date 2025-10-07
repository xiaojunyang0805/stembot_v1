'use client';

import { useState, useEffect } from 'react';
import { VariablesInput } from './VariablesInput';
import { ParticipantsPlanning } from './ParticipantsPlanning';
import { ProcedureDraft } from './ProcedureDraft';
import { CriticalCheckResults } from './CriticalCheckResults';
import { checkCriticalIssues, type CriticalCheckResult } from '@/lib/research/criticalChecker';
import { type MethodologyData } from '@/lib/supabase/methodology';

interface Variable {
  id: string;
  name: string;
  description: string;
}

interface ParticipantsData {
  targetPopulation: string;
  sampleSize: string;
  recruitmentStrategy: string;
}

interface StudyDesignData {
  independentVars: Variable[];
  dependentVars: Variable[];
  controlVars: Variable[];
  participants: ParticipantsData;
  procedure: string;
}

interface StudyDesignFormProps {
  data: StudyDesignData;
  methodologyType?: string;
  methodologyName?: string;
  reasoning?: string;
  onSaveVariables: (data: {
    independentVars: Variable[];
    dependentVars: Variable[];
    controlVars: Variable[];
  }) => Promise<void>;
  onSaveParticipants: (data: ParticipantsData) => Promise<void>;
  onSaveProcedure: (procedure: string) => Promise<void>;
  onRequestProcedureFeedback: (procedure: string) => Promise<string>;
  onContinueAfterCheck?: () => void;
}

export function StudyDesignForm({
  data,
  methodologyType = '',
  methodologyName = '',
  reasoning = '',
  onSaveVariables,
  onSaveParticipants,
  onSaveProcedure,
  onRequestProcedureFeedback,
  onContinueAfterCheck
}: StudyDesignFormProps) {
  const [criticalCheckResult, setCriticalCheckResult] = useState<CriticalCheckResult | null>(null);
  const [isCheckingCritical, setIsCheckingCritical] = useState(false);

  // Auto-check critical issues when all required fields are filled
  useEffect(() => {
    // Only check if we have the minimum required data
    if (data.procedure && data.participants.sampleSize) {
      performCriticalCheck();
    }
  }, [data.procedure, data.participants.sampleSize, data.participants.targetPopulation]);

  const performCriticalCheck = () => {
    setIsCheckingCritical(true);

    // Build MethodologyData from current form state
    const methodologyData: MethodologyData = {
      projectId: 'current', // Placeholder - not used in validation
      methodType: methodologyType,
      methodName: methodologyName,
      reasoning: reasoning,
      independentVariables: data.independentVars.map(v => ({
        name: v.name,
        description: v.description
      })),
      dependentVariables: data.dependentVars.map(v => ({
        name: v.name,
        description: v.description
      })),
      controlVariables: data.controlVars.map(v => ({
        name: v.name,
        description: v.description
      })),
      participantCriteria: data.participants.targetPopulation,
      estimatedSampleSize: parseInt(data.participants.sampleSize) || undefined,
      recruitmentStrategy: data.participants.recruitmentStrategy,
      procedureDraft: data.procedure
    };

    // Run critical check
    const result = checkCriticalIssues(methodologyData);
    setCriticalCheckResult(result);
    setIsCheckingCritical(false);
  };

  const handleCheckAgain = () => {
    performCriticalCheck();
  };

  const handleSaveAndContinue = () => {
    if (onContinueAfterCheck) {
      onContinueAfterCheck();
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div
        style={{
          backgroundColor: '#f0f9ff',
          border: '2px solid #3b82f6',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🔬</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
            Study Design Details
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.6', margin: 0 }}>
          Now that you've selected a methodology, let's design the specifics of your study.
          Fill out each section below to create a comprehensive research plan.
        </p>
      </div>

      {/* Variables Section */}
      <VariablesInput
        independentVars={data.independentVars}
        dependentVars={data.dependentVars}
        controlVars={data.controlVars}
        onSave={onSaveVariables}
      />

      {/* Participants Section */}
      <ParticipantsPlanning
        data={data.participants}
        onSave={onSaveParticipants}
        methodologyType={methodologyType}
        methodologyName={methodologyName}
      />

      {/* Procedure Section */}
      <ProcedureDraft
        initialProcedure={data.procedure}
        onSave={onSaveProcedure}
        onRequestFeedback={onRequestProcedureFeedback}
      />

      {/* Critical Check Results - Shows after procedure is filled */}
      {data.procedure && data.participants.sampleSize && (
        <CriticalCheckResults
          result={criticalCheckResult}
          loading={isCheckingCritical}
          onCheckAgain={handleCheckAgain}
          onSaveAnyway={handleSaveAndContinue}
          onSaveAndContinue={handleSaveAndContinue}
        />
      )}

      {/* Helpful Tips */}
      <div
        style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fde047',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>💡</span>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#92400e', margin: 0 }}>
            Study Design Tips
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem', margin: 0 }}>
              🎯 Clear Variables
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#78350f', lineHeight: '1.4', margin: '0.25rem 0 0 0' }}>
              Make sure each variable is specific and measurable. Vague variables lead to unclear results.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem', margin: 0 }}>
              👥 Realistic Samples
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#78350f', lineHeight: '1.4', margin: '0.25rem 0 0 0' }}>
              Choose a sample size you can actually achieve. Quality matters more than quantity for student research.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem', margin: 0 }}>
              📝 Detailed Procedures
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#78350f', lineHeight: '1.4', margin: '0.25rem 0 0 0' }}>
              Write procedures so clearly that someone else could replicate your study exactly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
