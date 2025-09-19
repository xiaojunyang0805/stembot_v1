// src/app/dashboard/dashboard/page.tsx
/**
 * Main dashboard page
 * Shows user overview, recent projects, activity feed, and quick actions
 * Located at: src/app/dashboard/dashboard/page.tsx
 * URL: /dashboard/dashboard
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - StemBot',
  description: 'Your learning dashboard and project overview',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Alex!</h1>
            <p className="text-gray-600 mt-1">Ready to continue learning?</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-xl">7 days</span>
            </div>
            <p className="text-sm text-gray-500">Learning streak</p>
          </div>
        </div>
      </div>

      {/* Privacy Status Card */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-violet-600 text-xl">🔒</span>
          <div>
            <p className="font-medium text-violet-900">Privacy: All AI processing stays local</p>
            <p className="text-sm text-violet-600">✅ Offline Mode Active</p>
          </div>
        </div>
      </div>

      {/* Quick Overview Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-500">Badges Earned</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-500">Avg Progress</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <Link 
                href="/dashboard/projects"
                className="text-blue-600 hover:underline text-sm"
              >
                View all projects →
              </Link>
            </div>
            
            {/* TODO: Replace with ProjectList component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">📐</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Algebra Bot</h3>
                    <p className="text-sm text-gray-600">Mathematics • Last used 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">80%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard/projects/1"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open →
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">⚗️</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chemistry Lab</h3>
                    <p className="text-sm text-gray-600">Science • Last used yesterday</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">45%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-600 h-1.5 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard/projects/2"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open →
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">💻</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Python Tutor</h3>
                    <p className="text-sm text-gray-600">Programming • Last used 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-600">92%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard/projects/3"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/dashboard/projects/create"
                className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mr-2">➕</span>
                <span className="font-semibold text-gray-700">Create New Project</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            
            {/* TODO: Replace with activity feed component */}
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Solved quadratic equations</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Earned "Step Master" badge</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Started chemistry project</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">Completed Python basics</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
            
            <Link 
              href="/dashboard/progress"
              className="block text-center text-blue-600 hover:underline text-sm mt-4"
            >
              View full progress →
            </Link>
          </div>

          {/* Recent Badges */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Achievements</h2>
            
            {/* TODO: Replace with BadgeDisplay component */}
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl mr-3">⭐</span>
                <div>
                  <div className="font-semibold text-yellow-800">Step Master</div>
                  <div className="text-sm text-yellow-600">Solved 10 problems with guidance</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl mr-3">📐</span>
                <div>
                  <div className="font-semibold text-blue-800">Algebra Apprentice</div>
                  <div className="text-sm text-blue-600">Mastered basic algebra</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <div className="font-semibold text-green-800">Goal Crusher</div>
                  <div className="text-sm text-green-600">Completed project goals</div>
                </div>
              </div>
            </div>
            
            <Link 
              href="/dashboard/progress"
              className="block text-center text-blue-600 hover:underline text-sm mt-4"
            >
              View all badges →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link
                href="/dashboard/projects/create"
                className="flex items-center w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-3">➕</span>
                <span>Create New Project</span>
              </Link>
              
              <Link
                href="/dashboard/progress"
                className="flex items-center w-full p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="mr-3">📊</span>
                <span>View Progress</span>
              </Link>
              
              <Link
                href="/dashboard/settings"
                className="flex items-center w-full p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="mr-3">⚙️</span>
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week's Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Study Time</span>
              <span className="text-sm text-gray-600">8h 30m / 10h goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Almost there!</div>
          </div>
          
          {/* Problems Solved */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Problems Solved</span>
              <span className="text-sm text-gray-600">28 / 30 goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{width: '93%'}}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Great progress!</div>
          </div>
          
          {/* Learning Streak */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Learning Streak</span>
              <span className="text-sm text-gray-600">7 days</span>
            </div>
            <div className="flex space-x-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 h-2 bg-orange-500 rounded"></div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">Keep it up! 🔥</div>
          </div>
        </div>
      </div>
    </div>
  );
}