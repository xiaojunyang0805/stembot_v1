'use client'

import { TypingIndicatorProps } from '../../types/chat';

export default function TypingIndicator({
  isVisible,
  message = "StemBot is thinking..."
}: TypingIndicatorProps) {
  if (!isVisible) {
return null;
}

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '16px',
        opacity: 0,
        animation: 'fadeIn 300ms ease-out forwards'
      }}
    >
      <div
        style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '180px'
        }}
      >
        {/* AI Avatar */}
        <div
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '12px'
          }}
        >
          🤖
        </div>

        {/* Message and Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {message}
          </span>

          {/* Animated Dots */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#9ca3af',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '0ms'
              }}
            />
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#9ca3af',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '200ms'
              }}
            />
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#9ca3af',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '400ms'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}