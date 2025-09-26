'use client'

import { useState } from 'react';

import { MessageBubbleProps } from '../../types/chat';

export default function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [showCopied, setShowCopied] = useState(false);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setShowCopied(true);
      onCopy?.();
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const isUser = message.sender === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
        marginBottom: '12px',
        opacity: 0,
        animation: 'fadeIn 200ms ease-out forwards'
      }}
    >
      {/* Message bubble */}
      <div
        style={{
          maxWidth: '70%',
          minWidth: '100px',
          padding: '12px 16px',
          borderRadius: '18px',
          backgroundColor: isUser ? '#2563eb' : isError ? '#fef2f2' : '#f3f4f6',
          color: isUser ? 'white' : isError ? '#dc2626' : '#374151',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          position: 'relative',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: isError ? '1px solid #fecaca' : 'none',
          opacity: isSending ? 0.7 : 1,
          transition: 'all 200ms ease'
        }}
        onMouseEnter={(e) => {
          const copyBtn = e.currentTarget.querySelector('button');
          if (copyBtn !== null) {
copyBtn.style.opacity = '1';
}
        }}
        onMouseLeave={(e) => {
          const copyBtn = e.currentTarget.querySelector('button');
          if (copyBtn !== null) {
copyBtn.style.opacity = '0';
}
        }}
      >
        {/* Message Content */}
        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '8px'
          }}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontSize: '11px',
            opacity: 0.8,
            color: isUser ? '#dbeafe' : '#6b7280'
          }}
        >
          {formatTimestamp(message.timestamp)}
          {isSending && (
            <span style={{ marginLeft: '8px' }}>
              <span style={{ animation: 'pulse 2s infinite' }}>⋯</span>
            </span>
          )}
          {isError && (
            <span style={{ marginLeft: '8px', color: '#dc2626' }}>
              ✗ Failed to send
            </span>
          )}
        </div>

        {/* Copy Button for AI Messages */}
        {!isUser && !isError && (
          <button
            onClick={() => {
              void handleCopy();
            }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '28px',
              height: '28px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              opacity: 0,
              transition: 'opacity 200ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
            title="Copy message"
          >
            {showCopied ? '✓' : '📋'}
          </button>
        )}
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

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}