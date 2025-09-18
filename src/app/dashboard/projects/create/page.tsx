// src/app/dashboard/projects/create/page.tsx
/**
 * Project creation wizard page
 * Multi-step form for creating new STEM projects
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Project - StemBot',
  description: 'Create a new STEM learning project',
};

export default function CreateProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/projects" 
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          ← Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Project</h1>
        <div className="flex items-center text-sm text-gray-600">
          <span>Step 2 of 3</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            ✓
          </div>
          <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
          <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
            3
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Basic Info</span>
          <span>Project Setup</span>
          <span>Finish</span>
        </div>
      </div>

      {/* TODO: Replace with ProjectForm component */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Project Setup</h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What subject are you working on?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                type="button"
                className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-2">📐</div>
                <div className="font-semibold text-blue-700">Math</div>
                <div className="text-xs text-blue-600">Algebra, Geometry, Calculus</div>
              </button>
              <button 
                type="button"
                className="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="text-2xl mb-2">⚗️</div>
                <div className="font-semibold">Science</div>
                <div className="text-xs text-gray-600">Physics, Chemistry, Biology</div>
              </button>
              <button 
                type="button"
                className="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="text-2xl mb-2">💻</div>
                <div className="font-semibold">Coding</div>
                <div className="text-xs text-gray-600">Python, JavaScript, Java</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Algebra Homework Helper"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Goals (optional)
            </label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="I want to master solving quadratic equations and understand when to use different methods..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Materials (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="text-4xl text-gray-400 mb-4">📎</div>
              <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
              <p className="text-xs text-gray-500">PDF, DOC, TXT files up to 10MB</p>
              <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.txt" />
              <button type="button" className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Choose Files
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              href="/dashboard/projects"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous Step
            </Link>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}