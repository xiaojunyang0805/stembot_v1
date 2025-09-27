// TEST ROUTE - Same content as dashboard but different path

export default function TestRoutePage() {
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
          🧪 TEST ROUTE - Same Content, Different Path
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          This is identical content to the dashboard but at /test-route
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#dc2626',
          fontWeight: 'bold'
        }}>
          If this works without refresh but dashboard doesn't, the issue is route-specific.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '4px'
        }}>
          <strong>Test Status:</strong> Same static content as dashboard, different route
        </div>
      </div>
    </div>
  );
}