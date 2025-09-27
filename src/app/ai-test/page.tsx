'use client';

import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface HealthStatus {
  status: string;
  ollamaUrl: string;
  models?: Array<{ name: string; size: number; modified_at: string }>;
  error?: string;
}

export default function AITestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'GET',
      });
      const health = await response.json();
      setHealthStatus(health);
    } catch (error) {
      setHealthStatus({
        status: 'error',
        ollamaUrl: 'Unknown',
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
    setIsCheckingHealth(false);
  };

  const sendMessage = async () => {
    if (currentMessage.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: currentMessage }],
          model: 'llama3.1:8b'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI API Error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json() as { message?: { content?: string } };

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message?.content ?? 'No response received',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const testQuestions = [
    "How do I design a controlled experiment for studying plant growth?",
    "What statistical tests should I use for analyzing survey data?",
    "Explain the methodology for conducting a literature review in biology",
    "How do I write a proper hypothesis for my chemistry research?"
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            🧠 StemBot AI Integration Testing
          </h1>
          <p style={{ color: '#6b7280' }}>
            Test the AI research mentoring system with your local Ollama instance
          </p>
        </div>

        {/* Health Check Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
              🔍 AI Service Health Check
            </h2>
            <button
              onClick={() => void checkHealth()}
              disabled={isCheckingHealth}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: isCheckingHealth ? 'not-allowed' : 'pointer',
                opacity: isCheckingHealth ? 0.6 : 1
              }}
            >
              {isCheckingHealth ? 'Checking...' : 'Check Health'}
            </button>
          </div>

          {healthStatus && (
            <div style={{
              padding: '1rem',
              borderRadius: '6px',
              backgroundColor: healthStatus.status === 'healthy' ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${healthStatus.status === 'healthy' ? '#bfdbfe' : '#fecaca'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ marginRight: '0.5rem' }}>
                  {healthStatus.status === 'healthy' ? '✅' : '❌'}
                </span>
                <strong>Status: {healthStatus.status}</strong>
              </div>
              <p><strong>Ollama URL:</strong> {healthStatus.ollamaUrl}</p>
              {healthStatus.models && (
                <p><strong>Available Models:</strong> {healthStatus.models.length} models detected</p>
              )}
              {healthStatus.error && (
                <p style={{ color: '#dc2626' }}><strong>Error:</strong> {healthStatus.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Main Chat Area */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              💬 Research Mentor Chat
            </h2>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              {messages.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>
                  Start a conversation with your AI research mentor...
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    borderRadius: '6px',
                    backgroundColor: msg.role === 'user' ? '#e0f2fe' : '#f3f4f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: msg.role === 'user' ? '#0369a1' : '#374151' }}>
                        {msg.role === 'user' ? '👤 You' : '🤖 AI Mentor'}
                      </strong>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  </div>
                ))
              )}
              {isLoading && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: '#f3f4f6',
                  textAlign: 'center'
                }}>
                  <span>🤖 AI Mentor is thinking...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your research question..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  resize: 'none',
                  minHeight: '60px'
                }}
              />
              <button
                onClick={() => void sendMessage()}
                disabled={isLoading || currentMessage.trim() === ''}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isLoading || currentMessage.trim() === '' ? 'not-allowed' : 'pointer',
                  opacity: isLoading || currentMessage.trim() === '' ? 0.6 : 1
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Test Questions Sidebar */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              🧪 Test Questions
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Click to test research mentoring capabilities:
            </p>

            {testQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setCurrentMessage(question)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
              >
                {question}
              </button>
            ))}

            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                💡 Testing Tips
              </h4>
              <ul style={{ fontSize: '0.75rem', color: '#92400e', margin: 0, paddingLeft: '1rem' }}>
                <li>Check health status first</li>
                <li>Try research-specific questions</li>
                <li>Test methodology guidance</li>
                <li>Ask about statistical analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}