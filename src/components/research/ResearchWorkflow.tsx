/**
 * Research Workflow Component
 *
 * Comprehensive research process management with AI-guided workflow.
 * Provides step-by-step research guidance, progress tracking, and milestone management.
 *
 * Features:
 * - Interactive research stage navigation
 * - AI-powered workflow recommendations
 * - Progress tracking and milestone management
 * - Adaptive research path optimization
 * - Collaboration and peer review integration
 *
 * @location src/components/research/ResearchWorkflow.tsx
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  BookOpen,
  Microscope,
  PenTool,
  Download,
  CheckCircle,
  Circle,
  ArrowRight,
  Clock,
  AlertTriangle,
  Users,
  Brain,
  TrendingUp,
  Settings,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { ResearchProject, ResearchStage, ProjectMilestone } from '../../types/research-project';

/**
 * Props for the ResearchWorkflow component
 */
export interface ResearchWorkflowProps {
  project: ResearchProject;
  onStageChange?: (stage: ResearchStage) => void;
  onMilestoneUpdate?: (milestone: ProjectMilestone) => void;
  onWorkflowOptimize?: () => void;
  className?: string;
}

/**
 * Research stage configuration
 */
interface StageConfig {
  key: ResearchStage;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  estimatedDuration: string;
  prerequisites?: ResearchStage[];
  deliverables: string[];
  aiAssistance: string[];
}

/**
 * ResearchWorkflow component for managing research process
 */
export const ResearchWorkflow: React.FC<ResearchWorkflowProps> = ({
  project,
  onStageChange,
  onMilestoneUpdate,
  onWorkflowOptimize,
  className,
}) => {
  const [selectedStage, setSelectedStage] = useState<ResearchStage>(project.stage);
  const [workflowRecommendations, setWorkflowRecommendations] = useState<string[]>([]);
  const [stageProgress, setStageProgress] = useState<Record<ResearchStage, number>>({
    'question-formation': 0,
    'literature-review': 0,
    'methodology-design': 0,
    'data-collection': 0,
    'analysis': 0,
    'writing': 0,
    'review': 0,
    'publication': 0,
    'export': 0,
    'completed': 0,
    'archived': 0,
  });
  const [loading, setLoading] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);

  /**
   * Research stages configuration
   */
  const stageConfigs: StageConfig[] = [
    {
      key: 'question-formation',
      title: 'Question Formation',
      description: 'Develop and refine your research question',
      icon: Target,
      color: 'blue',
      estimatedDuration: '1-2 weeks',
      deliverables: ['Refined research question', 'Hypotheses', 'Research objectives'],
      aiAssistance: ['Question refinement', 'Scope optimization', 'Feasibility assessment'],
    },
    {
      key: 'literature-review',
      title: 'Literature Review',
      description: 'Survey and analyze existing research',
      icon: BookOpen,
      color: 'green',
      estimatedDuration: '3-4 weeks',
      prerequisites: ['question-formation'],
      deliverables: ['Literature map', 'Research gaps', 'Theoretical framework'],
      aiAssistance: ['Source discovery', 'Citation analysis', 'Gap identification'],
    },
    {
      key: 'methodology-design',
      title: 'Methodology Design',
      description: 'Plan your research approach and methods',
      icon: Microscope,
      color: 'purple',
      estimatedDuration: '2-3 weeks',
      prerequisites: ['literature-review'],
      deliverables: ['Research design', 'Data collection plan', 'Analysis strategy'],
      aiAssistance: ['Method selection', 'Design optimization', 'Ethics guidance'],
    },
    {
      key: 'data-collection',
      title: 'Data Collection',
      description: 'Gather data according to your methodology',
      icon: TrendingUp,
      color: 'orange',
      estimatedDuration: '4-8 weeks',
      prerequisites: ['methodology-design'],
      deliverables: ['Raw data', 'Collection logs', 'Quality assessments'],
      aiAssistance: ['Process monitoring', 'Quality checks', 'Issue resolution'],
    },
    {
      key: 'analysis',
      title: 'Analysis',
      description: 'Analyze data and derive insights',
      icon: Brain,
      color: 'indigo',
      estimatedDuration: '3-6 weeks',
      prerequisites: ['data-collection'],
      deliverables: ['Analysis results', 'Visualizations', 'Statistical reports'],
      aiAssistance: ['Analysis guidance', 'Pattern recognition', 'Interpretation support'],
    },
    {
      key: 'writing',
      title: 'Writing',
      description: 'Draft and refine your research document',
      icon: PenTool,
      color: 'pink',
      estimatedDuration: '4-6 weeks',
      prerequisites: ['analysis'],
      deliverables: ['Research paper', 'Figures and tables', 'References'],
      aiAssistance: ['Writing guidance', 'Structure optimization', 'Style improvement'],
    },
    {
      key: 'review',
      title: 'Review',
      description: 'Peer review and revision process',
      icon: Users,
      color: 'yellow',
      estimatedDuration: '2-4 weeks',
      prerequisites: ['writing'],
      deliverables: ['Revised paper', 'Response to reviewers', 'Final version'],
      aiAssistance: ['Review simulation', 'Revision suggestions', 'Quality assessment'],
    },
    {
      key: 'publication',
      title: 'Publication',
      description: 'Submit and publish your research',
      icon: Download,
      color: 'emerald',
      estimatedDuration: '1-2 weeks',
      prerequisites: ['review'],
      deliverables: ['Published paper', 'Presentation materials', 'Data sharing'],
      aiAssistance: ['Journal selection', 'Submission guidance', 'Dissemination strategy'],
    },
  ];

  /**
   * Calculate stage progress based on milestones
   */
  const calculateStageProgress = useCallback(() => {
    const progress: Record<ResearchStage, number> = {} as any;

    stageConfigs.forEach(stage => {
      const stageMilestones = project.milestones.filter(m => m.stage === stage.key);
      const completedMilestones = stageMilestones.filter(m => m.completed);

      progress[stage.key] = stageMilestones.length > 0
        ? (completedMilestones.length / stageMilestones.length) * 100
        : 0;
    });

    setStageProgress(progress);
  }, [project.milestones, stageConfigs]);

  /**
   * Get AI workflow recommendations
   */
  const fetchWorkflowRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/research/workflow/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          currentStage: project.stage,
          progress: project.progress,
          milestones: project.milestones,
        }),
      });

      if (response.ok) {
        const { recommendations } = await response.json();
        setWorkflowRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch workflow recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    calculateStageProgress();
    fetchWorkflowRecommendations();
  }, [calculateStageProgress, fetchWorkflowRecommendations]);

  /**
   * Handle stage selection
   */
  const handleStageSelect = (stage: ResearchStage) => {
    setSelectedStage(stage);
    onStageChange?.(stage);
  };

  /**
   * Handle milestone completion
   */
  const handleMilestoneToggle = (milestone: ProjectMilestone) => {
    const updatedMilestone = {
      ...milestone,
      completed: !milestone.completed,
      completedAt: !milestone.completed ? new Date() : undefined,
    };
    onMilestoneUpdate?.(updatedMilestone);
  };

  /**
   * Get stage status
   */
  const getStageStatus = (stage: StageConfig) => {
    const progress = stageProgress[stage.key] || 0;
    const isCurrentStage = project.stage === stage.key;
    const isCompleted = progress === 100;
    const isAccessible = !stage.prerequisites ||
      stage.prerequisites.every(prereq => (stageProgress[prereq] || 0) > 50);

    return {
      isCurrentStage,
      isCompleted,
      isAccessible,
      progress,
    };
  };

  /**
   * Get color classes for stage
   */
  const getStageColors = (stage: StageConfig, status: ReturnType<typeof getStageStatus>) => {
    const baseColors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-900',
      green: 'border-green-200 bg-green-50 text-green-900',
      purple: 'border-purple-200 bg-purple-50 text-purple-900',
      orange: 'border-orange-200 bg-orange-50 text-orange-900',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
      pink: 'border-pink-200 bg-pink-50 text-pink-900',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    };

    if (status.isCompleted) {
      return 'border-green-400 bg-green-100 text-green-900';
    }
    if (status.isCurrentStage) {
      return `border-${stage.color}-400 bg-${stage.color}-100 text-${stage.color}-900 ring-2 ring-${stage.color}-200`;
    }
    if (!status.isAccessible) {
      return 'border-gray-200 bg-gray-50 text-gray-500';
    }

    return baseColors[stage.color as keyof typeof baseColors] || baseColors.blue;
  };

  const selectedStageConfig = stageConfigs.find(s => s.key === selectedStage);
  const stageMilestones = project.milestones.filter(m => m.stage === selectedStage);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research Workflow</h2>
          <p className="text-gray-600">
            Navigate through your research process with AI guidance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowOptimization(!showOptimization)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Optimize
          </Button>

          <Button onClick={onWorkflowOptimize}>
            <Brain className="h-4 w-4 mr-1" />
            AI Recommendations
          </Button>
        </div>
      </div>

      {/* Workflow Progress Overview */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Overall Progress
          </h3>
          <ProgressBar
            value={project.progress.overall}
            max={100}
            showPercentage
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Started: {new Date(project.createdAt).toLocaleDateString()}</span>
            <span>Current Stage: {selectedStageConfig?.title}</span>
          </div>
        </div>

        {/* AI Recommendations */}
        {workflowRecommendations.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Workflow Recommendations
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {workflowRecommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Stage Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stageConfigs.map((stage) => {
          const status = getStageStatus(stage);
          const Icon = stage.icon;

          return (
            <Card
              key={stage.key}
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                getStageColors(stage, status)
              } ${selectedStage === stage.key ? 'transform scale-105' : ''}`}
              onClick={() => status.isAccessible && handleStageSelect(stage.key)}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                  status.isCompleted ? 'bg-green-100' :
                  status.isCurrentStage ? `bg-${stage.color}-100` : 'bg-gray-100'
                }`}>
                  {status.isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Icon className={`h-6 w-6 ${
                      status.isCurrentStage ? `text-${stage.color}-600` : 'text-gray-600'
                    }`} />
                  )}
                </div>

                <h3 className="font-semibold mb-1">{stage.title}</h3>
                <p className="text-xs mb-3 opacity-80">{stage.description}</p>

                <div className="space-y-2">
                  <ProgressBar
                    value={status.progress}
                    max={100}
                    size="sm"
                    showPercentage
                  />

                  <div className="flex items-center justify-center gap-2 text-xs">
                    <Clock className="h-3 w-3" />
                    {stage.estimatedDuration}
                  </div>

                  {!status.isAccessible && (
                    <div className="flex items-center justify-center gap-1 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      Prerequisites needed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Stage Details */}
      {selectedStageConfig && (
        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stage Information */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <selectedStageConfig.icon className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedStageConfig.title}
                </h3>
                <Badge variant="secondary">
                  {selectedStageConfig.estimatedDuration}
                </Badge>
              </div>

              <p className="text-gray-700 mb-6">{selectedStageConfig.description}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
                  <ul className="space-y-1">
                    {selectedStageConfig.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <Circle className="h-3 w-3 text-gray-400" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Assistance Available</h4>
                  <ul className="space-y-1">
                    {selectedStageConfig.aiAssistance.map((assistance, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-blue-700">
                        <Brain className="h-3 w-3 text-blue-500" />
                        {assistance}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stage Milestones */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Stage Milestones ({stageMilestones.filter(m => m.completed).length}/{stageMilestones.length})
              </h4>

              <div className="space-y-3">
                {stageMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                      milestone.completed ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleMilestoneToggle(milestone)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-medium ${
                          milestone.completed ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {milestone.title}
                        </h5>
                        <p className={`text-sm mt-1 ${
                          milestone.completed ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {milestone.description}
                        </p>
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {stageMilestones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No milestones defined for this stage</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Milestone
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Advanced Workflow Features:
 *    - Dynamic workflow adaptation based on progress
 *    - Parallel stage execution for complex projects
 *    - Custom workflow templates by research field
 *    - Integration with institutional requirements
 *
 * 2. AI-Powered Optimization:
 *    - Intelligent milestone generation
 *    - Deadline prediction and adjustment
 *    - Resource allocation recommendations
 *    - Risk assessment and mitigation
 *
 * 3. Collaboration Integration:
 *    - Multi-user workflow coordination
 *    - Peer review stage management
 *    - Supervisor approval workflows
 *    - Team milestone synchronization
 *
 * 4. Analytics and Insights:
 *    - Workflow efficiency metrics
 *    - Stage duration analysis
 *    - Bottleneck identification
 *    - Productivity recommendations
 *
 * 5. Integration Features:
 *    - Calendar integration for deadlines
 *    - Project management tool sync
 *    - Institutional system integration
 *    - External timeline imports
 */