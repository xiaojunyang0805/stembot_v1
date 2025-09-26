/**
 * AI Health Check Component
 * Tests and displays AI infrastructure status
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'error' | 'loading';
  message: string;
  ollama?: {
    baseUrl: string;
    defaultModel: string;
    availableModels: string[];
  };
  timestamp?: string;
  suggestions?: string[];
}

interface TestResult {
  query: string;
  response: string;
  confidence: number;
  timestamp: string;
  error?: string;
}

export function AIHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'loading',
    message: 'Checking AI service...'
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setHealthStatus({ status: 'loading', message: 'Checking AI service...' });

      const response = await fetch('/api/ai/health');
      const data = await response.json();

      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({
        status: 'error',
        message: 'Failed to check AI service',
        suggestions: [
          'Check network connection',
          'Verify API endpoints are working',
          'Ensure Ollama is installed and running'
        ]
      });
    }
  };

  const testQueries = [
    {
      query: "What are the key steps in developing a strong research question?",
      type: "question-refinement" as const
    },
    {
      query: "How should I approach conducting a systematic literature review?",
      type: "literature-review" as const
    },
    {
      query: "What factors should I consider when choosing a research methodology?",
      type: "methodology" as const
    }
  ];

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    for (const testQuery of testQueries) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: testQuery.query,
            projectId: 'test-project',
            sessionType: testQuery.type,
            context: {
              subject: 'Computer Science',
              currentPhase: 'testing'
            }
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setTestResults(prev => [...prev, {
            query: testQuery.query,
            response: data.response,
            confidence: data.confidence,
            timestamp: data.timestamp
          }]);
        } else {
          setTestResults(prev => [...prev, {
            query: testQuery.query,
            response: '',
            confidence: 0,
            timestamp: new Date().toISOString(),
            error: data.error || 'Unknown error'
          }]);
        }
      } catch (error) {
        setTestResults(prev => [...prev, {
          query: testQuery.query,
          response: '',
          confidence: 0,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Network error'
        }]);
      }
    }

    setTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AI Infrastructure Status</h2>
          <Button
            onClick={checkHealth}
            variant="outline"
            size="sm"
            disabled={healthStatus.status === 'loading'}
          >
            {healthStatus.status === 'loading' ? 'Checking...' : 'Refresh'}
          </Button>
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor(healthStatus.status)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus.status === 'healthy' ? 'bg-green-500' :
              healthStatus.status === 'unhealthy' ? 'bg-yellow-500' :
              healthStatus.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <span className="font-medium capitalize">{healthStatus.status}</span>
          </div>

          <p className="text-sm mb-3">{healthStatus.message}</p>

          {healthStatus.ollama && (
            <div className="text-sm space-y-1">
              <p><strong>Base URL:</strong> {healthStatus.ollama.baseUrl}</p>
              <p><strong>Default Model:</strong> {healthStatus.ollama.defaultModel}</p>
              <p><strong>Available Models:</strong> {
                healthStatus.ollama.availableModels.length > 0
                  ? healthStatus.ollama.availableModels.join(', ')
                  : 'None detected'
              }</p>
            </div>
          )}

          {healthStatus.suggestions && (
            <div className="mt-3">
              <p className="font-medium text-sm mb-1">Suggestions:</p>
              <ul className="text-sm space-y-1">
                {healthStatus.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Research Mentoring Tests</h2>
          <Button
            onClick={runTests}
            disabled={testing || healthStatus.status !== 'healthy'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-sm text-gray-600">Query:</h3>
                  <p className="text-sm">{result.query}</p>
                </div>

                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-600 text-sm font-medium">Error:</p>
                    <p className="text-red-600 text-sm">{result.error}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium text-sm text-gray-600">Response:</h3>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        {result.response || 'No response received'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                      <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {testing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Testing research mentoring capabilities...</p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>1. Install Ollama:</strong></p>
          <p className="ml-4">Download from <a href="https://ollama.ai/download" className="underline" target="_blank" rel="noopener noreferrer">https://ollama.ai/download</a></p>

          <p><strong>2. Install Models:</strong></p>
          <div className="ml-4 bg-blue-100 rounded p-2 font-mono text-xs">
            ollama pull llama3.1:8b<br/>
            ollama pull mistral:7b
          </div>

          <p><strong>3. Start Ollama:</strong></p>
          <div className="ml-4 bg-blue-100 rounded p-2 font-mono text-xs">
            ollama serve
          </div>

          <p><strong>4. Verify Environment Variables:</strong></p>
          <div className="ml-4 bg-blue-100 rounded p-2 font-mono text-xs">
            OLLAMA_BASE_URL=http://localhost:11434<br/>
            OLLAMA_MODEL_CHAT=llama3.1:8b
          </div>
        </div>
      </Card>
    </div>
  );
}