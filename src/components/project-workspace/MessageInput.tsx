/**
 * Message Input Component
 * Chat input with attachment support and auto-resize
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  X,
  Image,
  FileText,
  Link,
  Mic,
  Smile,
  Plus
} from 'lucide-react'
import { MessageAttachment, ChatInputState } from '../../types/project-workspace'

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: MessageAttachment[]) => void
  onFileUpload: (file: File) => Promise<MessageAttachment>
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  showAttachments?: boolean
  showVoice?: boolean
  autoFocus?: boolean
}

export default function MessageInput({
  onSendMessage,
  onFileUpload,
  disabled = false,
  placeholder = "Ask your research mentor anything...",
  maxLength = 2000,
  showAttachments = true,
  showVoice = false,
  autoFocus = false
}: MessageInputProps) {
  const [inputState, setInputState] = useState<ChatInputState>({
    message: '',
    isTyping: false,
    attachments: [],
    isUploading: false
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [inputState.message])

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    if (value.length <= maxLength) {
      setInputState(prev => ({ ...prev, message: value }))
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmedMessage = inputState.message.trim()
    if (!trimmedMessage && inputState.attachments.length === 0) return
    if (disabled || inputState.isUploading) return

    onSendMessage(trimmedMessage, inputState.attachments)
    setInputState({
      message: '',
      isTyping: false,
      attachments: [],
      isUploading: false
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setInputState(prev => ({ ...prev, isUploading: true }))

    try {
      const attachment = await onFileUpload(file)
      setInputState(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment],
        isUploading: false
      }))
    } catch (error) {
      console.error('Failed to upload file:', error)
      setInputState(prev => ({ ...prev, isUploading: false }))
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setInputState(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }))
  }

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      case 'link':
        return <Link className="w-4 h-4" />
      default:
        return <Paperclip className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canSend = (inputState.message.trim().length > 0 || inputState.attachments.length > 0) &&
                  !disabled && !inputState.isUploading

  return (
    <div style={{
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white'
    }}>
      {/* Attachments Preview */}
      {inputState.attachments.length > 0 && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {inputState.attachments.map((attachment) => (
              <div
                key={attachment.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {getAttachmentIcon(attachment.type)}
                <span style={{
                  fontWeight: '500',
                  color: '#374151',
                  maxWidth: '128px',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}>
                  {attachment.name}
                </span>
                {attachment.size && (
                  <span style={{
                    color: '#6b7280',
                    fontSize: '12px'
                  }}>
                    ({formatFileSize(attachment.size)})
                  </span>
                )}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  style={{
                    color: '#9ca3af',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#9ca3af'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: '12px',
        padding: '16px'
      }}>

        {/* Attachment Button */}
        {showAttachments && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || inputState.isUploading}
              style={{
                padding: '8px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: disabled || inputState.isUploading ? 'not-allowed' : 'pointer',
                opacity: disabled || inputState.isUploading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!disabled && !inputState.isUploading) {
                  (e.target as HTMLButtonElement).style.color = '#374151'
                  ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !inputState.isUploading) {
                  (e.target as HTMLButtonElement).style.color = '#6b7280'
                  ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                }
              }}
              title="Attach file"
            >
              {inputState.isUploading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #d1d5db',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <Paperclip style={{ width: '20px', height: '20px' }} />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
            />
          </div>
        )}

        {/* Text Input */}
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <textarea
            ref={textareaRef}
            value={inputState.message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              width: '100%',
              resize: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              padding: '12px 16px',
              paddingRight: '48px',
              fontSize: '14px',
              outline: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              backgroundColor: disabled ? '#f9fafb' : 'white',
              cursor: disabled ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              if (!disabled) {
                (e.target as HTMLTextAreaElement).style.borderColor = '#3b82f6'
                ;(e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgb(59 130 246 / 0.1)'
              }
            }}
            onBlur={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = '#d1d5db'
              ;(e.target as HTMLTextAreaElement).style.boxShadow = 'none'
            }}
          />

          {/* Character Count */}
          {inputState.message.length > maxLength * 0.8 && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '56px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {inputState.message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice Input (Optional) */}
        {showVoice && (
          <button
            disabled={disabled}
            style={{
              padding: '8px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                (e.target as HTMLButtonElement).style.color = '#374151'
                ;(e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                (e.target as HTMLButtonElement).style.color = '#6b7280'
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
              }
            }}
            title="Voice input"
          >
            <Mic style={{ width: '20px', height: '20px' }} />
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            padding: '8px',
            borderRadius: '50%',
            border: 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
            backgroundColor: canSend ? '#3b82f6' : '#e5e7eb',
            color: canSend ? 'white' : '#9ca3af',
            transition: 'all 0.2s',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (canSend) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
              ;(e.target as HTMLButtonElement).style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (canSend) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'
              ;(e.target as HTMLButtonElement).style.transform = 'scale(1)'
            }
          }}
          onMouseDown={(e) => {
            if (canSend) {
              (e.target as HTMLButtonElement).style.transform = 'scale(0.95)'
            }
          }}
          onMouseUp={(e) => {
            if (canSend) {
              (e.target as HTMLButtonElement).style.transform = 'scale(1.05)'
            }
          }}
          title="Send message"
        >
          <Send style={{ width: '20px', height: '20px' }} />
        </button>
      </div>


      {/* Help Text */}
      <div style={{ padding: '0 16px 8px' }}>
        <p style={{
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}