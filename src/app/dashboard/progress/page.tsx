// src\app\dashboard\progress\page.tsx
/**
 * Progress tracking and analytics page
 * Shows learning progress, badges, streaks, and detailed statistics
 * Located at: src/app/(dashboard)/progress/page.tsx
 * URL: /progress (route group doesn't affect URL)
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Progress - StemBot',
  description: 'Your learning progress and achievements',
};

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Learning Journey</h1>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            Share Progress
          </button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm">
            Generate Report
          </button>
        </div>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO: Replace with ProgressChart component */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📐</div>
              <div>
                <h3 className="font-semibold text-gray-900">Mathematics</h3>
                <p className="text-sm text-gray-600">12 topics</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">85%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{width: '85%'}}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>10 completed</span>
            <span>2 remaining</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚗️</div>
              <div>
                <h3 className="font-semibold text-gray-900">Science</h3>
                <p className="text-sm text-gray-600">8 topics</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">60%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300" 
              style={{width: '60%'}}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>5 completed</span>
            <span>3 remaining</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💻</div>
              <div>
                <h3 className="font-semibold text-gray-900">Programming</h3>
                <p className="text-sm text-gray-600">15 topics</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">92%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
              style={{width: '92%'}}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>14 completed</span>
            <span>1 remaining</span>
          </div>
        </div>
      </div>

      {/* Badge Collection */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Badge Collection</h2>
          <span className="text-sm text-gray-600">9 badges earned</span>
        </div>
        
        {/* TODO: Replace with BadgeDisplay component */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {/* Earned Badges */}
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-sm font-semibold text-yellow-800">Step Master</div>
            <div className="text-xs text-yellow-600">Problem solving</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl mb-2">📐</div>
            <div className="text-sm font-semibold text-blue-800">Algebra Pro</div>
            <div className="text-xs text-blue-600">Mathematics</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl mb-2">⚗️</div>
            <div className="text-sm font-semibold text-green-800">Lab Expert</div>
            <div className="text-xs text-green-600">Science</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-sm font-semibold text-orange-800">Week Streak</div>
            <div className="text-xs text-orange-600">7 day streak</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl mb-2">💻</div>
            <div className="text-sm font-semibold text-purple-800">Code Master</div>
            <div className="text-xs text-purple-600">Programming</div>
          </div>
          
          {/* Locked Badge Example */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-sm font-semibold text-gray-600">Rocket Scientist</div>
            <div className="text-xs text-gray-500">Complete 3 more labs</div>
          </div>
        </div>

        {/* Next Badge Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🚀</div>
              <div>
                <div className="font-semibold text-gray-900">Next Badge: Rocket Scientist</div>
                <div className="text-sm text-gray-600">Complete 3 more science labs</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">2 of 5 labs</div>
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '40%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Activity (Past 30 days)</h2>
          {/* TODO: Replace with actual chart component (Chart.js or Recharts) */}
          <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-center p-4">
            <div className="flex items-end space-x-1 h-full">
              {/* Sample activity bars */}
              {Array.from({length: 30}, (_, i) => (
                <div 
                  key={i}
                  className="bg-blue-400 w-2 rounded-t transition-all hover:bg-blue-600"
                  style={{height: `${Math.random() * 80 + 20}%`}}
                  title={`Day ${i + 1}`}
                ></div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Nov 15</span>
            <span>Dec 1</span>
            <span>Dec 15</span>
          </div>
        </div>

        {/* Topics Mastered */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics Mastered</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Linear Equations</span>
              </div>
              <div className="text-green-600 text-sm">✓ Mastered</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Graphing Functions</span>
              </div>
              <div className="text-green-600 text-sm">✓ Mastered</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Quadratic Equations</span>
              </div>
              <div className="text-yellow-600 text-sm">🔄 In Progress (78%)</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Calculus Basics</span>
              </div>
              <div className="text-gray-500 text-sm">⏸️ Not Started</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Advanced Integration</span>
              </div>
              <div className="text-gray-500 text-sm">🔒 Locked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Streaks */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Streaks</h2>
        {/* TODO: Replace with StreakTracker component */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">7</div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Current Streak</div>
            <div className="text-sm text-gray-600">Days in a row 🔥</div>
            <div className="mt-4">
              <div className="flex justify-center space-x-1">
                {Array.from({length: 7}, (_, i) => (
                  <div key={i} className="w-3 h-3 bg-orange-400 rounded-full"></div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">Keep it up!</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">23</div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Longest Streak</div>
            <div className="text-sm text-gray-600">Personal record 🏆</div>
            <div className="mt-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-sm text-yellow-800">
                  Set in November 2024
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Amazing dedication!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">47h</div>
            <div className="text-sm text-gray-600">Total Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">234</div>
            <div className="text-sm text-gray-600">Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">18</div>
            <div className="text-sm text-gray-600">Projects Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl mr-4">🏆</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Badge Earned: Step Master</div>
              <div className="text-sm text-gray-600">Solved 10 problems with step-by-step guidance</div>
            </div>
            <div className="text-sm text-gray-500">2 hours ago</div>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mr-4">✅</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Topic Mastered: Linear Equations</div>
              <div className="text-sm text-gray-600">Completed all exercises with 95% accuracy</div>
            </div>
            <div className="text-sm text-gray-500">Yesterday</div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mr-4">🔥</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">7-Day Streak Achieved</div>
              <div className="text-sm text-gray-600">Studied every day this week</div>
            </div>
            <div className="text-sm text-gray-500">3 days ago</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Link 
          href="/dashboard/dashboard" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
        <button className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
          Export Progress Report
        </button>
      </div>
    </div>
  );
}