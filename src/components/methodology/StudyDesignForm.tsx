'use client';

import { VariablesInput } from './VariablesInput';
import { ParticipantsPlanning } from './ParticipantsPlanning';
import { ProcedureDraft } from './ProcedureDraft';

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
  onSaveVariables: (data: {
    independentVars: Variable[];
    dependentVars: Variable[];
    controlVars: Variable[];
  }) => Promise<void>;
  onSaveParticipants: (data: ParticipantsData) => Promise<void>;
  onSaveProcedure: (procedure: string) => Promise<void>;
  onRequestProcedureFeedback: (procedure: string) => Promise<string>;
}

export function StudyDesignForm({
  data,
  onSaveVariables,
  onSaveParticipants,
  onSaveProcedure,
  onRequestProcedureFeedback
}: StudyDesignFormProps) {
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
      />

      {/* Procedure Section */}
      <ProcedureDraft
        initialProcedure={data.procedure}
        onSave={onSaveProcedure}
        onRequestFeedback={onRequestProcedureFeedback}
      />

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
