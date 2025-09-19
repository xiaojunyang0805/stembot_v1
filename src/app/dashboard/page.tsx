export default function Dashboard() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      <div style={{padding: '24px', maxWidth: '1200px', margin: '0 auto'}}>
        {/* Welcome Hero Section */}
        <div style={{
          background: 'linear-gradient(to right, #dbeafe, #bfdbfe)',
          border: '1px solid #93c5fd',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0}}>
                Welcome back, alex@student.com!
              </h1>
              <p style={{color: '#6b7280', marginTop: '4px', margin: 0}}>
                Ready to continue learning?
              </p>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c'}}>
                <span style={{fontSize: '24px'}}>🔥</span>
                <span style={{fontWeight: 'bold', fontSize: '20px'}}>7 days</span>
              </div>
              <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>Learning streak</p>
            </div>
          </div>
        </div>

        {/* Privacy Status Section */}
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '1px solid #c4b5fd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span style={{fontSize: '20px', color: '#7c3aed'}}>🔒</span>
            <div>
              <p style={{fontWeight: '500', color: '#581c87', margin: 0}}>
                Privacy: All AI processing stays local
              </p>
              <p style={{fontSize: '14px', color: '#7c3aed', margin: 0}}>
                ✅ Offline Mode Active • GDPR Compliant
              </p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0}}>
              My Projects
            </h2>
            <button style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Create Project
            </button>
          </div>

          {/* Project Cards Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px'}}>
            {/* Math Project Card */}
            <div style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#2563eb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{color: 'white', fontSize: '18px'}}>📐</span>
                </div>
                <div>
                  <h4 style={{fontWeight: '500', color: '#111827', margin: 0}}>Algebra Bot</h4>
                  <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>Mathematics</p>
                </div>
              </div>
              <div style={{marginBottom: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                  <span style={{fontSize: '14px', color: '#6b7280'}}>Progress</span>
                  <span style={{fontSize: '14px', fontWeight: '500', color: '#2563eb'}}>80%</span>
                </div>
                <div style={{width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px'}}>
                  <div style={{width: '80%', backgroundColor: '#2563eb', height: '8px', borderRadius: '4px'}}></div>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '16px'}}>⭐⭐⭐</span>
                <span style={{fontSize: '12px', color: '#6b7280'}}>2 hours ago</span>
              </div>
            </div>

            {/* Science Project Card */}
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#16a34a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{color: 'white', fontSize: '18px'}}>⚗️</span>
                </div>
                <div>
                  <h4 style={{fontWeight: '500', color: '#111827', margin: 0}}>Chemistry Lab</h4>
                  <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>Science</p>
                </div>
              </div>
              <div style={{marginBottom: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                  <span style={{fontSize: '14px', color: '#6b7280'}}>Progress</span>
                  <span style={{fontSize: '14px', fontWeight: '500', color: '#16a34a'}}>45%</span>
                </div>
                <div style={{width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px'}}>
                  <div style={{width: '45%', backgroundColor: '#16a34a', height: '8px', borderRadius: '4px'}}></div>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '16px'}}>⭐⭐</span>
                <span style={{fontSize: '12px', color: '#6b7280'}}>Yesterday</span>
              </div>
            </div>

            {/* Create New Project Card */}
            <div style={{
              backgroundColor: '#f9fafb',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <span style={{color: '#9ca3af', fontSize: '24px'}}>➕</span>
              </div>
              <p style={{color: '#6b7280', fontWeight: '500', margin: 0}}>Create New Project</p>
            </div>
          </div>
        </div>

        <p style={{color: '#6b7280', textAlign: 'center'}}>
          More sections coming in next update...
        </p>
      </div>
    </div>
  );
}