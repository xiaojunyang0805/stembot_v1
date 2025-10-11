'use client';

import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description
}: ToggleSwitchProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.375rem',
      border: '1px solid #e5e7eb',
      opacity: disabled ? '0.6' : '1',
      cursor: disabled ? 'not-allowed' : 'default'
    }}>
      <div style={{ flex: '1' }}>
        {label && (
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: description ? '0.25rem' : '0'
          }}>
            {label}
          </div>
        )}
        {description && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            {description}
          </div>
        )}
      </div>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '44px',
        height: '24px',
        flexShrink: '0',
        marginLeft: '1rem'
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        <span style={{
          position: 'absolute',
          cursor: disabled ? 'not-allowed' : 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? '#2563eb' : '#d1d5db',
          borderRadius: '24px',
          transition: 'background-color 0.3s'
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: checked ? '23px' : '3px',
            bottom: '3px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'left 0.3s'
          }} />
        </span>
      </label>
    </div>
  );
}
