// MINIMAL DASHBOARD TEST - No imports, no hooks, no complexity

export default function DashboardPage() {
  // MINIMAL TEST: Remove all complexity to isolate the issue

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
          🧪 MINIMAL DASHBOARD TEST
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          If this text appears immediately without refresh, the issue is in the removed code.
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#dc2626',
          fontWeight: 'bold'
        }}>
          If this still requires refresh, the issue is deeper in Next.js routing or deployment.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '4px'
        }}>
          <strong>Test Status:</strong> Completely static content with inline styles only
        </div>
      </div>
    </div>
  );
}