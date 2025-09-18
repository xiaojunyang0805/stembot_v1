// src/app/auth/layout.tsx
/**
 * Authentication layout component
 * Provides centered layout for auth pages with branding
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* TODO: Add StemBot logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">StemBot</h1>
          <p className="text-gray-600 text-sm mt-2">🔒 Privacy-First STEM Learning</p>
        </div>
        {children}
      </div>
    </div>
  );
}