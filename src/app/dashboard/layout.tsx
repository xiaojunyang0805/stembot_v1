// src/app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">StemBot</h1>
            <span className="ml-2 text-sm text-gray-500">🇳🇱 NL</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">👤 Student</span>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">⚙️</button>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">🚪</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
          <nav className="p-4">
            <div className="space-y-2">
              <Link 
                href="/dashboard" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">📊</span>
                <span className="font-medium text-gray-700">Dashboard</span>
              </Link>
              <Link 
                href="/projects" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">📁</span>
                <span className="font-medium text-gray-700">Projects</span>
              </Link>
              <Link 
                href="/progress" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">📈</span>
                <span className="font-medium text-gray-700">Progress</span>
              </Link>
              <Link 
                href="/settings" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-lg">⚙️</span>
                <span className="font-medium text-gray-700">Settings</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}