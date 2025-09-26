/**
 * Research Insights Component
 *
 * AI-powered insights and analytics for research projects.
 * Provides intelligent suggestions, pattern recognition, and research optimization.
 *
 * Features:
 * - AI-generated research insights and patterns
 * - Progress analytics and trend analysis
 * - Research gap identification
 * - Methodology optimization suggestions
 * - Cross-project learning and recommendations
 *
 * @location src/components/research/ResearchInsights.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  Zap,
  ArrowRight,
  RefreshCw,
  Download,
  Settings,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * Research insight types
 */
export type InsightType =
  | 'progress'
  | 'methodology'
  | 'literature'
  | 'risk'
  | 'opportunity'
  | 'optimization'
  | 'collaboration';

/**
 * Research insight interface
 */
export interface ResearchInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  actionable: boolean;
  suggestedActions?: string[];
  dataSource: string[];
  createdAt: Date;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

/**
 * Analytics data structure
 */
export interface ResearchAnalytics {
  productivity: {
    dailyProgress: Array<{ date: string; progress: number }>;
    weeklyTrend: 'increasing' | 'stable' | 'decreasing';
    averageSessionLength: number;
    mostProductiveTime: string;
  };
  milestone: {
    completionRate: number;
    averageDelay: number;
    upcomingDeadlines: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  memory: {
    totalMemories: number;
    memoryDensity: number;
    knowledgeGaps: string[];
    connectionStrength: number;
  };
  collaboration: {
    teamSize: number;
    communicationFrequency: number;
    expertiseGaps: string[];
    networkRecommendations: string[];
  };
}

/**
 * Props for the ResearchInsights component
 */
export interface ResearchInsightsProps {
  projectId: string;
  insights?: ResearchInsight[];
  analytics?: ResearchAnalytics;
  onInsightAction?: (insight: ResearchInsight, action: string) => void;
  onRefreshInsights?: () => void;
  className?: string;
}

/**
 * ResearchInsights component for AI-powered research analytics
 */
export const ResearchInsights: React.FC<ResearchInsightsProps> = ({
  projectId,
  insights = [],
  analytics,
  onInsightAction,
  onRefreshInsights,
  className,
}) => {
  const [selectedInsightType, setSelectedInsightType] = useState<InsightType | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  /**
   * Refresh insights from AI
   */
  const handleRefreshInsights = async () => {
    setLoading(true);
    try {
      await onRefreshInsights?.();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle insight expansion
   */
  const toggleInsightExpansion = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  /**
   * Get insight type configuration
   */
  const getInsightTypeConfig = (type: InsightType) => {
    const configs = {
      progress: { icon: TrendingUp, color: 'blue', label: 'Progress' },
      methodology: { icon: Target, color: 'purple', label: 'Methodology' },
      literature: { icon: BookOpen, color: 'green', label: 'Literature' },
      risk: { icon: AlertTriangle, color: 'red', label: 'Risk' },
      opportunity: { icon: Lightbulb, color: 'yellow', label: 'Opportunity' },
      optimization: { icon: Zap, color: 'orange', label: 'Optimization' },
      collaboration: { icon: Users, color: 'indigo', label: 'Collaboration' },
    };
    return configs[type];
  };

  /**
   * Get impact color
   */
  const getImpactColor = (impact: ResearchInsight['impact']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[impact];
  };

  /**
   * Filter insights by type
   */
  const filteredInsights = insights.filter(insight =>
    selectedInsightType === 'all' || insight.type === selectedInsightType
  );

  /**
   * Get insight type counts
   */
  const insightTypeCounts = insights.reduce((counts, insight) => {
    counts[insight.type] = (counts[insight.type] || 0) + 1;
    return counts;
  }, {} as Record<InsightType, number>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Research Insights
          </h2>
          <p className="text-gray-600">
            AI-powered analytics and recommendations for your research
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshInsights}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.productivity.weeklyTrend === 'increasing' ? '↗️' :
                   analytics.productivity.weeklyTrend === 'decreasing' ? '↘️' : '→'}
                </div>
                <div className="text-sm text-gray-600">Weekly Trend</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.milestone.completionRate.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Milestone Rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.memory.totalMemories}
                </div>
                <div className="text-sm text-gray-600">Memories</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${
                analytics.milestone.riskLevel === 'high' ? 'bg-red-100' :
                analytics.milestone.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  analytics.milestone.riskLevel === 'high' ? 'text-red-600' :
                  analytics.milestone.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {analytics.milestone.riskLevel}
                </div>
                <div className="text-sm text-gray-600">Risk Level</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Insight Type Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedInsightType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedInsightType('all')}
          >
            All Insights ({insights.length})
          </Button>

          {(Object.entries(insightTypeCounts) as [InsightType, number][]).map(([type, count]) => {
            const config = getInsightTypeConfig(type);
            const Icon = config.icon;

            return (
              <Button
                key={type}
                variant={selectedInsightType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedInsightType(type)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => {
            const config = getInsightTypeConfig(insight.type);
            const Icon = config.icon;
            const isExpanded = expandedInsights.has(insight.id);

            return (
              <Card key={insight.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`rounded-lg p-2 bg-${config.color}-100`}>
                      <Icon className={`h-5 w-5 text-${config.color}-600`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <Badge variant="outline" className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="secondary">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        {insight.actionable && (
                          <Badge variant="info">
                            Actionable
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{insight.description}</p>

                      {isExpanded && insight.suggestedActions && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Actions:</h4>
                          <ul className="space-y-2">
                            {insight.suggestedActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0 text-blue-500" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                        <span>Generated: {insight.createdAt.toLocaleDateString()}</span>
                        <span>Relevance: {(insight.relevanceScore * 100).toFixed(0)}%</span>
                        <span>Sources: {insight.dataSource.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {insight.actionable && insight.suggestedActions && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleInsightExpansion(insight.id)}
                      >
                        {isExpanded ? 'Hide Actions' : 'Show Actions'}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInsightAction?.(insight, 'implement')}
                    >
                      Implement
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedInsightType === 'all' ? 'No insights available' : `No ${getInsightTypeConfig(selectedInsightType as InsightType).label.toLowerCase()} insights`}
            </h3>
            <p className="text-gray-600 mb-4">
              {loading
                ? 'Generating AI insights...'
                : 'Our AI is analyzing your research to generate insights. Check back soon or refresh to get new recommendations.'
              }
            </p>
            <Button onClick={handleRefreshInsights} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate Insights'}
            </Button>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {analytics && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Optimizations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.memory.knowledgeGaps.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Knowledge Gaps</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analytics.memory.knowledgeGaps.slice(0, 3).map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-2">
                  Address Gaps
                </Button>
              </div>
            )}

            {analytics.collaboration.expertiseGaps.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Collaboration Opportunities</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analytics.collaboration.expertiseGaps.slice(0, 3).map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-2">
                  Find Collaborators
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Advanced Analytics:
 *    - Machine learning-based trend prediction
 *    - Comparative analysis with similar projects
 *    - Performance benchmarking and scoring
 *    - Research velocity optimization
 *
 * 2. AI Insight Generation:
 *    - Natural language processing of research content
 *    - Pattern recognition in research behavior
 *    - Predictive modeling for research outcomes
 *    - Automated literature gap analysis
 *
 * 3. Visualization Features:
 *    - Interactive charts and graphs
 *    - Research timeline visualization
 *    - Network analysis of concepts
 *    - Progress heatmaps and trends
 *
 * 4. Action Implementation:
 *    - Automated workflow adjustments
 *    - Smart recommendation engine
 *    - Integration with external tools
 *    - Performance impact tracking
 *
 * 5. Collaboration Intelligence:
 *    - Team performance analytics
 *    - Communication pattern analysis
 *    - Expertise mapping and recommendations
 *    - Conflict prediction and resolution
 */