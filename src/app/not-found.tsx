// =============================================================================
// 404 NOT FOUND PAGE
// =============================================================================

// src/app/not-found.tsx
/**
 * 404 page component
 * Shown when routes are not found with helpful navigation
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full text-center p-8">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-6xl font-bold text-gray-900 mb-2">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Looks like this page got lost in the learning materials. Let's get you back on track!
        </p>
        
        {/* Navigation options */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Return Home
          </Link>
          
          <Link
            href="/dashboard/dashboard"
            className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/dashboard/projects"
            className="block w-full text-blue-600 hover:underline"
          >
            View My Projects
          </Link>
        </div>
        
        {/* Helpful suggestions */}
        <div className="mt-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Popular destinations:</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/dashboard/projects/create" className="text-blue-600 hover:underline">
                Create a new project
              </Link>
            </li>
            <li>
              <Link href="/dashboard/progress" className="text-blue-600 hover:underline">
                Check your progress
              </Link>
            </li>
            <li>
              <Link href="/billing/pricing" className="text-blue-600 hover:underline">
                View pricing plans
              </Link>
            </li>
            <li>
              <Link href="/help" className="text-blue-600 hover:underline">
                Get help and support
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Search suggestion */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Looking for something specific?</p>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Search..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
