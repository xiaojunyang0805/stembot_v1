/**
 * Educator Lesson Plans Page
 * 
 * Lesson plan management interface for educators to create, organize, and manage
 * curriculum-aligned lesson plans with AI assistance.
 * Features: Lesson plan library, search/filter, curriculum alignment, sharing options.
 * 
 * Location: src/app/(educator)/educator/lesson-plans/page.tsx
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';

// UI Components (to be implemented in WP2/WP3)
// import { LessonPlanCard } from '@/components/educator/LessonPlanCard';
// import { LessonPlanFilter } from '@/components/educator/LessonPlanFilter';
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Types
interface LessonPlan {
  id: string;
  title: string;
  subject: 'math' | 'science' | 'coding';
  gradeLevel: string;
  duration: number; // in minutes
  objectives: string[];
  materials: string[];
  activities: string[];
  assessments: string[];
  curriculumStandards: string[];
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  aiGenerated: boolean;
  tags: string[];
}

interface EducatorLessonPlansPageProps {
  searchParams: {
    subject?: 'math' | 'science' | 'coding' | 'all';
    grade?: string;
    curriculum?: string;
    search?: string;
    sort?: 'recent' | 'popular' | 'title' | 'grade';
    filter?: 'all' | 'my-plans' | 'shared' | 'ai-generated';
  };
}

// Metadata for SEO and page info
export const metadata: Metadata = {
  title: 'Lesson Plans - StemBot Educator',
  description: 'Create, manage, and organize curriculum-aligned lesson plans with AI assistance for STEM education.',
  keywords: ['lesson plans', 'curriculum', 'STEM education', 'teaching resources', 'AI-generated lessons'],
};

/**
 * Educator Lesson Plans Page Component
 * 
 * Provides lesson plan management including:
 * - Browse and search lesson plan library
 * - Create new lesson plans manually or with AI
 * - Organize plans by subject, grade, and curriculum
 * - Share plans with other educators
 * - Track usage and effectiveness
 */
export default async function EducatorLessonPlansPage({
  searchParams
}: EducatorLessonPlansPageProps) {
  // Extract search parameters with defaults
  const {
    subject = 'all',
    grade,
    curriculum,
    search,
    sort = 'recent',
    filter = 'all'
  } = searchParams;

  // TODO: Implement in WP5 - Fetch lesson plans data
  // const lessonPlans = await getLessonPlans({
  //   subject: subject === 'all' ? undefined : subject,
  //   grade,
  //   curriculum,
  //   search,
  //   sort,
  //   filter
  // });

  // TODO: Implement in WP5 - Fetch curriculum standards
  // const curriculumStandards = await getCurriculumStandards();
  // const subjects = await getSubjects();

  // Mock data for development
  const mockLessonPlans: LessonPlan[] = [
    {
      id: '1',
      title: 'Introduction to Algebraic Equations',
      subject: 'math',
      gradeLevel: '8th Grade',
      duration: 45,
      objectives: ['Understand basic algebraic concepts', 'Solve simple equations'],
      materials: ['Whiteboard', 'Calculator', 'Worksheets'],
      activities: ['Interactive problem solving', 'Group work', 'Individual practice'],
      assessments: ['Exit ticket', 'Homework assignment'],
      curriculumStandards: ['8.EE.A.1', '8.EE.A.2'],
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15'),
      isShared: true,
      aiGenerated: false,
      tags: ['algebra', 'equations', 'problem-solving']
    },
    {
      id: '2',
      title: 'Python Basics: Variables and Data Types',
      subject: 'coding',
      gradeLevel: '9th Grade',
      duration: 60,
      objectives: ['Understand Python variables', 'Work with different data types'],
      materials: ['Computers', 'Python IDE', 'Code examples'],
      activities: ['Live coding demonstration', 'Hands-on practice', 'Debugging exercises'],
      assessments: ['Coding quiz', 'Project assignment'],
      curriculumStandards: ['CS.1A', 'CS.2B'],
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-12'),
      isShared: false,
      aiGenerated: true,
      tags: ['python', 'programming', 'variables', 'data-types']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lesson Plans
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create and manage curriculum-aligned lesson plans
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                href="/educator/lesson-plans/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                AI Generate Plan
              </Link>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Create New Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* TODO: Replace with actual search icon in WP1 */}
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                  placeholder="Search lesson plans..."
                  defaultValue={search}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-3">
              <select className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                <option value="all">All Subjects</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="coding">Coding</option>
              </select>
              
              <select className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                <option value="">All Grades</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>
              
              <select className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
                <option value="grade">Grade Level</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            {/* TODO: Replace with actual LoadingSpinner component in WP1 */}
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          
          {/* Filter Tags */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filters:</span>
              <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                All Plans
                <button className="ml-1 inline-flex items-center p-0.5 text-blue-400 hover:bg-blue-200 hover:text-blue-600 rounded-full">
                  ×
                </button>
              </button>
            </div>
          </div>

          {/* Lesson Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLessonPlans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.subject === 'math' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        plan.subject === 'science' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      }`}>
                        {plan.subject.charAt(0).toUpperCase() + plan.subject.slice(1)}
                      </span>
                      {plan.aiGenerated && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          AI Generated
                        </span>
                      )}
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {/* TODO: Replace with actual menu icon in WP1 */}
                        <div className="w-5 h-5 bg-gray-400 rounded"></div>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>{plan.gradeLevel}</span>
                    <span className="mx-2">•</span>
                    <span>{plan.duration} min</span>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="px-6 pb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <p className="font-medium mb-1">Learning Objectives:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {plan.objectives.slice(0, 2).map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plan.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {plan.updatedAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        View
                      </button>
                      <button className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">
                        Edit
                      </button>
                      {plan.isShared && (
                        <span className="text-xs text-green-600 dark:text-green-400">Shared</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {mockLessonPlans.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {/* TODO: Replace with actual empty state icon in WP1 */}
                <div className="w-12 h-12 bg-gray-400 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No lesson plans found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating your first lesson plan or using AI to generate one.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  href="/educator/lesson-plans/generate"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Generate with AI
                </Link>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Create Manually
                </button>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Loading component for the lesson plans page
 */
export function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

/**
 * Error component for the lesson plans page
 */
export function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Lesson Plans Error
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Failed to load lesson plans
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}