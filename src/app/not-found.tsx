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
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mb-4 text-6xl">📚</div>
          <div className="mb-2 text-6xl font-bold text-gray-900">404</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Page Not Found</h1>
        </div>
        
        <p className="mb-8 text-gray-600">
          Looks like this page got lost in the learning materials. Let's get you back on track!
        </p>
        
        {/* Navigation options */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Return Home
          </Link>
          
          <Link
            href="/dashboard/dashboard"
            className="block w-full rounded-lg bg-gray-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
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
          <h3 className="mb-3 font-semibold text-gray-900">Popular destinations:</h3>
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
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-sm text-gray-600">Looking for something specific?</p>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Search..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
