/**
 * Integration Status Component
 * Shows current integration status for debugging and development
 */

'use client';

import { useState, useEffect } from 'react';

import { getIntegrationStatus, type IntegrationStatus as IntegrationStatusType } from '../../lib/integration';

interface IntegrationStatusProps {
  showInProduction?: boolean;
  className?: string;
}

export default function IntegrationStatus({
  showInProduction = false,
  className = ""
}: IntegrationStatusProps) {
  const [status, setStatus] = useState<IntegrationStatusType | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      const integrationStatus = await getIntegrationStatus();
      setStatus(integrationStatus);

      // Only show in development or if explicitly enabled for production
      setIsVisible(
        integrationStatus.environment !== 'production' || showInProduction
      );
    };

    loadStatus();
  }, [showInProduction]);

  if (!isVisible || !status) {
    return null;
  }

  const statusColor = status.coreAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  const mockWarning = status.usingMocks ? 'bg-orange-100 text-orange-800' : '';

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="max-w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <div className="mb-2 text-xs font-semibold text-gray-600">
          Integration Status
        </div>

        <div className="space-y-1 text-xs">
          <div className={`rounded px-2 py-1 ${statusColor}`}>
            Environment: {status.environment}
          </div>

          <div className={`rounded px-2 py-1 ${statusColor}`}>
            Core: {status.coreAvailable ? 'Connected' : 'Mock/Unavailable'}
          </div>

          <div className="rounded bg-gray-100 px-2 py-1 text-gray-700">
            Method: {status.integrationMethod}
          </div>

          {status.usingMocks && (
            <div className={`rounded px-2 py-1 ${mockWarning}`}>
              ⚠️ Using Mock Data
            </div>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          Hide
        </button>
      </div>
    </div>
  );
}

/**
 * Environment configuration helper component
 */
export function IntegrationConfig() {
  const [status, setStatus] = useState<IntegrationStatusType | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      const integrationStatus = await getIntegrationStatus();
      setStatus(integrationStatus);
    };
    loadStatus();
  }, []);

  if (!status) {
    return <div>Loading integration status...</div>;
  }

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-blue-800">
        Integration Configuration
      </h3>

      <div className="space-y-1 text-xs text-blue-700">
        <div>Environment: <code>{status.environment}</code></div>
        <div>Integration Method: <code>{status.integrationMethod}</code></div>
        <div>Core Available: <code>{status.coreAvailable ? 'Yes' : 'No'}</code></div>
        <div>Using Mocks: <code>{status.usingMocks ? 'Yes' : 'No'}</code></div>
      </div>

      {status.usingMocks && (
        <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-2 text-xs text-orange-700">
          <strong>Development Mode:</strong> Using mock data. Some features may not work as expected.
          To use real integration, set up the private repository and configure environment variables.
        </div>
      )}
    </div>
  );
}