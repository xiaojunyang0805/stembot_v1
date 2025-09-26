// src/app/auth/layout.tsx
/**
 * Authentication layout wrapper
 * Simply renders children - actual layout is handled by individual auth pages
 * using the AuthLayout component for consistency.
 */

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}