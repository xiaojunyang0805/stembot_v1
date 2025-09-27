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
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0'}}>
      <div style={{margin: '0 auto', maxWidth: '56rem', padding: '0 1rem'}}>
        <div style={{borderRadius: '0.5rem', backgroundColor: 'white', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}}>
          <h1 style={{marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827'}}>
            Integration Test Page
          </h1>

          <div style={{marginBottom: '1.5rem'}}>
            <IntegrationConfig />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937'}}>
              Current Integration Status
            </h2>
            {status && (
              <div style={{borderRadius: '0.5rem', backgroundColor: '#f9fafb', padding: '1rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem'}}>
                  <div>
                    <span style={{fontWeight: '500'}}>Environment:</span>
                    <span style={{marginLeft: '0.5rem'}}>{status.environment}</span>
                  </div>
                  <div>
                    <span style={{fontWeight: '500'}}>Integration Method:</span>
                    <span style={{marginLeft: '0.5rem'}}>{status.integrationMethod}</span>
                  </div>
                  <div>
                    <span style={{fontWeight: '500'}}>Core Available:</span>
                    <span style={{marginLeft: '0.5rem'}}>{status.coreAvailable ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span style={{fontWeight: '500'}}>Using Mocks:</span>
                    <span style={{marginLeft: '0.5rem'}}>{status.usingMocks ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <div style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{fontSize: '1.125rem', fontWeight: '600', color: '#1f2937'}}>
                Integration Tests
              </h2>
              <button
                onClick={runTests}
                disabled={isRunning}
                style={{
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  backgroundColor: isRunning ? '#d1d5db' : '#2563eb',
                  color: isRunning ? '#6b7280' : 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isRunning) (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (!isRunning) (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>
            </div>

            {testResults.length > 0 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: '0.5rem',
                      border: '1px solid',
                      padding: '1rem',
                      borderColor: result.status === 'success' ? '#bbf7d0' : '#fecaca',
                      backgroundColor: result.status === 'success' ? '#f0fdf4' : '#fef2f2'
                    }}
                  >
                    <div style={{marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      <h3 style={{fontWeight: '500', color: '#1f2937'}}>
                        {result.name}
                      </h3>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span
                          style={{
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: result.status === 'success' ? '#dcfce7' : '#fee2e2',
                            color: result.status === 'success' ? '#166534' : '#991b1b'
                          }}
                        >
                          {result.status.toUpperCase()}
                        </span>
                        {result.duration > 0 && (
                          <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                    </div>

                    {result.error && (
                      <div style={{borderRadius: '0.25rem', backgroundColor: '#fee2e2', padding: '0.5rem', fontSize: '0.875rem', color: '#b91c1c'}}>
                        Error: {result.error}
                      </div>
                    )}

                    {result.result && (
                      <div style={{fontSize: '0.875rem', color: '#4b5563'}}>
                        <details>
                          <summary style={{cursor: 'pointer', transition: 'color 0.2s'}}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = '#1f2937';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = '#4b5563';
                            }}>
                            View Result
                          </summary>
                          <pre style={{marginTop: '0.5rem', overflowX: 'auto', borderRadius: '0.25rem', backgroundColor: '#f3f4f6', padding: '0.5rem', fontSize: '0.75rem'}}>
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

          <div style={{borderRadius: '0.5rem', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', padding: '1rem'}}>
            <h3 style={{marginBottom: '0.5rem', fontWeight: '500', color: '#1e40af'}}>
              About This Test Page
            </h3>
            <p style={{fontSize: '0.875rem', color: '#1d4ed8'}}>
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