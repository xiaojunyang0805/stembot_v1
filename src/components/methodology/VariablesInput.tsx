'use client';

import { useState } from 'react';

interface Variable {
  id: string;
  name: string;
  description: string;
}

interface VariablesInputProps {
  independentVars: Variable[];
  dependentVars: Variable[];
  controlVars: Variable[];
  onSave: (data: {
    independentVars: Variable[];
    dependentVars: Variable[];
    controlVars: Variable[];
  }) => Promise<void>;
}

export function VariablesInput({
  independentVars: initialIndependent,
  dependentVars: initialDependent,
  controlVars: initialControl,
  onSave
}: VariablesInputProps) {
  const [independentVars, setIndependentVars] = useState<Variable[]>(initialIndependent);
  const [dependentVars, setDependentVars] = useState<Variable[]>(initialDependent);
  const [controlVars, setControlVars] = useState<Variable[]>(initialControl);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addVariable = (type: 'independent' | 'dependent' | 'control') => {
    const newVar: Variable = {
      id: `${type}-${Date.now()}`,
      name: '',
      description: ''
    };

    switch (type) {
      case 'independent':
        setIndependentVars([...independentVars, newVar]);
        break;
      case 'dependent':
        setDependentVars([...dependentVars, newVar]);
        break;
      case 'control':
        setControlVars([...controlVars, newVar]);
        break;
    }
  };

  const removeVariable = (type: 'independent' | 'dependent' | 'control', id: string) => {
    switch (type) {
      case 'independent':
        setIndependentVars(independentVars.filter(v => v.id !== id));
        break;
      case 'dependent':
        setDependentVars(dependentVars.filter(v => v.id !== id));
        break;
      case 'control':
        setControlVars(controlVars.filter(v => v.id !== id));
        break;
    }
  };

  const updateVariable = (
    type: 'independent' | 'dependent' | 'control',
    id: string,
    field: 'name' | 'description',
    value: string
  ) => {
    const updateList = (vars: Variable[]) =>
      vars.map(v => (v.id === id ? { ...v, [field]: value } : v));

    switch (type) {
      case 'independent':
        setIndependentVars(updateList(independentVars));
        break;
      case 'dependent':
        setDependentVars(updateList(dependentVars));
        break;
      case 'control':
        setControlVars(updateList(controlVars));
        break;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        independentVars,
        dependentVars,
        controlVars
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving variables:', error);
      alert('Failed to save variables. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderVariableSection = (
    title: string,
    icon: string,
    description: string,
    type: 'independent' | 'dependent' | 'control',
    vars: Variable[]
  ) => (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h4
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{icon}</span> {title}
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
            {description}
          </p>
        </div>
        {isEditing && (
          <button
            onClick={() => addVariable(type)}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
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
            + Add
          </button>
        )}
      </div>

      {vars.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.375rem',
            color: '#9ca3af',
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}
        >
          No {title.toLowerCase()} defined yet. Click "Add" to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vars.map((variable) => (
            <div
              key={variable.id}
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.75rem'
              }}
            >
              {isEditing ? (
                <>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => updateVariable(type, variable.id, 'name', e.target.value)}
                      placeholder="Variable name"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => removeVariable(type, variable.id)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={variable.description}
                    onChange={(e) => updateVariable(type, variable.id, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      minHeight: '60px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                    {variable.name || <em style={{ color: '#9ca3af' }}>Unnamed variable</em>}
                  </div>
                  {variable.description && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4' }}>
                      {variable.description}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
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
          <span>📊</span> Variables
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
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
            ✏️ Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : '✅ Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#6b7280';
                }
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {renderVariableSection(
        'Independent Variables',
        '🎛️',
        'What you control or manipulate in your study',
        'independent',
        independentVars
      )}

      {renderVariableSection(
        'Dependent Variables',
        '📈',
        'What you measure or observe as outcomes',
        'dependent',
        dependentVars
      )}

      {renderVariableSection(
        'Control Variables',
        '🔒',
        'What you keep constant to ensure fair testing',
        'control',
        controlVars
      )}
    </div>
  );
}
