// =============================================================================
// LOADING COMPONENT
// =============================================================================

// src/app/loading.tsx
/**
 * Global loading component
 * Shown during page transitions and initial app loading
 */

'use client';

export default function Loading() {
  return (
    <>
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
      `}</style>
    <div style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
      <div style={{textAlign: 'center'}}>
        {/* Animated StemBot Logo */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{margin: '0 auto 1rem auto', display: 'flex', height: '4rem', width: '4rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#2563eb'}}>
            <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>S</span>
          </div>
          <h2 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827'}}>StemBot</h2>
        </div>
        
        {/* Loading Animation */}
        <div style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
          <div style={{height: '0.75rem', width: '0.75rem', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounce 1s infinite'}}></div>
          <div style={{height: '0.75rem', width: '0.75rem', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounce 1s infinite', animationDelay: '0.1s'}}></div>
          <div style={{height: '0.75rem', width: '0.75rem', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounce 1s infinite', animationDelay: '0.2s'}}></div>
        </div>
        
        <p style={{color: '#4b5563'}}>Loading your learning environment...</p>
        
        {/* Privacy reminder */}
        <div style={{marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{marginRight: '0.5rem'}}>🔒</span>
            <span>All processing happens locally</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}