'use client'

import { useAuth } from '../../providers/AuthProvider'

export function AuthDebugger() {
  const auth = useAuth()

  console.log('AuthDebugger render:', {
    loading: auth.loading,
    hasUser: !!auth.user,
    userId: auth.user?.id,
    hasSession: !!auth.session,
    error: auth.error,
    timestamp: new Date().toISOString()
  })

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#fff',
      border: '2px solid #000',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug Info</h4>
      <div>Loading: {auth.loading ? 'true' : 'false'}</div>
      <div>User: {auth.user ? auth.user.id : 'null'}</div>
      <div>Session: {auth.session ? 'present' : 'null'}</div>
      <div>Error: {auth.error || 'none'}</div>
      <div>Timestamp: {new Date().toLocaleTimeString()}</div>
    </div>
  )
}