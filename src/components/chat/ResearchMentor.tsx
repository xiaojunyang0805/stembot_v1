/**
 * Research Mentor Chat Component
 * Specialized AI chat interface for research guidance
 */

'use client'

import { useState, useEffect, useRef } from 'react'

import {
  MessageSquare,
  Send,
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  Microscope,
  PenTool,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  History,
  Settings
} from 'lucide-react'

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ResearchMentorProps {
  projectId: string
  currentStage: string
  context?: {
    question?: string
    field?: string
    progress?: any
  }
  className?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  stage: string
  type?: 'question' | 'suggestion' | 'feedback' | 'guidance'
  suggestions?: string[]
  resources?: any[]
  rating?: 'helpful' | 'not-helpful'
}

export function ResearchMentor({ projectId, currentStage, context, className = '' }: ResearchMentorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mentorPersonality, setMentorPersonality] = useState<'socratic' | 'supportive' | 'direct'>('socratic')
  const [showHistory, setShowHistory] = useState(false)
  const [chatMode, setChatMode] = useState<'guidance' | 'review' | 'brainstorm'>('guidance')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (projectId) {
      loadChatHistory()
      initializeChat()
    }
  }, [projectId, currentStage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/research-mentor/history?projectId=${projectId}&stage=${currentStage}`)
      if (response.ok) {
        const history = await response.json()
        setMessages(history.messages || [])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const initializeChat = async () => {
    // Add welcome message based on stage
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getWelcomeMessage(currentStage),
      timestamp: new Date(),
      stage: currentStage,
      type: 'guidance',
      suggestions: getStageSuggestions(currentStage)
    }

    setMessages(prev => prev.length === 0 ? [welcomeMessage] : prev)
  }

  const getWelcomeMessage = (stage: string) => {
    const messages = {
      'question-formation': "I'm here to help you refine your research question using the Socratic method. What research topic are you exploring?",
      'literature-review': "Let's work together to find and analyze the best sources for your research. What key concepts should we search for?",
      'methodology-design': "I'll guide you through designing a robust methodology. What's your research approach - quantitative, qualitative, or mixed methods?",
      'writing': "Ready to turn your research into compelling academic writing? Which section would you like to start with?",
      'export': "Excellent work! Let's discuss how to present your research findings effectively. What format are you targeting?"
    }
    return messages[stage as keyof typeof messages] || "I'm your AI research mentor. How can I help you today?"
  }

  const getStageSuggestions = (stage: string) => {
    const suggestions = {
      'question-formation': [
        "Help me narrow down my research topic",
        "Is my research question too broad?",
        "How do I make my question more specific?",
        "What makes a good research question?"
      ],
      'literature-review': [
        "What databases should I search?",
        "How do I evaluate source quality?",
        "Help me find research gaps",
        "How many sources do I need?"
      ],
      'methodology-design': [
        "Which research method should I use?",
        "Help me calculate sample size",
        "Review my research design",
        "What are potential limitations?"
      ],
      'writing': [
        "Help me outline my paper",
        "Improve this paragraph",
        "Check my argument structure",
        "Suggest better transitions"
      ],
      'export': [
        "Create a presentation outline",
        "Help with conference abstract",
        "Review my conclusions",
        "Suggest publication venues"
      ]
    }
    return suggestions[stage as keyof typeof suggestions] || []
  }

  const sendMessage = async () => {
    if (!input.trim()) {
return
}

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      stage: currentStage
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/research-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: input,
          stage: currentStage,
          mode: chatMode,
          personality: mentorPersonality,
          context: {
            ...context,
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          stage: currentStage,
          type: data.type || 'guidance',
          suggestions: data.suggestions,
          resources: data.resources
        }

        setMessages(prev => [...prev, assistantMessage])

        // Store memory of this interaction
        if (data.memory) {
          await fetch('/api/memory/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              memories: [{
                type: 'procedural',
                content: `Research guidance: ${data.response}`,
                context: currentStage,
                tags: ['mentoring', currentStage, chatMode]
              }]
            })
          })
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const rateMessage = async (messageId: string, rating: 'helpful' | 'not-helpful') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, rating } : msg
    ))

    try {
      await fetch('/api/chat/research-mentor/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, rating })
      })
    } catch (error) {
      console.error('Failed to rate message:', error)
    }
  }

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  const regenerateResponse = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'user') {
return
}

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/research-mentor/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          messageId,
          alternative: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        const messageIndex = messages.findIndex(m => m.id === messageId)
        const updatedMessages = [...messages]

        // Replace the assistant response that follows the user message
        if (messageIndex < messages.length - 1) {
          updatedMessages[messageIndex + 1] = {
            ...updatedMessages[messageIndex + 1],
            content: data.response,
            suggestions: data.suggestions,
            resources: data.resources
          }
          setMessages(updatedMessages)
        }
      }
    } catch (error) {
      console.error('Failed to regenerate response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`flex h-96 flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Research Mentor</h3>
            <p className="text-xs capitalize text-gray-600">{currentStage.replace('-', ' ')} guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={chatMode}
            onChange={(e) => setChatMode(e.target.value as any)}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="guidance">Guidance</option>
            <option value="review">Review</option>
            <option value="brainstorm">Brainstorm</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-sm ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'border border-gray-200 bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm">{message.content}</div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="block w-full rounded border border-gray-200 bg-white p-2 text-left text-xs hover:bg-gray-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {message.role === 'assistant' && (
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => rateMessage(message.id, 'helpful')}
                      className={`rounded p-1 ${
                        message.rating === 'helpful' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => rateMessage(message.id, 'not-helpful')}
                      className={`rounded p-1 ${
                        message.rating === 'not-helpful' ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => regenerateResponse(message.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="mt-1 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${currentStage.replace('-', ' ')}...`}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => useSuggestion("What should I focus on next?")}
            className="text-xs text-purple-600 hover:text-purple-700"
          >
            <Target className="mr-1 h-3 w-3" />
            Next Steps
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => useSuggestion("Review my progress so far")}
            className="text-xs text-purple-600 hover:text-purple-700"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Review
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => useSuggestion("I'm stuck, can you help?")}
            className="text-xs text-purple-600 hover:text-purple-700"
          >
            <Lightbulb className="mr-1 h-3 w-3" />
            Help
          </Button>
        </div>
      </div>
    </Card>
  )
}