// =============================================================================
// REPORTS LISTING PAGE
// =============================================================================

// src/app/(educator)/reports/page.tsx
/**
 * Reports listing and generation page
 * Allows educators to create, view, and manage various student reports
 * Located at: src/app/(educator)/reports/page.tsx
 * URL: /reports
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reports - StemBot Educator',
  description: 'Generate and manage student progress reports',
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate insights and track student progress across your classes</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Generate New Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">28</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">73%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <span className="text-yellow-600 text-xl">📝</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">Reports Generated</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">19</div>
              <div className="text-sm text-gray-600">Active Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Reports</h3>
          <p className="text-gray-600 mb-4">
            Detailed analysis of individual or class progress across subjects and time periods.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li>• Individual student progress</li>
            <li>• Class-wide performance</li>
            <li>• Subject-specific insights</li>
            <li>• Time-based trends</li>
          </ul>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Generate Progress Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Class Analytics</h3>
          <p className="text-gray-600 mb-4">
            Comprehensive overview of class performance, engagement, and learning patterns.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li>• Class engagement metrics</li>
            <li>• Learning pattern analysis</li>
            <li>• Difficulty area identification</li>
            <li>• Comparative performance</li>
          </ul>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Generate Class Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Insights</h3>
          <p className="text-gray-600 mb-4">
            Deep dive into learning effectiveness, AI interaction patterns, and outcomes.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li>• AI tutoring effectiveness</li>
            <li>• Question-answer patterns</li>
            <li>• Concept mastery tracking</li>
            <li>• Intervention recommendations</li>
          </ul>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
            Generate Insights Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Parent Reports</h3>
          <p className="text-gray-600 mb-4">
            Student-friendly reports designed for sharing with parents and guardians.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li>• Parent-friendly language</li>
            <li>• Achievement highlights</li>
            <li>• Areas for improvement</li>
            <li>• Home support suggestions</li>
          </ul>
          <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
            Generate Parent Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Reports</h3>
          <p className="text-gray-600 mb-4">
            Evaluation of student understanding and mastery of specific topics and skills.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li>• Skill mastery assessment</li>
            <li>• Knowledge gap analysis</li>
            <li>• Learning objective tracking</li>
            <li>• Curriculum alignment</li>
          </ul>
          <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">
            Generate Assessment Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
          <p className="text-gray-600 mb-4">
            Create tailored reports with specific metrics, time periods, and focus areas.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li>• Custom date ranges</li>
            <li>• Specific metrics selection</li>
            <li>• Multiple export formats</li>
            <li>• Automated scheduling</li>
          </ul>
          <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
            Create Custom Report
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          <Link href="/educator/reports" className="text-purple-600 hover:underline text-sm">
            View All Reports →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Report Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date Generated</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Students</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">Q2 Mathematics Progress</div>
                  <div className="text-sm text-gray-600">Class 8B comprehensive review</div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Progress Report
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">Dec 15, 2024</td>
                <td className="py-3 px-4 text-gray-600">28 students</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link 
                      href="/educator/reports/1" 
                      className="text-purple-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                    <button className="text-gray-600 hover:underline text-sm">
                      Download
                    </button>
                    <button className="text-gray-600 hover:underline text-sm">
                      Share
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">Parent Conference Reports</div>
                  <div className="text-sm text-gray-600">Individual student summaries</div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    Parent Report
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">Dec 12, 2024</td>
                <td className="py-3 px-4 text-gray-600">28 students</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link 
                      href="/educator/reports/2" 
                      className="text-purple-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                    <button className="text-gray-600 hover:underline text-sm">
                      Download
                    </button>
                    <button className="text-gray-600 hover:underline text-sm">
                      Share
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">AI Tutoring Effectiveness</div>
                  <div className="text-sm text-gray-600">Learning pattern analysis</div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    Insights Report
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">Dec 10, 2024</td>
                <td className="py-3 px-4 text-gray-600">Class-wide</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link 
                      href="/educator/reports/3" 
                      className="text-purple-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                    <button className="text-gray-600 hover:underline text-sm">
                      Download
                    </button>
                    <button className="text-gray-600 hover:underline text-sm">
                      Share
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export & Sharing Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-semibold text-gray-900 mb-1">PDF Reports</h3>
            <p className="text-sm text-gray-600">Professional formatted reports for printing and sharing</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Excel Exports</h3>
            <p className="text-sm text-gray-600">Raw data exports for further analysis and record keeping</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Email Sharing</h3>
            <p className="text-sm text-gray-600">Direct email delivery to parents, administrators, or colleagues</p>
          </div>
        </div>
      </div>
    </div>
  );
}