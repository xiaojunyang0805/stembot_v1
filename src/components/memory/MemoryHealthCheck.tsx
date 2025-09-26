/**
 * Memory System Health Check Component
 * Tests and displays vector memory infrastructure status
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface MemoryHealthStatus {
  healthy: boolean;
  components: {
    pinecone: {
      healthy: boolean;
      message: string;
      details?: any;
    };
    embeddings: {
      available: boolean;
      provider: string;
      message: string;
    };
  };
  indexStats?: any;
  environment: {
    vectorDimensions: string;
    indexName: string;
    similarityThreshold: string;
  };
}

interface TestDocument {
  id: string;
  content: string;
  title: string;
  projectId: string;
  documentType: 'literature' | 'methodology' | 'writing' | 'notes' | 'conversation';
  contentType: 'text' | 'citation' | 'summary' | 'analysis' | 'question' | 'response';
  userId: string;
}

interface TestResult {
  action: string;
  success: boolean;
  result?: any;
  error?: string;
  timestamp: string;
}

export function MemoryHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<MemoryHealthStatus | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/memory/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDocuments: TestDocument[] = [
    {
      id: 'test-doc-1',
      content: 'This is a test literature review document discussing machine learning applications in healthcare. The study examines various deep learning algorithms and their effectiveness in medical diagnosis.',
      title: 'ML in Healthcare Literature Review',
      projectId: 'test-project',
      documentType: 'literature',
      contentType: 'analysis',
      userId: 'test-user'
    },
    {
      id: 'test-doc-2',
      content: 'Research methodology for evaluating machine learning models. This document outlines the experimental design, data collection procedures, and statistical analysis methods for the healthcare ML study.',
      title: 'ML Research Methodology',
      projectId: 'test-project',
      documentType: 'methodology',
      contentType: 'text',
      userId: 'test-user'
    },
    {
      id: 'test-doc-3',
      content: 'Key findings from the machine learning healthcare research: 95% accuracy in diagnosis, significant improvement over traditional methods, but concerns about bias in training data.',
      title: 'Research Notes',
      projectId: 'test-project',
      documentType: 'notes',
      contentType: 'summary',
      userId: 'test-user'
    }
  ];

  const runIntegrationTests = async () => {
    setTesting(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: Store documents
    for (const doc of testDocuments) {
      try {
        const response = await fetch('/api/memory/store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc),
        });

        const data = await response.json();

        results.push({
          action: `Store Document: ${doc.title}`,
          success: response.ok && data.success,
          result: data,
          error: !response.ok ? data.error : undefined,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        results.push({
          action: `Store Document: ${doc.title}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 2: Search for documents
    const searchQueries = [
      'machine learning healthcare',
      'research methodology',
      'diagnosis accuracy',
      'experimental design'
    ];

    for (const query of searchQueries) {
      try {
        const response = await fetch('/api/memory/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            projectId: 'test-project',
            topK: 5
          }),
        });

        const data = await response.json();

        results.push({
          action: `Search: "${query}"`,
          success: response.ok && data.results.length > 0,
          result: {
            query: data.query,
            resultCount: data.count,
            topResult: data.results[0]?.content?.substring(0, 100) + '...'
          },
          error: !response.ok ? data.error : undefined,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        results.push({
          action: `Search: "${query}"`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 3: Get project memory overview
    try {
      const response = await fetch('/api/memory/search?projectId=test-project');
      const data = await response.json();

      results.push({
        action: 'Get Project Memory Overview',
        success: response.ok,
        result: {
          totalChunks: data.totalChunks,
          documentTypes: data.documentTypes,
          keyTopics: data.keyTopics?.slice(0, 5)
        },
        error: !response.ok ? data.error : undefined,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      results.push({
        action: 'Get Project Memory Overview',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test 4: Cleanup - Delete test documents
    for (const doc of testDocuments) {
      try {
        const response = await fetch(`/api/memory/store?documentId=${doc.id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        results.push({
          action: `Delete Document: ${doc.title}`,
          success: response.ok && data.success,
          result: data,
          error: !response.ok ? data.error : undefined,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        results.push({
          action: `Delete Document: ${doc.title}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  const createIndex = async () => {
    try {
      const response = await fetch('/api/memory/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-index' }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Index created successfully! Please wait a few minutes for it to be ready, then refresh the health check.');
      } else {
        alert(`Failed to create index: ${data.message}`);
      }

    } catch (error) {
      alert(`Error creating index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = (healthy: boolean) => {
    return healthy ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-600">Checking memory system health...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Memory System Health</h2>
          <Button
            onClick={checkHealth}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {healthStatus && (
          <div className={`p-4 rounded-lg border ${getStatusColor(healthStatus.healthy)}`}>
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                healthStatus.healthy ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">
                {healthStatus.healthy ? 'System Healthy' : 'System Issues Detected'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Pinecone Vector Database</h3>
                <div className={`p-3 rounded border ${getStatusColor(healthStatus.components.pinecone.healthy)}`}>
                  <p className="text-sm">{healthStatus.components.pinecone.message}</p>
                  {healthStatus.components.pinecone.details && (
                    <div className="mt-2 text-xs">
                      <p><strong>Index:</strong> {healthStatus.environment.indexName}</p>
                      <p><strong>Dimensions:</strong> {healthStatus.environment.vectorDimensions}</p>
                      {healthStatus.indexStats && (
                        <p><strong>Total Vectors:</strong> {healthStatus.indexStats.totalVectorCount || 0}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Embeddings Service</h3>
                <div className={`p-3 rounded border ${getStatusColor(healthStatus.components.embeddings.available)}`}>
                  <p className="text-sm">{healthStatus.components.embeddings.message}</p>
                  <p className="text-xs mt-1">
                    <strong>Provider:</strong> {healthStatus.components.embeddings.provider}
                  </p>
                </div>
              </div>
            </div>

            {!healthStatus.components.pinecone.healthy && (
              <div className="mt-4">
                <Button
                  onClick={createIndex}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Create Pinecone Index
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Integration Tests</h2>
          <Button
            onClick={runIntegrationTests}
            disabled={testing || !healthStatus?.healthy}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{result.action}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                    <p className="text-red-600 text-xs">{result.error}</p>
                  </div>
                )}

                {result.result && (
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-2">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {testing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Running integration tests...</p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>1. Create Pinecone Account:</strong></p>
          <p className="ml-4">Sign up at <a href="https://pinecone.io" className="underline" target="_blank" rel="noopener noreferrer">https://pinecone.io</a></p>

          <p><strong>2. Get API Key:</strong></p>
          <p className="ml-4">Copy API key from Pinecone dashboard</p>

          <p><strong>3. Update Environment Variables:</strong></p>
          <div className="ml-4 bg-blue-100 rounded p-2 font-mono text-xs">
            PINECONE_API_KEY=your_api_key_here<br/>
            PINECONE_INDEX_NAME=stembot-research-memory<br/>
            VECTOR_DIMENSIONS=1536
          </div>

          <p><strong>4. Create Index:</strong></p>
          <p className="ml-4">Use the "Create Pinecone Index" button above or create manually in the Pinecone console</p>

          <p><strong>5. Optional - OpenAI API:</strong></p>
          <div className="ml-4 bg-blue-100 rounded p-2 font-mono text-xs">
            OPENAI_API_KEY=your_openai_key_here
          </div>
          <p className="ml-4 text-xs">(Without OpenAI, the system will use dummy embeddings for testing)</p>
        </div>
      </Card>
    </div>
  );
}