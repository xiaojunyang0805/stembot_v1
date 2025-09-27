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
    <div style={{position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 50, maxWidth: '24rem', borderRadius: '0.5rem', border: '1px solid #fde047', backgroundColor: '#fefce8', padding: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            style={{height: '1.25rem', width: '1.25rem', color: '#facc15'}}
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
          <h3 style={{fontSize: '0.875rem', fontWeight: 500, color: '#92400e'}}>
            Version Mismatch Detected
          </h3>
          <div style={{marginTop: '0.25rem', fontSize: '0.75rem', color: '#a16207'}}>
            <p>Frontend: {versionInfo.frontend.slice(0, 8)}</p>
            <p>Backend: {versionInfo.backend.slice(0, 8)}</p>
            <p style={{marginTop: '0.25rem', color: '#ca8a04'}}>
              Please refresh the page to sync versions.
            </p>
          </div>
          <div style={{marginTop: '0.5rem'}}>
            <button
              onClick={() => window.location.reload()}
              style={{borderRadius: '0.25rem', backgroundColor: '#ca8a04', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 500, color: 'white', cursor: 'pointer'}}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#a16207'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#ca8a04'; }}
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
    <div style={{position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 50, borderRadius: '0.5rem', backgroundColor: '#1f2937', padding: '0.5rem', fontSize: '0.75rem', color: 'white', opacity: 0.75}}>
      <div>Frontend: {versionInfo.frontend.slice(0, 8)}</div>
      <div>Env: {versionInfo.environment}</div>
      <div>Built: {new Date(versionInfo.buildDate).toLocaleString()}</div>
    </div>
  );
}