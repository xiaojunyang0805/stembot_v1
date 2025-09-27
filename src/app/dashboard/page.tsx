// COMPLETELY NEW DASHBOARD - Server Component (no 'use client')

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export default function DashboardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          🔄 FRESH DASHBOARD - Server Component
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          This is a completely new dashboard file as a Server Component (no client-side JS).
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#059669',
          fontWeight: 'bold'
        }}>
          If this works without refresh, the issue was in the client component setup.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #059669',
          borderRadius: '4px'
        }}>
          <strong>Test Status:</strong> Server Component with zero client-side JavaScript
        </div>
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '4px'
        }}>
          <strong>Note:</strong> This completely bypasses any hydration or client-side issues
        </div>
      </div>
    </div>
  );
}