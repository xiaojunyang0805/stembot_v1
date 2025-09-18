// src\app\dashboard\projects\[id]\page.tsx
/**
 * Individual project page with tutoring interface
 * Main chat interface for AI tutoring and project interaction
 * Located at: src/app/(dashboard)/projects/[id]/page.tsx
 * URL: /projects/[id] (route group doesn't affect URL)
 */

import type { Metadata } from 'next';
import Link from 'next/link';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Project - StemBot',
  description: 'AI tutoring interface for your STEM project',
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Project Sidebar - Desktop Only */}
      <div className="hidden lg:block w-1/3 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
        {/* Project Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link 
                href="/dashboard/projects"
                className="text-gray-600 hover:text-gray-800 mr-3"
              >
                ←
              </Link>
              <h1 className="text-xl font-semibold flex items-center">
                <span className="text-2xl mr-2">📐</span>
                Algebra Bot
              </h1>
            </div>
            <div className="flex space-x-2">
              <Link 
                href={`/dashboard/projects/${id}/share`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share project"
              >
                📤
              </Link>
              <Link 
                href={`/dashboard/projects/${id}/settings`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Project settings"
              >
                ⚙️
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-600">Mathematics • Created 5 days ago</p>
        </div>

        {/* Project Overview */}
        <div className="space-y-6">
          {/* Learning Goals */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span> Goals
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">•</span>
                Master quadratic equations
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                Understand factoring methods
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2 mt-0.5">•</span>
                Apply to real-world problems
              </li>
            </ul>
          </div>

          {/* Progress Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📊</span> Progress
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-semibold text-blue-600">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{width: '80%'}}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-semibold text-green-700">24</div>
                  <div className="text-green-600">Solved</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-semibold text-blue-700">3h</div>
                  <div className="text-blue-600">Study Time</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-semibold text-purple-700">12</div>
                  <div className="text-purple-600">Hints Used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🏆</span> Badges Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200">
                ⭐ Step Master
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full border border-blue-200">
                📐 Algebra Apprentice
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full border border-green-200">
                🎯 Goal Crusher
              </div>
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📚</span> Topics Covered
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <span className="text-green-800">Linear equations</span>
                <span className="text-green-600 text-xs">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <span className="text-green-800">Graphing functions</span>
                <span className="text-green-600 text-xs">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <span className="text-yellow-800">Quadratic equations</span>
                <span className="text-yellow-600 text-xs">🔄 80% done</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Polynomial functions</span>
                <span className="text-gray-500 text-xs">⏸️ Locked</span>
              </div>
            </div>
          </div>

          {/* Context from Previous Session */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💡</span> Context from Last Session
            </h3>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                "Working on factoring quadratic expressions. Last solved: 2x² + 5x - 3 = 0"
              </p>
              <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
            </div>
          </div>

          {/* Session Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📋</span> Current Session
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="text-gray-800">2:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions asked:</span>
                <span className="text-gray-800">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hints used:</span>
                <span className="text-gray-800">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Problems solved:</span>
                <span className="text-green-600 font-semibold">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Project Header - Mobile Only */}
      <div className="lg:hidden w-full mb-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/dashboard/projects"
                className="text-gray-600 hover:text-gray-800 mr-3"
              >
                ←
              </Link>
              <h1 className="text-lg font-semibold flex items-center">
                <span className="text-xl mr-2">📐</span>
                Algebra Bot
              </h1>
            </div>
            <button className="text-gray-600 hover:text-gray-800">
              ⋯
            </button>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>80% complete</span>
              <span>⭐⭐ 2 badges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col min-h-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center">
                <span className="mr-2">🤖</span>
                Chat with your AI Tutor
              </h2>
              <p className="text-sm text-gray-600">Ready to help with your math problems</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Local AI Active
              </div>
            </div>
          </div>
        </div>

        {/* TODO: Replace with ChatInterface component */}
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* AI Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-gray-800">
                  Hi! I'm ready to help with your algebra project. I see you've been working on quadratic equations. 
                  What problem would you like to tackle today?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded">
                    Continue with quadratics
                  </button>
                  <button className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded">
                    Review factoring
                  </button>
                  <button className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded">
                    New topic
                  </button>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">AI Tutor • Just now</span>
            </div>
          </div>
          
          {/* User Message */}
          <div className="flex items-start space-x-3 justify-end">
            <div className="flex-1 max-w-xs">
              <div className="bg-blue-600 text-white rounded-lg p-3">
                <p className="text-sm">
                  I need help solving 3x² - 12x + 9 = 0. Can you guide me step by step?
                </p>
              </div>
              <span className="text-xs text-gray-500 mt-1 block text-right">You • 2 min ago</span>
            </div>
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm text-white">👤</span>
            </div>
          </div>
          
          {/* AI Response with Step-by-Step */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-gray-800 mb-3">
                  Great! Let's solve 3x² - 12x + 9 = 0 step by step. I'll guide you through it.
                </p>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                      <span className="font-medium text-sm">First, let's factor out the common factor</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-8">
                      What's the greatest common factor of 3, 12, and 9?
                    </p>
                    <div className="ml-8 mt-2">
                      <button className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded mr-2">3</button>
                      <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded mr-2">6</button>
                      <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">9</button>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">AI Tutor • 1 min ago</span>
            </div>
          </div>

          {/* User Response */}
          <div className="flex items-start space-x-3 justify-end">
            <div className="flex-1 max-w-xs">
              <div className="bg-blue-600 text-white rounded-lg p-3">
                <p className="text-sm">The GCF is 3, so: 3(x² - 4x + 3) = 0</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 block text-right">You • 30 sec ago</span>
            </div>
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm text-white">👤</span>
            </div>
          </div>

          {/* Badge Earned Popup */}
          <div className="mx-auto max-w-sm">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-semibold text-yellow-800 mb-1">Badge Earned!</div>
              <div className="text-sm text-yellow-700">Step Master - Solved 10 problems with guidance</div>
              <button className="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded">
                View Progress
              </button>
            </div>
          </div>

          {/* AI Confirmation */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-gray-800 mb-3">
                  🎉 Excellent! You correctly factored out 3. Now we have x² - 4x + 3 = 0.
                </p>
                
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                    <span className="font-medium text-sm">Now let's factor the quadratic</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-8">
                    Find two numbers that multiply to 3 and add to -4. What do you think?
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">AI Tutor • Just now</span>
            </div>
          </div>
        </div>

        {/* TODO: Replace with MessageInput component */}
        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Type your question or answer..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
              <span className="sr-only">Send message</span>
              📤
            </button>
            <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <span className="sr-only">Voice input</span>
              🎤
            </button>
            <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <span className="sr-only">Attach file</span>
              📎
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
              I need a hint
            </button>
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
              Show me the solution
            </button>
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
              Explain this step
            </button>
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
              Try another problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}