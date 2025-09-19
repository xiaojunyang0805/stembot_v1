/**
 * Individual Student Progress Page
 * 
 * Detailed view of an individual student's progress, performance, and learning analytics.
 * Features: Progress charts, session history, performance metrics, intervention tools.
 * 
 * Location: src/app/(educator)/educator/students/[id]/page.tsx
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
// import { notFound } from 'next/navigation';
import Link from 'next/link';

// UI Components (to be implemented in WP2/WP3)
// import { StudentProgressChart } from '@/components/educator/StudentProgressChart';
// import { SessionHistory } from '@/components/educator/SessionHistory';
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Types
interface StudentDetail {
  id: string;
  name: string;
  email: string;
  grade: string;
  class: string;
  joinedAt: Date;
  lastActive: Date;
  avatar?: string;
  
  progress: {
    overall: number;
    math: number;
    science: number;
    coding: number;
    trend: 'up' | 'down' | 'stable';
    weeklyChange: number;
  };
  
  engagement: {
    totalSessions: number;
    sessionsThisWeek: number;
    averageSessionTime: number;
    longestStreak: number;
    currentStreak: number;
    preferredTimes: string[];
  };
  
  performance: {
    accuracy: number;
    completionRate: number;
    helpRequests: number;
    conceptsMastered: number;
    totalConcepts: number;
    strongestSubject: string;
    strugglingAreas: string[];
  };
  
  recentSessions: Array<{
    id: string;
    date: Date;
    duration: number;
    subject: string;
    topics: string[];
    progress: number;
    accuracy: number;
    helpRequests: number;
  }>;
  
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: Date;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    deadline: Date;
    status: 'in-progress' | 'completed' | 'overdue';
  }>;
  
  interventions: Array<{
    id: string;
    type: 'recommendation' | 'alert' | 'suggestion';
    message: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    resolved: boolean;
  }>;
}

interface IndividualStudentPageProps {
  params: {
    id: string;
  };
  searchParams: {
    tab?: 'overview' | 'progress' | 'sessions' | 'performance' | 'goals';
    timeframe?: 'week' | 'month' | 'semester';
  };
}

// Generate metadata based on student ID
export async function generateMetadata({ }: { params: { id: string } }): Promise<Metadata> {
  // TODO: Implement in WP5 - Fetch student name
  // const student = await getStudent(params.id);
  
  return {
    title: `Student Progress - StemBot Educator`,
    description: 'Detailed student progress tracking and performance analytics.',
    keywords: ['student progress', 'learning analytics', 'performance tracking', 'STEM education'],
  };
}

/**
 * Individual Student Progress Page Component
 * 
 * Provides comprehensive individual student view including:
 * - Detailed progress tracking and analytics
 * - Session history and engagement metrics
 * - Performance analysis and insights
 * - Goal setting and tracking
 * - Intervention recommendations
 */
export default async function IndividualStudentPage({
  params,
  searchParams
}: IndividualStudentPageProps) {
  const { id } = params;
  const { tab = 'overview', timeframe = 'month' } = searchParams;

  // Mark as used to satisfy TypeScript
  void tab;
  void timeframe;

  // TODO: Implement in WP5 - Fetch student data
  // const student = await getStudentDetail(id);
  // if (!student) {
  //   notFound();
  // }

  // Mock data for development
  const mockStudent: StudentDetail = {
    id: id,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    grade: '8th Grade',
    class: '8A',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date('2024-03-15T10:30:00'),
    
    progress: {
      overall: 95,
      math: 98,
      science: 92,
      coding: 95,
      trend: 'up',
      weeklyChange: 5.2
    },
    
    engagement: {
      totalSessions: 156,
      sessionsThisWeek: 12,
      averageSessionTime: 45,
      longestStreak: 28,
      currentStreak: 12,
      preferredTimes: ['14:00-15:00', '19:00-20:00']
    },
    
    performance: {
      accuracy: 88,
      completionRate: 95,
      helpRequests: 23,
      conceptsMastered: 47,
      totalConcepts: 52,
      strongestSubject: 'Mathematics',
      strugglingAreas: ['Complex Equations', 'Word Problems']
    },
    
    recentSessions: [
      {
        id: '1',
        date: new Date('2024-03-15T10:30:00'),
        duration: 52,
        subject: 'Math',
        topics: ['Algebraic Equations', 'Problem Solving'],
        progress: 15,
        accuracy: 92,
        helpRequests: 1
      },
      {
        id: '2',
        date: new Date('2024-03-14T15:20:00'),
        duration: 38,
        subject: 'Science',
        topics: ['Chemical Reactions', 'Periodic Table'],
        progress: 12,
        accuracy: 85,
        helpRequests: 3
      }
    ],
    
    badges: [
      {
        id: '1',
        name: 'Algebra Master',
        description: 'Completed all algebra fundamentals',
        earnedAt: new Date('2024-03-10'),
        rarity: 'epic'
      },
      {
        id: '2',
        name: 'Streak Champion',
        description: '7-day learning streak',
        earnedAt: new Date('2024-03-05'),
        rarity: 'rare'
      }
    ],
    
    goals: [
      {
        id: '1',
        title: 'Master Linear Equations',
        target: 100,
        current: 85,
        deadline: new Date('2024-04-01'),
        status: 'in-progress'
      }
    ],
    
    interventions: [
      {
        id: '1',
        type: 'recommendation',
        message: 'Consider additional practice with word problems based on recent session patterns',
        priority: 'medium',
        createdAt: new Date('2024-03-12'),
        resolved: false
      }
    ]
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'progress', name: 'Progress' },
    { id: 'sessions', name: 'Sessions' },
    { id: 'performance', name: 'Performance' },
    { id: 'goals', name: 'Goals' }
  ];

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300';
      case 'epic': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300';
      case 'rare': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Back Button */}
              <Link href="/educator/students" className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <div className="w-5 h-5 bg-gray-400 rounded"></div>
              </Link>
              
              {/* Student Info */}
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                    {mockStudent.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockStudent.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {mockStudent.grade} • {mockStudent.class} • Last active: {mockStudent.lastActive.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Message Student
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Set Goal
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {tabs.map((tabItem) => (
                <Link
                  key={tabItem.id}
                  href={`/educator/students/${id}?tab=${tabItem.id}`}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    tab === tabItem.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tabItem.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Main Metrics */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Progress Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Progress Overview
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{mockStudent.progress.overall}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${mockStudent.progress.overall}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        +{mockStudent.progress.weeklyChange}% this week
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Mathematics</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{mockStudent.progress.math}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Science</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{mockStudent.progress.science}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Coding</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{mockStudent.progress.coding}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Learning Sessions
                  </h3>
                  <div className="space-y-4">
                    {mockStudent.recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.subject === 'Math' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                              session.subject === 'Science' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                              'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                            }`}>
                              {session.subject}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {session.date.toLocaleDateString()} • {session.duration}min
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                            Topics: {session.topics.join(', ')}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                            <span>{session.progress}% progress</span>
                            <span>{session.accuracy}% accuracy</span>
                            <span>{session.helpRequests} help requests</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar Info */}
              <div className="space-y-6">
                
                {/* Key Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Key Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Total Sessions</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{mockStudent.engagement.totalSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Current Streak</span>
                      <span className="text-lg font-semibold text-orange-600">{mockStudent.engagement.currentStreak} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Avg Session Time</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{mockStudent.engagement.averageSessionTime}min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Concepts Mastered</span>
                      <span className="text-lg font-semibold text-green-600">{mockStudent.performance.conceptsMastered}/{mockStudent.performance.totalConcepts}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Badges */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Achievements
                  </h3>
                  <div className="space-y-3">
                    {mockStudent.badges.map((badge) => (
                      <div key={badge.id} className={`p-3 border rounded-lg ${getBadgeColor(badge.rarity)}`}>
                        <div className="font-medium text-sm mb-1">{badge.name}</div>
                        <div className="text-xs opacity-80">{badge.description}</div>
                        <div className="text-xs mt-1">Earned {badge.earnedAt.toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    AI Recommendations
                  </h3>
                  <div className="space-y-3">
                    {mockStudent.interventions.filter(i => !i.resolved).map((intervention) => (
                      <div key={intervention.id} className={`p-3 rounded-lg ${
                        intervention.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                        intervention.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                        'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {intervention.message}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            intervention.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            intervention.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {intervention.priority} priority
                          </span>
                          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'progress' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Detailed Progress Analytics
              </h3>
              {/* TODO: Implement detailed progress charts in WP6 */}
              <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Progress Analytics Chart</p>
              </div>
            </div>
          )}

          {tab === 'sessions' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Session History
              </h3>
              {/* TODO: Implement detailed session history in WP5 */}
              <div className="space-y-4">
                {mockStudent.recentSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          session.subject === 'Math' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          session.subject === 'Science' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        }`}>
                          {session.subject}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {session.date.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {session.duration} minutes
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Topics Covered</div>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {session.topics.join(', ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Progress Made</div>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {session.progress}% completion
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Performance</div>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {session.accuracy}% accuracy, {session.helpRequests} help requests
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Accuracy Rate</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{mockStudent.performance.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${mockStudent.performance.accuracy}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{mockStudent.performance.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${mockStudent.performance.completionRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Areas of Focus
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Strongest Subject
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {mockStudent.performance.strongestSubject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Areas Needing Support
                    </div>
                    <div className="space-y-1">
                      {mockStudent.performance.strugglingAreas.map((area, index) => (
                        <div key={index} className="text-sm text-orange-600 dark:text-orange-400">
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'goals' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Learning Goals
                </h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Add New Goal
                </button>
              </div>
              
              <div className="space-y-4">
                {mockStudent.goals.map((goal) => (
                  <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {goal.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        goal.status === 'overdue' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {goal.status === 'in-progress' ? 'In Progress' : goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.current}% / {goal.target}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Deadline: {goal.deadline.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

