// src/app/(billing)/layout.tsx
/**
 * Billing layout component
 * Provides clean layout for billing and subscription pages
 */
interface BillingLayoutProps {
  children: React.ReactNode;
}

export default function BillingLayout({ children }: BillingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header for Billing */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-600">StemBot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/dashboard/dashboard" className="text-gray-600 hover:text-gray-800">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}