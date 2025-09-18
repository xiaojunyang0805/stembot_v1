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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Animated StemBot Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">StemBot</h2>
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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