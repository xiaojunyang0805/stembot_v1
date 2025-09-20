// src/app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  getNavItemStyles: (route: string, isHovered?: boolean) => React.CSSProperties;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, getNavItemStyles }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      style={getNavItemStyles(href, isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <span style={{
        marginRight: '12px',
        fontSize: '20px',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px'
      }}>
        {icon}
      </span>
      <span style={{
        fontSize: '16px',
        lineHeight: '1.5',
        letterSpacing: '0.01em'
      }}>
        {label}
      </span>
      {isActive && (
        <span style={{
          marginLeft: 'auto',
          width: '4px',
          height: '4px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.8
        }} />
      )}
    </Link>
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [children]);

  // Helper function to check if a route is active
  const isActiveRoute = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/dashboard';
    }
    return pathname.startsWith(route);
  };

  // Helper function to get navigation item styles
  const getNavItemStyles = (route: string, isHovered: boolean = false) => {
    const isActive = isActiveRoute(route);

    return {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderRadius: '6px',
      textDecoration: 'none',
      minHeight: '44px', // Touch-friendly minimum
      transition: 'all 0.2s ease-in-out',
      position: 'relative' as const,
      backgroundColor: isActive
        ? '#2563eb'
        : isHovered
        ? '#f0f9ff'
        : 'transparent',
      color: isActive ? 'white' : '#374151',
      fontWeight: isActive ? '600' : '500',
      boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.2)' : 'none'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-md border-none bg-transparent cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Logo */}
            <h1 className="text-lg md:text-xl font-bold text-blue-600 m-0">
              StemBot
            </h1>
          </div>

          {/* Right side - Language, User Menu, Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div ref={languageMenuRef} className="relative hidden md:block">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-transparent border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                🇳🇱 NL
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] z-50">
                  <button className="w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    🇺🇸 English
                  </button>
                  <button className="w-full px-4 py-3 text-left border-none bg-gray-50 cursor-pointer text-sm text-blue-600 font-medium">
                    🇳🇱 Nederlands
                  </button>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-transparent border-none rounded-lg cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  S
                </div>
                <span className="text-sm font-medium hidden md:inline">Student</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="m-0 text-sm font-semibold text-gray-900">Student Account</p>
                    <p className="m-0 text-xs text-gray-500">student@example.com</p>
                  </div>

                  <div className="py-1">
                    <button className="w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Profile
                    </button>

                    <button className="w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2575 9.77251 19.9887C9.5799 19.7199 9.31074 19.5161 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48438 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Settings
                    </button>

                    <div className="h-px bg-gray-100 my-1"></div>

                    <button className="w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm text-red-600 flex items-center gap-3 hover:bg-red-50 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </header>

      <div style={{ display: 'flex' }}>
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40,
              display: 'none'
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: '256px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRight: '1px solid #e5e7eb',
          position: 'relative',
          zIndex: 50,
          height: 'calc(100vh - 64px)', // Adjust for header height
          overflowY: 'auto'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '20px 16px 16px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <h2 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: '16px'
            }}>
              Navigation
            </h2>
          </div>

          <nav style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Dashboard Link */}
              <NavItem
                href="/dashboard"
                icon="📊"
                label="Dashboard"
                isActive={isActiveRoute('/dashboard')}
                getNavItemStyles={getNavItemStyles}
              />

              {/* Projects Link */}
              <NavItem
                href="/dashboard/projects"
                icon="📁"
                label="Projects"
                isActive={isActiveRoute('/dashboard/projects')}
                getNavItemStyles={getNavItemStyles}
              />

              {/* Progress Link */}
              <NavItem
                href="/dashboard/progress"
                icon="📈"
                label="Progress"
                isActive={isActiveRoute('/dashboard/progress')}
                getNavItemStyles={getNavItemStyles}
              />

              {/* Settings Link */}
              <NavItem
                href="/dashboard/settings"
                icon="⚙️"
                label="Settings"
                isActive={isActiveRoute('/dashboard/settings')}
                getNavItemStyles={getNavItemStyles}
              />
            </div>

            {/* Sidebar Footer */}
            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{
                  fontSize: '12px',
                  color: '#059669',
                  fontWeight: '500'
                }}>
                  System Status
                </span>
              </div>
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.4'
              }}>
                All systems operational
              </p>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '24px',
          minWidth: 0 // Prevent flex item from overflowing
        }}>
          {children}
        </main>
      </div>

      {/* Additional responsive styles */}
      <style>{`
        /* Pulse animation for system status */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Focus styles for accessibility */
        a:focus {
          outline: 2px solid #2563eb !important;
          outline-offset: 2px !important;
        }

        @media (max-width: 768px) {
          /* Hide sidebar on mobile by default */
          aside {
            position: fixed !important;
            top: 56px !important;
            left: ${isSidebarOpen ? '0' : '-256px'} !important;
            height: calc(100vh - 56px) !important;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 50 !important;
            box-shadow: ${isSidebarOpen ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'} !important;
          }

          /* Mobile sidebar header adjustments */
          aside > div:first-child {
            padding: 16px 16px 12px !important;
          }

          aside > nav {
            padding: 12px !important;
          }

          /* Mobile navigation item adjustments */
          aside nav a {
            padding: 16px 20px !important;
            min-height: 48px !important;
          }

          /* Hide sidebar footer on mobile to save space */
          aside nav > div > div:last-child {
            display: none !important;
          }

          /* Show overlay on mobile when sidebar is open */
          ${isSidebarOpen ? `
            aside + main::before {
              content: '';
              position: fixed;
              top: 56px;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.6);
              z-index: 40;
              display: block !important;
            }
          ` : ''}

          /* Adjust main content on mobile */
          main {
            padding: 16px !important;
            width: 100% !important;
          }
        }

        @media (min-width: 769px) {
          /* Desktop-specific styles */
          aside {
            height: calc(100vh - 64px) !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          aside {
            border-right: 2px solid #000 !important;
          }

          aside nav a {
            border: 1px solid transparent !important;
          }

          aside nav a:hover,
          aside nav a:focus {
            border-color: #2563eb !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          aside,
          aside nav a {
            transition: none !important;
          }
        }

        /* Handle clicks outside dropdowns */
        body {
          ${(isUserMenuOpen || isLanguageMenuOpen) ? `
            overflow: hidden;
          ` : ''}
        }
      `}</style>
    </div>
  );
}