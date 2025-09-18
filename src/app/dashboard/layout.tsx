// src/app/dashboard/layout.tsx
/**
 * Dashboard layout component
 * Provides sidebar navigation and authenticated layout
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Replace with Header component */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-blue-600">StemBot</h1>
            <span className="ml-2 text-sm text-gray-500">🇳🇱 NL</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">👤 Student</span>
            <button className="text-gray-600 hover:text-gray-800">⚙️</button>
            <button className="text-gray-600 hover:text-gray-800">🚪</button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* TODO: Replace with Sidebar component */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <a href="/dashboard/dashboard" className="flex items-center p-2 rounded hover:bg-gray-100">
                <span className="mr-3">📊</span> Dashboard
              </a>
              <a href="/dashboard/projects" className="flex items-center p-2 rounded hover:bg-gray-100">
                <span className="mr-3">📁</span> Projects
              </a>
              <a href="/dashboard/progress" className="flex items-center p-2 rounded hover:bg-gray-100">
                <span className="mr-3">📈</span> Progress
              </a>
              <a href="/dashboard/settings" className="flex items-center p-2 rounded hover:bg-gray-100">
                <span className="mr-3">⚙️</span> Settings
              </a>
            </div>
          </nav>
        </aside>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}