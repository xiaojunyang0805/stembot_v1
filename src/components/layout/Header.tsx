'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from "../../hooks/useAuth";

export default function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-200 bg-white">
      <div className="h-full">
        <div className="flex h-full max-w-full items-center justify-between px-4 lg:px-6">
        {/* Left: Logo + Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">StemBot</h1>
          </div>
        </div>

        {/* Right: Language Switcher + User Menu */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center">
            <select className="rounded border border-gray-300 bg-white px-2 py-1 text-sm">
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100"
            >
              {/* User Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              
              {/* User Name (Desktop Only) */}
              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
              
              {/* Dropdown Arrow */}
              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {/* User Info */}
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                
                {/* Menu Items */}
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Click Outside to Close Dropdown */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}