'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
  frontend: string;
  backend: string;
  buildDate: string;
  environment: string;
}

export function VersionSync() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [versionMismatch, setVersionMismatch] = useState(false);

  useEffect(() => {
    const checkVersions = async () => {
      try {
        // Get frontend version from environment
        const frontendVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';
        const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || 'unknown';
        const environment = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || 'development';

        // Check backend version via API
        let backendVersion = 'unknown';
        try {
          const response = await fetch('/api/version', { method: 'GET' });
          if (response.ok) {
            const data = await response.json();
            backendVersion = data.version || 'unknown';
          }
        } catch (error) {
          console.warn('Could not fetch backend version:', error);
        }

        const versions: VersionInfo = {
          frontend: frontendVersion,
          backend: backendVersion,
          buildDate,
          environment,
        };

        setVersionInfo(versions);

        // Check for mismatch (only if both versions are available)
        if (frontendVersion !== 'unknown' && backendVersion !== 'unknown') {
          setVersionMismatch(frontendVersion !== backendVersion);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    checkVersions();

    // Check versions periodically (every 5 minutes)
    const interval = setInterval(checkVersions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Only show warning if there's a version mismatch
  if (!versionMismatch || !versionInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-yellow-300 bg-yellow-50 p-3 shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Version Mismatch Detected
          </h3>
          <div className="mt-1 text-xs text-yellow-700">
            <p>Frontend: {versionInfo.frontend.slice(0, 8)}</p>
            <p>Backend: {versionInfo.backend.slice(0, 8)}</p>
            <p className="mt-1 text-yellow-600">
              Please refresh the page to sync versions.
            </p>
          </div>
          <div className="mt-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Version display for debugging (only in development)
export function VersionDisplay() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    const versions: VersionInfo = {
      frontend: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
      backend: 'checking...',
      buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || 'unknown',
      environment: process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || 'development',
    };
    setVersionInfo(versions);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!versionInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-gray-800 p-2 text-xs text-white opacity-75">
      <div>Frontend: {versionInfo.frontend.slice(0, 8)}</div>
      <div>Env: {versionInfo.environment}</div>
      <div>Built: {new Date(versionInfo.buildDate).toLocaleString()}</div>
    </div>
  );
}