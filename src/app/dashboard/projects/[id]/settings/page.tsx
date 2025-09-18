// =============================================================================
// PROJECT SETTINGS PAGE
// =============================================================================

// src/app/(dashboard)/projects/[id]/settings/page.tsx
/**
 * Individual project settings page
 * Manages project configuration, permissions, and advanced options
 * Located at: src/app/(dashboard)/projects/[id]/settings/page.tsx
 * URL: /projects/[id]/settings
 */

import type { Metadata } from 'next';
import Link from 'next/link';

interface ProjectSettingsProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Project Settings - StemBot',
  description: 'Manage your project settings and configuration',
};

export default function ProjectSettingsPage({ params }: ProjectSettingsProps) {
  const { id } = params;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center mb-2">
            <Link 
              href={`/dashboard/projects/${id}`}
              className="text-gray-600 hover:text-gray-800 mr-3"
            >
              ← Back to Project
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📐</span>
              Algebra Bot Settings
            </h1>
          </div>
          <p className="text-gray-600">Manage project configuration and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/projects/${id}/share`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Share Project
          </Link>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input 
              type="text" 
              defaultValue="Algebra Bot"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Category
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="mathematics" selected>📐 Mathematics</option>
              <option value="science">⚗️ Science</option>
              <option value="programming">💻 Programming</option>
              <option value="physics">🔬 Physics</option>
              <option value="chemistry">⚛️ Chemistry</option>
              <option value="biology">🧬 Biology</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              defaultValue="AI tutor for mastering algebra concepts including quadratic equations, factoring, and problem-solving strategies."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Goals
            </label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              defaultValue="• Master quadratic equations
• Understand factoring methods  
• Apply algebra to real-world problems
• Build confidence in mathematical reasoning"
            />
          </div>
        </form>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Tutor Configuration</h2>
        
        <div className="space-y-6">
          {/* AI Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="llama31-8b" selected>Llama 3.1 8B (Recommended for Math)</option>
              <option value="mistral-7b">Mistral 7B (General Purpose)</option>
              <option value="codellama-13b">CodeLlama 13B (For Programming)</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Different models excel at different subjects. Current: Local processing with Ollama.
            </p>
          </div>
          
          {/* Teaching Style */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Teaching Style: Socratic Method
              </label>
              <span className="text-sm text-gray-600">High</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              defaultValue="4"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Direct answers</span>
              <span>Guided questions</span>
            </div>
          </div>
          
          {/* Difficulty Adaptation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Difficulty Adaptation
              </label>
              <span className="text-sm text-gray-600">Moderate</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              defaultValue="3"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fixed level</span>
              <span>Auto-adjust</span>
            </div>
          </div>
          
          {/* Context Memory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Context Memory (Days)
              </label>
              <span className="text-sm text-gray-600">7 days</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              defaultValue="7"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 day</span>
              <span>30 days</span>
            </div>
          </div>
          
          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions for AI
            </label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add specific instructions for how the AI should behave in this project..."
            />
            <p className="text-sm text-gray-600 mt-1">
              These instructions will be added to every AI conversation in this project.
            </p>
          </div>
        </div>
      </div>

      {/* File Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Files</h2>
        
        <div className="space-y-4">
          {/* Current Files */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Materials</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-3">📄</span>
                  <div>
                    <div className="font-medium text-gray-900">algebra-textbook-ch5.pdf</div>
                    <div className="text-sm text-gray-600">2.4 MB • Uploaded 5 days ago</div>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Remove
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-3">📊</span>
                  <div>
                    <div className="font-medium text-gray-900">practice-problems.docx</div>
                    <div className="text-sm text-gray-600">856 KB • Uploaded 3 days ago</div>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          {/* Add New Files */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Materials</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="text-4xl text-gray-400 mb-4">📎</div>
              <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
              <p className="text-xs text-gray-500 mb-4">PDF, DOC, TXT files up to 10MB</p>
              <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.txt" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Choose Files
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Sharing */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Sharing</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Visibility
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="private" selected>🔒 Private (Only you can access)</option>
              <option value="shared">👥 Shared (People with link can view)</option>
              <option value="public">🌐 Public (Anyone can find and view)</option>
            </select>
          </div>
          
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <div className="flex items-center mb-2">
              <span className="text-violet-600 mr-2">🔒</span>
              <span className="font-semibold text-violet-900">Privacy Protected</span>
            </div>
            <p className="text-sm text-violet-800">
              All AI conversations remain local regardless of sharing settings. Only project metadata and files are shared.
            </p>
          </div>
          
          {/* Collaboration Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Collaboration Permissions</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">Allow others to chat with this project</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">Allow others to add files</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Allow others to view conversation history</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Project Backup</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Export Project Data</div>
                <div className="text-sm text-gray-600">Download conversations, files, and settings</div>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Export
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Project Actions</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Duplicate Project</div>
                  <div className="text-sm text-gray-600">Create a copy with same settings</div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Duplicate
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Archive Project</div>
                  <div className="text-sm text-gray-600">Hide from active projects list</div>
                </div>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                  Archive
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <div className="font-medium text-red-900">Delete Project</div>
                  <div className="text-sm text-red-700">Permanently delete all project data</div>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-center space-x-4">
        <Link
          href={`/dashboard/projects/${id}`}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </Link>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}