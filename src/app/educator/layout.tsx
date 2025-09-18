// =============================================================================
// EDUCATOR LAYOUT
// =============================================================================

// src/app/(educator)/layout.tsx
/**
 * Educator layout component
 * Provides specialized navigation and layout for educator-specific features
 * Includes educator dashboard, analytics, lesson planning, and reporting tools
 */

import Link from 'next/link';

interface EducatorLayoutProps {
  children: React.ReactNode;
}

export default function EducatorLayout({ children }: EducatorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Educator Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/dashboard/dashboard" className="text-xl font-semibold text-blue-600">
                StemBot
              </Link>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                Educator
              </span>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/educator/educator/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/educator/educator/analytics" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Analytics
              </Link>
              <Link 
                href="/educator/educator/lesson-plans" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Lesson Plans
              </Link>
              <Link 
                href="/educator/educator/students" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Students
              </Link>
              <Link 
                href="/educator/reports" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reports
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <select className="text-sm border-none bg-transparent text-gray-600">
                <option value="en">EN</option>
                <option value="nl" selected>NL</option>
              </select>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">MT</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">Mrs. Teacher</div>
                  <div className="text-xs text-gray-500">8B Mathematics</div>
                </div>
              </div>

              {/* Settings & Logout */}
              <Link 
                href="/dashboard/settings" 
                className="text-gray-600 hover:text-gray-900"
                title="Settings"
              >
                ⚙️
              </Link>
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-900"
                title="Logout"
              >
                🚪
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2">
          <div className="flex space-x-4 overflow-x-auto">
            <Link 
              href="/educator/educator/dashboard" 
              className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              📊 Dashboard
            </Link>
            <Link 
              href="/educator/educator/analytics" 
              className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              📈 Analytics
            </Link>
            <Link 
              href="/educator/educator/lesson-plans" 
              className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              📝 Lessons
            </Link>
            <Link 
              href="/educator/educator/students" 
              className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              👥 Students
            </Link>
            <Link 
              href="/educator/reports" 
              className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              📄 Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Banner for Educators */}
      <div className="bg-violet-50 border-b border-violet-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center text-sm">
            <span className="text-violet-600 mr-2">🔒</span>
            <span className="text-violet-800">
              Student privacy protected: All AI processing remains local, only anonymized analytics available
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              StemBot Educator Platform • Privacy-first STEM education
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/help" className="text-gray-600 hover:text-gray-900">
                Help Center
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="mailto:educators@stembot.nl" className="text-gray-600 hover:text-gray-900">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}