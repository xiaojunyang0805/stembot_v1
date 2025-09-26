/**
 * Chat Interface Component
 * Main chat area with message history and input
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, RefreshCw, Download, Search } from 'lucide-react'
import {
  ChatMessage,
  MessageAttachment,
  ContextHint,
  ProjectDetails
} from '../../types/project-workspace'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import ContextHints from './ContextHints'
import ChatNavigationHeader from './ChatNavigationHeader'

interface ChatInterfaceProps {
  project: ProjectDetails
  messages: ChatMessage[]
  contextHints: ContextHint[]
  onSendMessage: (content: string, attachments?: MessageAttachment[]) => void
  onFileUpload: (file: File) => Promise<MessageAttachment>
  onMessageCopy: (content: string) => void
  onMessageEdit: (messageId: string) => void
  onMessageDelete: (messageId: string) => void
  onMessageFeedback: (messageId: string, type: 'positive' | 'negative') => void
  onHintClick: (hint: ContextHint) => void
  onDismissHint: (hintId: string) => void
  onClearChat: () => void
  onExportChat: () => void
  isLoading?: boolean
  className?: string
}

export default function ChatInterface({
  project,
  messages,
  contextHints,
  onSendMessage,
  onFileUpload,
  onMessageCopy,
  onMessageEdit,
  onMessageDelete,
  onMessageFeedback,
  onHintClick,
  onDismissHint,
  onClearChat,
  onExportChat,
  isLoading = false,
  className = ''
}: ChatInterfaceProps) {
  const [hintsCollapsed, setHintsCollapsed] = useState(false)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAutoScrollEnabled])

  // Check if user has scrolled up to disable auto-scroll
  const handleScroll = () => {
    if (!chatContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

    setIsAutoScrollEnabled(isAtBottom)
  }


  const handleAttachmentClick = (attachment: MessageAttachment) => {
    // Handle attachment click (open, preview, etc.)
    window.open(attachment.url, '_blank')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsAutoScrollEnabled(true)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f9fafb'
    }}>

      {/* Navigation Header */}
      <ChatNavigationHeader currentPhase="workspace" />

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onScroll={handleScroll}
      >
        {messages.length === 0 && !isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
              <MessageSquare style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Start your research conversation
            </h3>
            <p style={{
              color: '#4b5563',
              maxWidth: '448px'
            }}>
              {`Ask your AI research mentor anything about ${project.subject}. I'm here to help with your research on "${project.title}".`}
            </p>
          </div>
        ) : (
          <>
            {/* Welcome Message for new chats */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageSquare style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                  </div>
                  <div style={{
                    backgroundColor: '#eff6ff',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    maxWidth: '448px'
                  }}>
                    <p style={{ fontSize: '14px', color: '#1e3a8a' }}>
                      Hi! I'm your AI research mentor. I'm here to help you with your research on <strong>"{project.title}"</strong>.
                      I can assist with literature reviews, methodology design, data analysis, and academic writing.
                    </p>
                    <p style={{ fontSize: '14px', color: '#1d4ed8', marginTop: '8px' }}>
                      What would you like to work on today?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={onMessageCopy}
                onEdit={onMessageEdit}
                onDelete={onMessageDelete}
                onFeedback={onMessageFeedback}
                onAttachmentClick={handleAttachmentClick}
                showTimestamp={true}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #bfdbfe',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  </div>
                  <div style={{
                    backgroundColor: '#eff6ff',
                    borderRadius: '16px',
                    padding: '12px 16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#60a5fa',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#60a5fa',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite',
                          animationDelay: '0.1s'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#60a5fa',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite',
                          animationDelay: '0.2s'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '14px', color: '#1d4ed8' }}>Research mentor is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {!isAutoScrollEnabled && (
        <div style={{
          position: 'absolute',
          bottom: '128px',
          right: '32px'
        }}>
          <button
            onClick={scrollToBottom}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'
            }}
          >
            <MessageSquare style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      {/* Context Hints Panel */}
      <ContextHints
        hints={contextHints}
        onHintClick={onHintClick}
        onDismissHint={onDismissHint}
        isCollapsed={hintsCollapsed}
        onToggleCollapse={() => setHintsCollapsed(!hintsCollapsed)}
        maxVisible={4}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        disabled={isLoading}
        placeholder={`Ask about ${project.subject} research...`}
        showAttachments={true}
        autoFocus={messages.length === 0}
      />
    </div>
  )
}