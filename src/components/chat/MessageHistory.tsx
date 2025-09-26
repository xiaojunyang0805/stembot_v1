'use client'

import { useRef, useEffect, useState } from 'react';

import { MessageHistoryProps } from '../../types/chat';

import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function MessageHistory({
  messages,
  isTyping = false,
  isLoading = false
}: MessageHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUserScrolled(false);
  };

  const handleScroll = () => {
    if (containerRef.current === null) {
return;
}

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;

    setShowScrollButton(!isAtBottom);
    if (!isAtBottom) {
      setUserScrolled(true);
    }
  };


  // Auto-scroll to bottom when new messages arrive (only if user hasn't scrolled up)
  useEffect(() => {
    if (!userScrolled || isTyping) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, userScrolled]);

  const handleCopyMessage = () => {
    // Message copied to clipboard
  };

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          backgroundColor: '#fafafa'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '2px solid transparent',
              borderTop: '2px solid #2563eb',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '400px',
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      minWidth: '0',
      overflow: 'hidden',
      boxSizing: 'border-box',
      flex: 1
    }}>
      {/* Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            padding: '16px'
          }}
        >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              minHeight: '300px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '16px'
              }}
            >
              🤖
            </div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}
            >
              Start a conversation with your AI tutor
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                maxWidth: '300px',
                lineHeight: '1.5',
                margin: 0
              }}
            >
              Ask me anything about your studies! I&apos;m here to help you learn math, science, programming, and more.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopyMessage}
              />
            ))}

            {/* Typing Indicator */}
            <TypingIndicator isVisible={isTyping} />

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
            transition: 'all 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}