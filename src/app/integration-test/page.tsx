/**
 * Integration Test Page
 * Tests the integration between public frontend and private core
 */

'use client';

import { useState, useEffect } from 'react';

import IntegrationStatus, { IntegrationConfig } from '../../components/common/IntegrationStatus';
import { coreIntegration, getIntegrationStatus } from '../../lib/integration';

export default function IntegrationTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    setStatus(getIntegrationStatus());
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      {
        name: 'Auth - Get Current User',
        test: () => coreIntegration.auth.getCurrentUser()
      },
      {
        name: 'Projects - List',
        test: () => coreIntegration.api.projects.list()
      },
      {
        name: 'Chat - Send Message',
        test: () => coreIntegration.api.chat.sendMessage('Test message')
      },
      {
        name: 'Memory - Recall',
        test: () => coreIntegration.api.memory.recall('test query')
      }
    ];

    const results = [];

    for (const { name, test } of tests) {
      try {
        const startTime = Date.now();
        const result = await test();
        const duration = Date.now() - startTime;

        results.push({
          name,
          status: 'success',
          result,
          duration,
          error: null
        });
      } catch (error) {
        results.push({
          name,
          status: 'error',
          result: null,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setTestResults([...results]);
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            Integration Test Page
          </h1>

          <div className="mb-6">
            <IntegrationConfig />
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Current Integration Status
            </h2>
            {status && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Environment:</span>
                    <span className="ml-2">{status.environment}</span>
                  </div>
                  <div>
                    <span className="font-medium">Integration Method:</span>
                    <span className="ml-2">{status.integrationMethod}</span>
                  </div>
                  <div>
                    <span className="font-medium">Core Available:</span>
                    <span className="ml-2">{status.coreAvailable ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Using Mocks:</span>
                    <span className="ml-2">{status.usingMocks ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Integration Tests
              </h2>
              <button
                onClick={runTests}
                disabled={isRunning}
                className={`rounded-lg px-4 py-2 font-medium ${
                  isRunning
                    ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      result.status === 'success'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium text-gray-800">
                        {result.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            result.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.status.toUpperCase()}
                        </span>
                        {result.duration > 0 && (
                          <span className="text-xs text-gray-500">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                    </div>

                    {result.error && (
                      <div className="rounded bg-red-100 p-2 text-sm text-red-700">
                        Error: {result.error}
                      </div>
                    )}

                    {result.result && (
                      <div className="text-sm text-gray-600">
                        <details>
                          <summary className="cursor-pointer hover:text-gray-800">
                            View Result
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-medium text-blue-800">
              About This Test Page
            </h3>
            <p className="text-sm text-blue-700">
              This page tests the integration between the public frontend repository
              and the private core repository. In development mode with mocks enabled,
              you'll see mock responses. In production with proper integration,
              you'll see real data from the private core system.
            </p>
          </div>
        </div>
      </div>

      <IntegrationStatus showInProduction={true} />
    </div>
  );
}