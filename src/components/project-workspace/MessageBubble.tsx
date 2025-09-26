/**
 * Message Bubble Component
 * Individual chat message display with AI/User styling
 */

'use client'

import { useState } from 'react'
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  Zap,
  Clock
} from 'lucide-react'
import { ChatMessage, MessageAttachment } from '../../types/project-workspace'

interface MessageBubbleProps {
  message: ChatMessage
  onCopy?: (content: string) => void
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void
  onAttachmentClick?: (attachment: MessageAttachment) => void
  showTimestamp?: boolean
  isLatest?: boolean
}

export default function MessageBubble({
  message,
  onCopy,
  onEdit,
  onDelete,
  onFeedback,
  onAttachmentClick,
  showTimestamp = true,
  isLatest = false
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isAI = message.type === 'ai'

  const getAttachmentIcon = (attachment: MessageAttachment) => {
    switch (attachment.type) {
      case 'image':
        return <Eye className="w-4 h-4" />
      case 'document':
        return <Download className="w-4 h-4" />
      case 'link':
        return <ExternalLink className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 0.8) return { backgroundColor: '#dcfce7', color: '#166534' }
    if (confidence >= 0.6) return { backgroundColor: '#fef3c7', color: '#a16207' }
    return { backgroundColor: '#fee2e2', color: '#dc2626' }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        justifyContent: isAI ? 'flex-start' : 'flex-end',
        marginBottom: '16px'
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowMoreMenu(false)
      }}
    >
      {/* AI Avatar */}
      {isAI && (
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap style={{ width: '16px', height: '16px', color: '#2563eb' }} />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '75%',
        alignItems: isAI ? 'flex-start' : 'flex-end'
      }}>

        {/* Message Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
          flexDirection: isAI ? 'row' : 'row-reverse'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151'
          }}>
            {isAI ? 'Research Mentor' : 'You'}
          </span>

          {showTimestamp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}

          {/* Confidence Badge for AI messages */}
          {isAI && message.metadata?.confidence && (
            <div style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '500',
              ...getConfidenceStyle(message.metadata.confidence)
            }}>
              {Math.round(message.metadata.confidence * 100)}%
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          padding: '12px 16px',
          maxWidth: '100%',
          backgroundColor: isAI ? '#eff6ff' : '#e5e7eb',
          color: '#111827'
        }}>

          {/* Typing Indicator */}
          {message.isTyping ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 0' }}>
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
              <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>Thinking...</span>
            </div>
          ) : (
            <>
              {/* Message Text */}
              <div style={{
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {message.content}
              </div>

              {/* Phase Badge */}
              {isAI && message.metadata?.phase && (
                <div style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#4b5563'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%'
                  }}></div>
                  <span style={{ textTransform: 'capitalize' }}>{message.metadata.phase} Phase</span>
                </div>
              )}

              {/* Sources Referenced */}
              {isAI && message.metadata?.sources && message.metadata.sources.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid #bfdbfe'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#4b5563',
                    marginBottom: '4px'
                  }}>Referenced sources:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {message.metadata.sources.map((source, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '12px',
                          backgroundColor: 'white',
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          color: '#374151',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLSpanElement).style.backgroundColor = '#f9fafb'
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLSpanElement).style.backgroundColor = 'white'
                        }}
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div style={{
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%'
          }}>
            {message.attachments.map((attachment) => (
              <button
                key={attachment.id}
                onClick={() => onAttachmentClick?.(attachment)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isAI ? '#bfdbfe' : '#d1d5db',
                  backgroundColor: isAI ? 'white' : '#f3f4f6',
                  transition: 'all 0.2s',
                  width: '100%',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = isAI ? '#eff6ff' : '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = isAI ? 'white' : '#f3f4f6'
                }}
              >
                {getAttachmentIcon(attachment)}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}>
                    {attachment.name}
                  </p>
                  {attachment.size && (
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatFileSize(attachment.size)}
                    </p>
                  )}
                </div>
                <ExternalLink style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              </button>
            ))}
          </div>
        )}

        {/* Message Actions */}
        {(showActions || showMoreMenu) && !message.isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
            justifyContent: isAI ? 'flex-start' : 'flex-end'
          }}>

            {/* Copy Button */}
            <button
              onClick={() => onCopy?.(message.content)}
              style={{
                padding: '6px',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#4b5563'
                ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#9ca3af'
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
              title="Copy message"
            >
              <Copy style={{ width: '14px', height: '14px' }} />
            </button>

            {/* AI Message Actions */}
            {isAI && (
              <>
                <button
                  onClick={() => onFeedback?.(message.id, 'positive')}
                  style={{
                    padding: '6px',
                    color: '#9ca3af',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#059669'
                    ;(e.target as HTMLButtonElement).style.backgroundColor = '#ecfdf5'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#9ca3af'
                    ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                  title="Good response"
                >
                  <ThumbsUp style={{ width: '14px', height: '14px' }} />
                </button>
                <button
                  onClick={() => onFeedback?.(message.id, 'negative')}
                  style={{
                    padding: '6px',
                    color: '#9ca3af',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#dc2626'
                    ;(e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#9ca3af'
                    ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                  title="Poor response"
                >
                  <ThumbsDown style={{ width: '14px', height: '14px' }} />
                </button>
              </>
            )}

            {/* User Message Actions */}
            {!isAI && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  style={{
                    padding: '6px',
                    color: '#9ca3af',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#4b5563'
                    ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#9ca3af'
                    ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <MoreVertical style={{ width: '14px', height: '14px' }} />
                </button>

                {/* More Menu */}
                {showMoreMenu && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10
                      }}
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '4px',
                      width: '128px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      zIndex: 20
                    }}>
                      <div style={{ padding: '4px 0' }}>
                        <button
                          onClick={() => {
                            onEdit?.(message.id)
                            setShowMoreMenu(false)
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 12px',
                            fontSize: '14px',
                            color: '#374151',
                            backgroundColor: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                          }}
                        >
                          <Edit style={{ width: '12px', height: '12px' }} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete?.(message.id)
                            setShowMoreMenu(false)
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 12px',
                            fontSize: '14px',
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2'
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                          }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAI && (
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#d1d5db',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#4b5563'
            }}>
              You
            </span>
          </div>
        </div>
      )}
    </div>
  )
}