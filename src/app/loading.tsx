// =============================================================================
// LOADING COMPONENT
// =============================================================================

// src/app/loading.tsx
/**
 * Global loading component
 * Shown during page transitions and initial app loading
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        {/* Animated StemBot Logo */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">StemBot</h2>
        </div>
        
        {/* Loading Animation */}
        <div className="mb-6 flex items-center justify-center space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{animationDelay: '0.1s'}}></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{animationDelay: '0.2s'}}></div>
        </div>
        
        <p className="text-gray-600">Loading your learning environment...</p>
        
        {/* Privacy reminder */}
        <div className="mt-6 text-sm text-gray-500">
          <div className="flex items-center justify-center">
            <span className="mr-2">🔒</span>
            <span>All processing happens locally</span>
          </div>
        </div>
      </div>
    </div>
  );
}