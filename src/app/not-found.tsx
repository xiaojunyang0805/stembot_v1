// =============================================================================
// 404 NOT FOUND PAGE
// =============================================================================

// src/app/not-found.tsx
/**
 * 404 page component
 * Shown when routes are not found with helpful navigation
 */

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
      <div style={{width: '100%', maxWidth: '28rem', padding: '2rem', textAlign: 'center'}}>
        {/* 404 Illustration */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{marginBottom: '1rem', fontSize: '3.75rem'}}>📚</div>
          <div style={{marginBottom: '0.5rem', fontSize: '3.75rem', fontWeight: 'bold', color: '#111827'}}>404</div>
          <h1 style={{marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827'}}>Page Not Found</h1>
        </div>
        
        <p style={{marginBottom: '2rem', color: '#4b5563'}}>
          Looks like this page got lost in the learning materials. Let's get you back on track!
        </p>
        
        {/* Navigation options */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <Link
            href="/"
            style={{
              display: 'block',
              width: '100%',
              borderRadius: '0.5rem',
              backgroundColor: '#2563eb',
              padding: '0.75rem 1rem',
              fontWeight: '600',
              color: 'white',
              transition: 'background-color 0.2s',
              textDecoration: 'none',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#2563eb'}
          >
            Return Home
          </Link>
          
          <Link
            href="/dashboard/dashboard"
            style={{
              display: 'block',
              width: '100%',
              borderRadius: '0.5rem',
              backgroundColor: '#4b5563',
              padding: '0.75rem 1rem',
              fontWeight: '600',
              color: 'white',
              transition: 'background-color 0.2s',
              textDecoration: 'none',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#374151'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#4b5563'}
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/dashboard/projects"
            style={{
              display: 'block',
              width: '100%',
              color: '#2563eb',
              textDecoration: 'none',
              textAlign: 'center',
              padding: '0.75rem 1rem'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
          >
            View My Projects
          </Link>
        </div>
        
        {/* Helpful suggestions */}
        <div style={{marginTop: '2rem', textAlign: 'left'}}>
          <h3 style={{marginBottom: '0.75rem', fontWeight: '600', color: '#111827'}}>Popular destinations:</h3>
          <ul style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem'}}>
            <li>
              <Link href="/dashboard/projects/create" style={{color: '#2563eb', textDecoration: 'none'}} onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'} onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}>
                Create a new project
              </Link>
            </li>
            <li>
              <Link href="/dashboard/progress" style={{color: '#2563eb', textDecoration: 'none'}} onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'} onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}>
                Check your progress
              </Link>
            </li>
            <li>
              <Link href="/billing/pricing" style={{color: '#2563eb', textDecoration: 'none'}} onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'} onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}>
                View pricing plans
              </Link>
            </li>
            <li>
              <Link href="/help" style={{color: '#2563eb', textDecoration: 'none'}} onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'} onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}>
                Get help and support
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Search suggestion */}
        <div style={{marginTop: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#f9fafb', padding: '1rem'}}>
          <p style={{marginBottom: '0.5rem', fontSize: '0.875rem', color: '#4b5563'}}>Looking for something specific?</p>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                flex: '1',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = 'transparent';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px #3b82f6';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
            <button style={{
              borderRadius: '0.5rem',
              backgroundColor: '#2563eb',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
