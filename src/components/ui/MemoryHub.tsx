/**
 * Memory Hub Component
 *
 * Central dashboard for research mentoring with memory-driven features.
 * Provides intelligent resume functionality and context-aware guidance.
 *
 * Features:
 * - "Resume where you left off" functionality
 * - Project status with memory hints
 * - Recent context recall and suggestions
 * - Academic progress visualization
 * - Memory-driven next steps
 *
 * @location src/components/ui/MemoryHub.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  ArrowRight,
  Play,
  Lightbulb,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * Memory context interface
 */
export interface MemoryContext {
  id: string;
  projectId: string;
  timestamp: Date;
  context: string;
  insights: string[];
  confidence: number;
  relatedMemories: string[];
}

/**
 * Recent activity interface
 */
export interface RecentActivity {
  id: string;
  type: 'research' | 'writing' | 'literature' | 'methodology';
  title: string;
  description: string;
  timestamp: Date;
  memoryHints: string[];
}

/**
 * Progress insight interface
 */
export interface ProgressInsight {
  id: string;
  type: 'productivity' | 'knowledge_gap' | 'optimization' | 'milestone';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
}

/**
 * Props for the MemoryHub component
 */
export interface MemoryHubProps {
  userId: string;
  currentProject?: {
    id: string;
    title: string;
    phase: string;
    progress: number;
    lastActivity: Date;
  };
  memoryContexts: MemoryContext[];
  recentActivities: RecentActivity[];
  progressInsights: ProgressInsight[];
  onResumeProject?: (projectId: string, context: MemoryContext) => void;
  onViewProject?: (projectId: string) => void;
  className?: string;
}

/**
 * MemoryHub component for intelligent research dashboard
 */
export const MemoryHub: React.FC<MemoryHubProps> = ({
  userId,
  currentProject,
  memoryContexts,
  recentActivities,
  progressInsights,
  onResumeProject,
  onViewProject,
  className,
}) => {
  const [selectedContext, setSelectedContext] = useState<MemoryContext | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const getGreeting = () => {
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    };
    return greetings[timeOfDay];
  };

  const getResumeContext = () => {
    if (!currentProject || memoryContexts.length === 0) return null;

    // Find the most recent high-confidence context
    return memoryContexts
      .filter(ctx => ctx.projectId === currentProject.id && ctx.confidence > 0.7)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  };

  const resumeContext = getResumeContext();
  const highImpactInsights = progressInsights.filter(insight => insight.impact === 'high');

  return (
    <div className={`academic-container ${className}`}>
      {/* Welcome Header */}
      <div className="mb-academic">
        <h1 className="academic-heading-primary">
          {getGreeting()}, welcome back to your research
        </h1>
        <p className="academic-body-lead text-academic-secondary">
          Continue your academic journey with AI-powered memory assistance
        </p>
      </div>

      {/* Resume Section */}
      {resumeContext && currentProject && (
        <div className="academic-research-card mb-academic">
          <div className="academic-flex-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-memory-purple rounded-lg">
                <Brain className="h-5 w-5 text-memory-purple" />
              </div>
              <div>
                <h2 className="academic-heading-section mb-1">Resume where you left off</h2>
                <p className="text-sm text-academic-muted">
                  Based on your recent research context
                </p>
              </div>
            </div>
            <button
              onClick={() => onResumeProject?.(currentProject.id, resumeContext)}
              className="academic-btn-primary flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Continue Research
            </button>
          </div>

          <div className="bg-academic-primary p-4 rounded-lg mb-4">
            <h3 className="font-medium text-academic-primary mb-2">
              {currentProject.title}
            </h3>
            <p className="academic-body-text text-sm mb-3">
              {resumeContext.context}
            </p>

            {resumeContext.insights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resumeContext.insights.slice(0, 3).map((insight, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-memory-purple text-xs rounded-full"
                  >
                    {insight}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-academic-muted">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Last active {resumeContext.timestamp.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Phase: {currentProject.phase}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="academic-grid-3 gap-6">
        {/* Recent Activities */}
        <div className="academic-project-card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-academic-blue" />
            <h3 className="academic-heading-section mb-0">Recent Activities</h3>
          </div>

          <div className="space-y-3">
            {recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="border-l-3 border-academic-blue pl-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-academic-primary">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-academic-muted">
                    {activity.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-academic-secondary mb-2">
                  {activity.description}
                </p>

                {activity.memoryHints.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-memory-purple" />
                    <span className="text-xs text-memory-purple">
                      {activity.memoryHints[0]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {recentActivities.length > 4 && (
            <button className="w-full mt-4 text-sm text-academic-blue hover:text-academic-blue font-medium">
              View all activities
            </button>
          )}
        </div>

        {/* Progress Insights */}
        <div className="academic-project-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-semantic-success" />
            <h3 className="academic-heading-section mb-0">Progress Insights</h3>
          </div>

          <div className="space-y-3">
            {highImpactInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-3 bg-academic-primary rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  {insight.impact === 'high' ? (
                    <AlertCircle className="h-4 w-4 text-semantic-warning mt-0.5" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-semantic-success mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-academic-primary">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-academic-secondary mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>

                {insight.actionable && insight.suggestedAction && (
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowRight className="h-3 w-3 text-academic-blue" />
                    <span className="text-xs text-academic-blue">
                      {insight.suggestedAction}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-sm text-academic-blue hover:text-academic-blue font-medium">
            View all insights
          </button>
        </div>

        {/* Memory Context */}
        <div className="academic-memory-card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-memory-purple" />
            <h3 className="academic-heading-section mb-0">Memory Context</h3>
          </div>

          <div className="space-y-3">
            {memoryContexts.slice(0, 3).map((context) => (
              <div
                key={context.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedContext?.id === context.id
                    ? 'bg-memory-purple border border-memory-purple'
                    : 'bg-white border border-memory-purple hover:bg-memory-purple'
                }`}
                onClick={() => setSelectedContext(context)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-memory-purple">
                    Context #{context.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${
                      context.confidence > 0.8 ? 'bg-semantic-success' :
                      context.confidence > 0.6 ? 'bg-semantic-warning' : 'bg-semantic-error'
                    }`} />
                    <span className="text-xs text-academic-muted">
                      {Math.round(context.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-academic-primary line-clamp-2">
                  {context.context}
                </p>

                {context.insights.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-memory-purple" />
                    <span className="text-xs text-memory-purple">
                      {context.insights.length} insight{context.insights.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-sm text-memory-purple hover:text-memory-purple font-medium">
            Explore memory graph
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-academic-primary rounded-lg">
        <h3 className="academic-heading-section mb-4">Quick Actions</h3>
        <div className="academic-grid-2 gap-4">
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <BookOpen className="h-4 w-4" />
            Start Literature Review
          </button>
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <FileText className="h-4 w-4" />
            Continue Writing
          </button>
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <Target className="h-4 w-4" />
            Design Methodology
          </button>
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <Calendar className="h-4 w-4" />
            Schedule Research Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryHub;