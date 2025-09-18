// =============================================================================
// PROJECT SHARING PAGE
// =============================================================================

// src/app/(dashboard)/projects/[id]/share/page.tsx
/**
 * Project sharing page
 * Manages sharing links, permissions, and collaboration settings
 * Located at: src/app/(dashboard)/projects/[id]/share/page.tsx
 * URL: /projects/[id]/share
 */

import type { Metadata } from 'next';
import Link from 'next/link';

interface ProjectShareProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Share Project - StemBot',
  description: 'Share your project with others',
};

export default function ProjectSharePage({ params }: ProjectShareProps) {
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
              <span className="text-2xl mr-3">📤</span>
              Share Algebra Bot
            </h1>
          </div>
          <p className="text-gray-600">Control who can access and interact with your project</p>
        </div>
        <Link
          href={`/dashboard/projects/${id}/settings`}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Project Settings
        </Link>
      </div>

      {/* Privacy Notice */}
      <div className="bg-violet-50 rounded-xl p-6 border border-violet-200">
        <div className="flex items-start">
          <div className="text-violet-600 mr-3 mt-1 text-lg">🔒</div>
          <div>
            <h3 className="font-semibold text-violet-900 mb-2">Privacy First Sharing</h3>
            <div className="text-sm text-violet-800 space-y-1">
              <p>• Only project files and metadata are shared, never your private conversations</p>
              <p>• All AI processing remains local on each user's device</p>
              <p>• You can revoke access at any time</p>
              <p>• Shared users get their own private conversation history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Sharing Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Sharing Status</h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-4">🔒</span>
            <div>
              <div className="font-semibold text-gray-900">Private Project</div>
              <div className="text-sm text-gray-600">Only you can access this project</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Created 5 days ago</div>
            <div className="text-sm text-gray-500">0 people have access</div>
          </div>
        </div>
      </div>

      {/* Sharing Options */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sharing Options</h2>
        
        <div className="space-y-4">
          {/* Share via Link */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Share via Link</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Generate Link
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Create a shareable link that others can use to access your project. You can set permissions and revoke access at any time.
            </p>
          </div>
          
          {/* Direct Invitation */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Invite by Email</h3>
            <div className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Enter email address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="view">Can View</option>
                <option value="interact">Can Interact</option>
                <option value="edit">Can Edit</option>
              </select>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Invite
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Send a direct invitation with specific permissions
            </p>
          </div>
        </div>
      </div>

      {/* Permission Levels */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Permission Levels</h2>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <input type="radio" name="permission" className="mr-3" id="view" />
              <label htmlFor="view" className="font-semibold text-gray-900">👀 Can View</label>
            </div>
            <div className="ml-6 text-sm text-gray-600">
              <p>• See project files and description</p>
              <p>• View project goals and progress</p>
              <p>• Cannot interact with AI or make changes</p>
            </div>
          </div>
          
          <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
            <div className="flex items-center mb-2">
              <input type="radio" name="permission" className="mr-3" id="interact" defaultChecked />
              <label htmlFor="interact" className="font-semibold text-blue-900">💬 Can Interact (Recommended)</label>
            </div>
            <div className="ml-6 text-sm text-blue-800">
              <p>• All viewing permissions</p>
              <p>• Chat with AI tutor (private conversations)</p>
              <p>• Track their own progress</p>
              <p>• Cannot modify project settings or files</p>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <input type="radio" name="permission" className="mr-3" id="edit" />
              <label htmlFor="edit" className="font-semibold text-gray-900">✏️ Can Edit</label>
            </div>
            <div className="ml-6 text-sm text-gray-600">
              <p>• All interaction permissions</p>
              <p>• Add or remove files</p>
              <p>• Modify project settings</p>
              <p>• Invite other people (with your approval)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Features */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Features</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Available Features</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Allow collaborative study sessions</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Enable shared progress tracking</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">Allow others to see anonymized chat statistics</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">Enable group discussion board</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Usage Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Users
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="5">5 users</option>
                  <option value="10" selected>10 users</option>
                  <option value="25">25 users</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="1day">1 day</option>
                  <option value="1week" selected>1 week</option>
                  <option value="1month">1 month</option>
                  <option value="never">Never expires</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Shared Users */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shared With</h2>
        
        <div className="text-center py-8">
          <div className="text-4xl text-gray-400 mb-4">👥</div>
          <p className="text-gray-600 mb-4">This project hasn't been shared yet</p>
          <p className="text-sm text-gray-500">
            Use the sharing options above to invite collaborators
          </p>
        </div>
      </div>

      {/* Generate Share Link */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Links</h2>
        
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="text-2xl text-gray-400 mb-3">🔗</div>
            <p className="text-gray-600 mb-4">No active sharing links</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Create Share Link
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Link
          href={`/dashboard/projects/${id}`}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Project
        </Link>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Sharing Settings
        </button>
      </div>
    </div>
  );
}