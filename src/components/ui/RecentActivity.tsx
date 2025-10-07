'use client';

interface Activity {
  icon: string;
  text: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginTop: '2rem'
    }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📊 Recent Activity
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {activities.map((activity, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.375rem'
          }}>
            <span style={{ fontSize: '1rem', marginTop: '0.1rem' }}>{activity.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.125rem'
              }}>
                {activity.text}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
