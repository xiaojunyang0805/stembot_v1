// =============================================================================
// INDIVIDUAL REPORT VIEW PAGE
// =============================================================================

// src/app/(educator)/reports/[id]/page.tsx
/**
 * Individual report view page
 * Displays detailed report with charts, data, and export options
 * Located at: src/app/(educator)/reports/[id]/page.tsx
 * URL: /reports/[id]
 */

import type { Metadata } from 'next';
import Link from 'next/link';

interface ReportViewProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Report Details - StemBot Educator',
  description: 'View detailed report analysis and insights',
};

export default function ReportViewPage({ params }: ReportViewProps) {
  const { id } = params;

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link 
              href="/educator/reports"
              className="text-gray-600 hover:text-gray-800 mr-3"
            >
              ← Back to Reports
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Q2 Mathematics Progress Report</h1>
              <p className="text-gray-600">Class 8B • Generated on December 15, 2024</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              📄 Export PDF
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              📊 Export Excel
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              📧 Share Report
            </button>
          </div>
        </div>
        
        {/* Report Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Report Type</div>
            <div className="font-semibold text-gray-900">Progress Report</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Time Period</div>
            <div className="font-semibold text-gray-900">Oct 1 - Dec 15, 2024</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Students Included</div>
            <div className="font-semibold text-gray-900">28 students</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Subject Focus</div>
            <div className="font-semibold text-gray-900">Mathematics</div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">73%</div>
            <div className="text-sm text-gray-600">Average Class Progress</div>
            <div className="text-xs text-green-600">↑ 8% from Q1</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
            <div className="text-sm text-gray-600">Active Engagement Rate</div>
            <div className="text-xs text-blue-600">↑ 12% from Q1</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
            <div className="text-sm text-gray-600">Avg. Problems Solved/Student</div>
            <div className="text-xs text-purple-600">↑ 23% from Q1</div>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700">
            Class 8B has shown remarkable improvement in mathematics comprehension and engagement during Q2. 
            The implementation of AI-assisted tutoring has resulted in a significant increase in problem-solving 
            confidence and conceptual understanding across all major topics.
          </p>
          
          <h4 className="font-semibold text-gray-900 mt-4 mb-2">Key Achievements:</h4>
          <ul className="text-gray-700 space-y-1">
            <li>• 85% of students achieved mastery in linear equations</li>
            <li>• Average study time increased to 3.2 hours per week</li>
            <li>• 92% of students report increased confidence in mathematics</li>
            <li>• Zero students requiring additional intervention support</li>
          </ul>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h3>
          
          {/* TODO: Replace with actual Chart.js or Recharts component */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-4xl text-gray-400 mb-2">📈</div>
              <p className="text-gray-600">Progress Chart</p>
              <p className="text-sm text-gray-500">Chart.js integration pending</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Shows steady improvement across all students with notable acceleration in weeks 8-10.</p>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Mastery Distribution</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Linear Equations</span>
                <span className="text-green-600">85% mastery</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Quadratic Equations</span>
                <span className="text-yellow-600">68% mastery</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Graphing Functions</span>
                <span className="text-blue-600">72% mastery</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Factoring</span>
                <span className="text-orange-600">59% mastery</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{width: '59%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Word Problems</span>
                <span className="text-red-600">45% mastery</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Recommendation:</strong> Focus additional practice on word problems and factoring techniques.
            </p>
          </div>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Individual Student Performance</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Overall Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Engagement</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Problems Solved</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Badges Earned</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">Emma K.</div>
                  <div className="text-sm text-gray-600">Student ID: 8B001</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">92%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    High
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">187</td>
                <td className="py-3 px-4 text-gray-600">12</td>
                <td className="py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Excellent
                  </span>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">Alex M.</div>
                  <div className="text-sm text-gray-600">Student ID: 8B002</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">85%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    High
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">164</td>
                <td className="py-3 px-4 text-gray-600">9</td>
                <td className="py-3 px-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Good
                  </span>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">Sam R.</div>
                  <div className="text-sm text-gray-600">Student ID: 8B003</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm font-semibold text-yellow-600">45%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    Medium
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">89</td>
                <td className="py-3 px-4 text-gray-600">3</td>
                <td className="py-3 px-4">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    Needs Support
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-purple-600 hover:underline text-sm">
            View Complete Student List (28 students) →
          </button>
        </div>
      </div>

      {/* AI Tutoring Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Tutoring Effectiveness</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Most Effective AI Interactions</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Step-by-step problem solving</div>
                <div className="text-sm text-green-700">94% success rate in concept mastery</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">Socratic questioning method</div>
                <div className="text-sm text-blue-700">87% improvement in critical thinking</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-900">Error correction guidance</div>
                <div className="text-sm text-purple-700">79% reduction in repeated mistakes</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-900">Complex word problems</div>
                <div className="text-sm text-orange-700">Students request more scaffolding</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="font-medium text-red-900">Multi-step factoring</div>
                <div className="text-sm text-red-700">Higher hint usage indicates difficulty</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-900">Graph interpretation</div>
                <div className="text-sm text-yellow-700">Visual learning tools needed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations & Next Steps</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Immediate Actions</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span>Provide additional support for Sam R. and 3 other students showing 45% progress</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2 mt-1">•</span>
                <span>Introduce visual aids for graphing functions and word problem strategies</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">•</span>
                <span>Schedule parent conferences for students requiring additional support</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Long-term Strategies</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span>Continue emphasis on step-by-step problem solving methodology</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span>Integrate more real-world applications to improve word problem skills</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2 mt-1">•</span>
                <span>Prepare for advanced topics: polynomials and rational functions in Q3</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-violet-50 rounded-xl p-6 border border-violet-200">
        <div className="flex items-start">
          <div className="text-violet-600 mr-3 mt-1 text-lg">🔒</div>
          <div>
            <h3 className="font-semibold text-violet-900 mb-2">Student Privacy Protection</h3>
            <div className="text-sm text-violet-800 space-y-1">
              <p>• All student conversation data remains local and private</p>
              <p>• Only anonymized performance metrics are included in this report</p>
              <p>• Individual student data can only be accessed by authorized educators</p>
              <p>• Report sharing maintains student confidentiality standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}