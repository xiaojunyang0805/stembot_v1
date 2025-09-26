'use client'

import { useState, useRef, useEffect } from 'react';

import { MessageInputProps } from '../../types/chat';

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Ask me anything about your studies..."
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const maxChars = 2000;


  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {value} = e.target;
    if (value.length <= maxChars) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter for new line - let default behavior happen
        return;
      } else {
        // Enter to send
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage !== '' && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      setCharCount(0);
      // Reset textarea height
      if (textareaRef.current !== null) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current !== null) {
      textareaRef.current.style.height = 'auto';
      const {scrollHeight} = textareaRef.current;
      const maxHeight = 96; // 4 lines * 24px line height
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const isNearLimit = charCount > maxChars * 0.8;
  const canSend = message.trim() !== '' && !disabled;

  return (
    <div
      ref={inputContainerRef}
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '16px',
        width: '100%',
        maxWidth: '100%',
        minWidth: '0',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Please wait...' : placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            resize: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '12px 80px 12px 16px',
            minHeight: '48px',
            maxHeight: '96px',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            color: disabled ? '#9ca3af' : '#111827',
            cursor: disabled ? 'not-allowed' : 'text',
            outline: 'none',
            transition: 'all 200ms ease',
            borderColor: disabled ? '#d1d5db' : '#d1d5db'
          }}
          onFocus={(e) => {
            if (disabled === false) {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            position: 'absolute',
            right: '8px',
            bottom: '8px',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '500',
            fontSize: '14px',
            minWidth: '60px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: canSend === true ? 'pointer' : 'not-allowed',
            backgroundColor: canSend === true ? '#2563eb' : '#d1d5db',
            color: canSend === true ? 'white' : '#6b7280',
            transition: 'all 200ms ease',
            boxShadow: canSend === true ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (canSend === true) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (canSend === true) {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseDown={(e) => {
            if (canSend === true) {
              e.currentTarget.style.backgroundColor = '#1e40af';
            }
          }}
          onMouseUp={(e) => {
            if (canSend === true) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
        >
          {disabled ? (
            <span style={{ animation: 'pulse 2s infinite' }}>⋯</span>
          ) : (
            <span>Send</span>
          )}
        </button>
      </div>

      {/* Character Counter and Help Text */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          fontSize: '12px'
        }}
      >
        <div style={{ color: '#6b7280' }}>
          Press{' '}
          <kbd
            style={{
              backgroundColor: '#f3f4f6',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
          >
            Enter
          </kbd>{' '}
          to send,{' '}
          <kbd
            style={{
              backgroundColor: '#f3f4f6',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
          >
            Shift+Enter
          </kbd>{' '}
          for new line
        </div>

        {/* Character Counter */}
        <div
          style={{
            color: isNearLimit ? '#dc2626' : '#6b7280',
            fontWeight: isNearLimit ? '600' : '400'
          }}
        >
          {charCount}/{maxChars}
        </div>
      </div>

      {/* Warning for character limit */}
      {isNearLimit && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#d97706',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            padding: '8px 12px'
          }}
        >
          ⚠️ Approaching character limit. Consider breaking your message into smaller parts for better responses.
        </div>
      )}
    </div>
  );
}