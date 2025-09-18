// src/app/(dashboard)/settings/page.tsx
/**
 * User settings page
 * Manages user preferences, privacy settings, and account configuration
 * Located at: src/app/(dashboard)/settings/page.tsx
 * URL: /settings
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Settings - StemBot',
  description: 'Manage your account settings and preferences',
};

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input 
                type="text" 
                defaultValue="Alex"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input 
                type="text" 
                defaultValue="Student"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              defaultValue="alex.student@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="student">Student</option>
              <option value="educator">Educator</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution (Optional)
            </label>
            <input 
              type="text" 
              placeholder="University of Amsterdam"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interface Language
              </label>
              {/* TODO: Replace with LanguageSwitcher component */}
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="en">English</option>
                <option value="nl" selected>Nederlands</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Region
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="nl" selected>Netherlands</option>
                <option value="be">Belgium</option>
                <option value="de">Germany</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curriculum Standards
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="nl-national" selected>Dutch National Standards</option>
              <option value="ib">International Baccalaureate</option>
              <option value="cambridge">Cambridge International</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy & AI Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & AI Processing</h2>
        
        <div className="space-y-6">
          {/* Local AI Processing */}
          <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg border border-violet-200">
            <div>
              <h3 className="font-semibold text-violet-900">Local AI Processing</h3>
              <p className="text-sm text-violet-700">All AI queries processed on your device/local server</p>
            </div>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-violet-800">Always On</span>
              <div className="w-12 h-6 bg-violet-500 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
              </div>
            </div>
          </div>
          
          {/* Data Storage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Data Storage Location</h3>
              <span className="text-sm text-green-600 font-semibold">Local Only</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium text-green-800">Conversations: Local</div>
                <div className="text-green-600">1,847 messages stored</div>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium text-green-800">Projects: Local</div>
                <div className="text-green-600">2.3 MB data stored</div>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium text-green-800">Progress: Local</div>
                <div className="text-green-600">No external sharing</div>
              </div>
            </div>
          </div>
          
          {/* Context Memory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Context Memory Duration</h3>
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
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h2>
        
        <div className="space-y-6">
          {/* Gamification Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Gamification Level</h3>
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
              <span>Minimal</span>
              <span>Maximum</span>
            </div>
          </div>
          
          {/* Hint Frequency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Hint Frequency</h3>
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
              <span>Rare</span>
              <span>Frequent</span>
            </div>
          </div>
          
          {/* Step Detail Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Step-by-Step Detail</h3>
              <span className="text-sm text-gray-600">Very Detailed</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              defaultValue="5"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Brief</span>
              <span>Very Detailed</span>
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Daily learning reminders</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Badge achievements</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">Weekly progress reports</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">New feature announcements</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
        
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <div>
            <h3 className="font-semibold text-blue-900">Current Plan: StemBot Hobby</h3>
            <p className="text-sm text-blue-700">1,000 queries/month, Advanced features</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-900">€15.00</div>
            <div className="text-sm text-blue-700">per month</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/billing/pricing"
            className="block w-full p-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Change Plan
          </Link>
          
          <Link
            href="/billing/billing"
            className="block w-full p-3 text-center bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Manage Billing
          </Link>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
          <div className="text-sm">
            <div className="font-medium text-green-800 mb-1">Usage This Month</div>
            <div className="flex justify-between text-green-700">
              <span>AI Queries: 347 / 1,000</span>
              <span>653 remaining</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full" style={{width: '34.7%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Export Learning Data</h3>
              <p className="text-sm text-gray-600">Download your conversations and progress</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add extra security to your account</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-semibold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-violet-50 rounded-xl p-6 border border-violet-200">
        <div className="flex items-start">
          <div className="text-violet-600 mr-3 mt-1 text-lg">🔒</div>
          <div>
            <h3 className="font-semibold text-violet-900 mb-2">Your Privacy is Protected</h3>
            <div className="text-sm text-violet-800 space-y-1">
              <p>• All AI processing happens locally on your device</p>
              <p>• Your learning conversations never leave your computer</p>
              <p>• We only store account information, not learning content</p>
              <p>• You can export and delete all your data at any time</p>
            </div>
            <Link 
              href="/privacy" 
              className="text-violet-600 hover:underline text-sm mt-2 inline-block"
            >
              Read our Privacy Policy →
            </Link>
          </div>
        </div>
      </div>

      {/* Save All Changes */}
      <div className="flex justify-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
          Save All Changes
        </button>
      </div>
    </div>
  );
}