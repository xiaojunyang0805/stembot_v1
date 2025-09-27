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
    if (hour < 12) {
setTimeOfDay('morning');
} else if (hour < 17) {
setTimeOfDay('afternoon');
} else {
setTimeOfDay('evening');
}
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
    if (!currentProject || memoryContexts.length === 0) {
return null;
}

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
              <div className="bg-memory-purple rounded-lg p-2">
                <Brain className="text-memory-purple h-5 w-5" />
              </div>
              <div>
                <h2 className="academic-heading-section mb-1">Resume where you left off</h2>
                <p className="text-academic-muted text-sm">
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

          <div className="bg-academic-primary mb-4 rounded-lg p-4">
            <h3 className="text-academic-primary mb-2 font-medium">
              {currentProject.title}
            </h3>
            <p className="academic-body-text mb-3 text-sm">
              {resumeContext.context}
            </p>

            {resumeContext.insights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resumeContext.insights.slice(0, 3).map((insight, index) => (
                  <span
                    key={index}
                    className="bg-memory-purple rounded-full px-3 py-1 text-xs"
                  >
                    {insight}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="text-academic-muted flex items-center justify-between text-sm">
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
          <div className="mb-4 flex items-center gap-2">
            <Clock className="text-academic-blue h-5 w-5" />
            <h3 className="academic-heading-section mb-0">Recent Activities</h3>
          </div>

          <div className="space-y-3">
            {recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="border-l-3 border-academic-blue py-2 pl-3">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-academic-primary text-sm font-medium">
                    {activity.title}
                  </h4>
                  <span className="text-academic-muted text-xs">
                    {activity.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-academic-secondary mb-2 text-xs">
                  {activity.description}
                </p>

                {activity.memoryHints.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Lightbulb className="text-memory-purple h-3 w-3" />
                    <span className="text-memory-purple text-xs">
                      {activity.memoryHints[0]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {recentActivities.length > 4 && (
            <button className="text-academic-blue hover:text-academic-blue mt-4 w-full text-sm font-medium">
              View all activities
            </button>
          )}
        </div>

        {/* Progress Insights */}
        <div className="academic-project-card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-semantic-success h-5 w-5" />
            <h3 className="academic-heading-section mb-0">Progress Insights</h3>
          </div>

          <div className="space-y-3">
            {highImpactInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="bg-academic-primary rounded-lg p-3">
                <div className="mb-2 flex items-start gap-2">
                  {insight.impact === 'high' ? (
                    <AlertCircle className="text-semantic-warning mt-0.5 h-4 w-4" />
                  ) : (
                    <CheckCircle className="text-semantic-success mt-0.5 h-4 w-4" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-academic-primary text-sm font-medium">
                      {insight.title}
                    </h4>
                    <p className="text-academic-secondary mt-1 text-xs">
                      {insight.description}
                    </p>
                  </div>
                </div>

                {insight.actionable && insight.suggestedAction && (
                  <div className="mt-2 flex items-center gap-1">
                    <ArrowRight className="text-academic-blue h-3 w-3" />
                    <span className="text-academic-blue text-xs">
                      {insight.suggestedAction}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="text-academic-blue hover:text-academic-blue mt-4 w-full text-sm font-medium">
            View all insights
          </button>
        </div>

        {/* Memory Context */}
        <div className="academic-memory-card">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="text-memory-purple h-5 w-5" />
            <h3 className="academic-heading-section mb-0">Memory Context</h3>
          </div>

          <div className="space-y-3">
            {memoryContexts.slice(0, 3).map((context) => (
              <div
                key={context.id}
                className={`cursor-pointer rounded-lg p-3 transition-all ${
                  selectedContext?.id === context.id
                    ? 'bg-memory-purple border-memory-purple border'
                    : 'border-memory-purple hover:bg-memory-purple border bg-white'
                }`}
                onClick={() => setSelectedContext(context)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-memory-purple text-xs font-medium">
                    Context #{context.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${
                      context.confidence > 0.8 ? 'bg-semantic-success' :
                      context.confidence > 0.6 ? 'bg-semantic-warning' : 'bg-semantic-error'
                    }`} />
                    <span className="text-academic-muted text-xs">
                      {Math.round(context.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-academic-primary line-clamp-2 text-xs">
                  {context.context}
                </p>

                {context.insights.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <Lightbulb className="text-memory-purple h-3 w-3" />
                    <span className="text-memory-purple text-xs">
                      {context.insights.length} insight{context.insights.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="text-memory-purple hover:text-memory-purple mt-4 w-full text-sm font-medium">
            Explore memory graph
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-academic-primary mt-8 rounded-lg p-6">
        <h3 className="academic-heading-section mb-4">Quick Actions</h3>
        <div className="academic-grid-2 gap-4">
          <button className="academic-btn-outline flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" />
            Start Literature Review
          </button>
          <button className="academic-btn-outline flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Continue Writing
          </button>
          <button className="academic-btn-outline flex items-center justify-center gap-2">
            <Target className="h-4 w-4" />
            Design Methodology
          </button>
          <button className="academic-btn-outline flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Research Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryHub;