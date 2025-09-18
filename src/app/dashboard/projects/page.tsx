// src/app/dashboard/projects/page.tsx
/**
 * Projects listing page
 * Shows all user projects with search and filtering
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projects - StemBot',
  description: 'Your STEM projects',
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Link 
          href="/dashboard/projects/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Create New Project
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="🔍 Search projects..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Subjects</option>
            <option value="math">📐 Mathematics</option>
            <option value="science">⚗️ Science</option>
            <option value="coding">💻 Programming</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* TODO: Replace with ProjectList component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example project cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📐</div>
              <div>
                <h3 className="font-semibold">Algebra Bot</h3>
                <p className="text-sm text-gray-600">Mathematics</p>
              </div>
            </div>
            <div className="text-right">
              <button className="text-gray-400 hover:text-gray-600">⋯</button>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>80%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⭐⭐</span>
              <span className="text-xs text-gray-500">2 badges</span>
            </div>
            <button className="text-blue-600 hover:underline text-sm">View →</button>
          </div>
        </div>
      </div>
    </div>
  );
}