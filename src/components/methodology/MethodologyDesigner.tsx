/**
 * Methodology Designer Component
 *
 * Interactive research methodology design tool with AI-powered recommendations.
 * Guides researchers through methodology selection, validation, and optimization.
 *
 * Features:
 * - Methodology template library and customization
 * - AI-powered methodology recommendations
 * - Step-by-step design wizard
 * - Validation and feasibility analysis
 * - Ethics and compliance guidance
 *
 * @location src/components/methodology/MethodologyDesigner.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Microscope,
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  Clock,
  Shield,
  BarChart3,
  FileText,
  Settings,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Save,
  Download,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  MethodologyDesign,
  MethodologyTemplate,
  MethodologyValidation,
  ResearchMethod,
  DataCollectionPlan,
  AnalysisStrategy,
} from '../../types/methodology';

/**
 * Props for the MethodologyDesigner component
 */
export interface MethodologyDesignerProps {
  projectId: string;
  researchQuestion?: string;
  existingMethodology?: MethodologyDesign;
  onSaveMethodology?: (methodology: MethodologyDesign) => void;
  onValidateMethodology?: (methodology: MethodologyDesign) => Promise<MethodologyValidation>;
  className?: string;
}

/**
 * Design wizard steps
 */
type WizardStep = 'overview' | 'approach' | 'methods' | 'data' | 'analysis' | 'ethics' | 'validation' | 'review';

/**
 * MethodologyDesigner component for research methodology planning
 */
export const MethodologyDesigner: React.FC<MethodologyDesignerProps> = ({
  projectId,
  researchQuestion,
  existingMethodology,
  onSaveMethodology,
  onValidateMethodology,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('overview');
  const [methodology, setMethodology] = useState<Partial<MethodologyDesign>>(
    existingMethodology || {
      projectId,
      researchQuestion,
      approach: 'mixed-methods',
      methods: [],
      dataCollection: {
        sources: [],
        instruments: [],
        procedures: [],
        timeline: { phases: [] },
        sampleSize: 0,
        samplingMethod: '',
      },
      analysis: {
        techniques: [],
        software: [],
        qualitativeApproach: '',
        quantitativeApproach: '',
        validationMethods: [],
      },
      ethicsConsiderations: {
        irbRequired: false,
        consentRequired: false,
        risksIdentified: [],
        mitigationStrategies: [],
      },
      feasibility: {
        timeline: '',
        budget: '',
        resources: [],
        risks: [],
      },
    }
  );
  const [validation, setValidation] = useState<MethodologyValidation | null>(null);
  const [templates, setTemplates] = useState<MethodologyTemplate[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);

  /**
   * Wizard step configuration
   */
  const wizardSteps: Array<{
    key: WizardStep;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isOptional?: boolean;
  }> = [
    {
      key: 'overview',
      title: 'Research Overview',
      description: 'Define your research approach and objectives',
      icon: FileText,
    },
    {
      key: 'approach',
      title: 'Research Approach',
      description: 'Select quantitative, qualitative, or mixed methods',
      icon: BarChart3,
    },
    {
      key: 'methods',
      title: 'Research Methods',
      description: 'Choose specific methods and techniques',
      icon: Microscope,
    },
    {
      key: 'data',
      title: 'Data Collection',
      description: 'Plan data sources, instruments, and procedures',
      icon: Users,
    },
    {
      key: 'analysis',
      title: 'Analysis Strategy',
      description: 'Define analysis techniques and tools',
      icon: Brain,
    },
    {
      key: 'ethics',
      title: 'Ethics & Compliance',
      description: 'Address ethical considerations and approvals',
      icon: Shield,
    },
    {
      key: 'validation',
      title: 'Validation',
      description: 'Validate methodology design and feasibility',
      icon: CheckCircle,
    },
    {
      key: 'review',
      title: 'Review & Finalize',
      description: 'Review complete methodology and finalize',
      icon: Settings,
    },
  ];

  /**
   * Load methodology templates
   */
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/methodology/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Failed to load methodology templates:', error);
      }
    };

    loadTemplates();
  }, []);

  /**
   * Get AI recommendations for current step
   */
  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/methodology/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          researchQuestion,
          currentStep,
          methodology,
        }),
      });

      if (response.ok) {
        const { recommendations: recs } = await response.json();
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate methodology
   */
  const validateMethodology = async () => {
    if (!onValidateMethodology) return;

    setLoading(true);
    try {
      const validationResult = await onValidateMethodology(methodology as MethodologyDesign);
      setValidation(validationResult);
    } catch (error) {
      console.error('Methodology validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save methodology progress
   */
  const saveProgress = () => {
    if (onSaveMethodology) {
      onSaveMethodology(methodology as MethodologyDesign);
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 2000);
    }
  };

  /**
   * Navigate wizard steps
   */
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    const currentIndex = wizardSteps.findIndex(s => s.key === currentStep);
    if (currentIndex < wizardSteps.length - 1) {
      setCurrentStep(wizardSteps[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = wizardSteps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(wizardSteps[currentIndex - 1].key);
    }
  };

  /**
   * Calculate completion percentage
   */
  const getCompletionPercentage = () => {
    const requiredSteps = wizardSteps.filter(s => !s.isOptional);
    const currentIndex = requiredSteps.findIndex(s => s.key === currentStep);
    return ((currentIndex + 1) / requiredSteps.length) * 100;
  };

  /**
   * Render research approach step
   */
  const renderApproachStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Research Approach
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              key: 'quantitative',
              title: 'Quantitative',
              description: 'Numerical data, statistical analysis, hypothesis testing',
              icon: BarChart3,
            },
            {
              key: 'qualitative',
              title: 'Qualitative',
              description: 'Text/visual data, thematic analysis, exploration',
              icon: FileText,
            },
            {
              key: 'mixed-methods',
              title: 'Mixed Methods',
              description: 'Combines both quantitative and qualitative approaches',
              icon: Microscope,
            },
          ].map((approach) => {
            const Icon = approach.icon;
            const isSelected = methodology.approach === approach.key;

            return (
              <Card
                key={approach.key}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setMethodology(prev => ({ ...prev, approach: approach.key as any }))
                }
              >
                <div className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-3 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {approach.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {approach.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {methodology.approach && recommendations.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Recommendations for {methodology.approach} research:
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );

  /**
   * Render validation step
   */
  const renderValidationStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Methodology Validation
        </h3>
        <Button
          onClick={validateMethodology}
          disabled={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Play className="h-4 w-4 mr-1 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Validate Methodology
            </>
          )}
        </Button>
      </div>

      {validation && (
        <div className="space-y-4">
          <Card className={`p-4 border-2 ${
            validation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {validation.isValid ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <h4 className={`font-semibold ${
                  validation.isValid ? 'text-green-900' : 'text-red-900'
                }`}>
                  {validation.isValid ? 'Methodology is Valid' : 'Validation Issues Found'}
                </h4>
                <p className={`text-sm ${
                  validation.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  Overall Score: {validation.overallScore.toFixed(1)}/10
                </p>
              </div>
            </div>

            {validation.issues && validation.issues.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Issues to Address:</h5>
                <ul className="space-y-1">
                  {validation.issues?.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="h-3 w-3 mt-1 text-orange-500 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validation.suggestions && validation.suggestions.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Improvement Suggestions:</h5>
                <ul className="space-y-1">
                  {validation.suggestions?.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Lightbulb className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Detailed validation metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {validation.scores && Object.entries(validation.scores).map(([metric, score]) => (
              <Card key={metric} className="p-3 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const currentStepConfig = wizardSteps.find(s => s.key === currentStep);
  const currentStepIndex = wizardSteps.findIndex(s => s.key === currentStep);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Microscope className="h-6 w-6" />
            Methodology Designer
          </h2>
          <p className="text-gray-600">
            Design and validate your research methodology with AI guidance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={getRecommendations}
            disabled={loading}
          >
            <Brain className="h-4 w-4 mr-1" />
            Get AI Recommendations
          </Button>

          <Button
            variant="outline"
            onClick={saveProgress}
            className={savedProgress ? 'bg-green-100 text-green-700' : ''}
          >
            <Save className="h-4 w-4 mr-1" />
            {savedProgress ? 'Saved!' : 'Save Progress'}
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Design Progress</h3>
          <span className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {wizardSteps.length}
          </span>
        </div>
        <ProgressBar
          value={getCompletionPercentage()}
          max={100}
          showPercentage
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Current: {currentStepConfig?.title}
          </span>
          <span className="text-blue-600">
            {Math.round(getCompletionPercentage())}% Complete
          </span>
        </div>
      </Card>

      {/* Wizard Navigation */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
        {wizardSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <button
              key={step.key}
              onClick={() => goToStep(step.key)}
              className={`p-3 rounded-lg text-center transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                  : isCompleted
                  ? 'bg-green-100 text-green-900 border border-green-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{step.title}</div>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="p-8 min-h-96">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentStepConfig?.title}
          </h3>
          <p className="text-gray-600">{currentStepConfig?.description}</p>
        </div>

        {/* Render step-specific content */}
        {currentStep === 'approach' && renderApproachStep()}
        {currentStep === 'validation' && renderValidationStep()}
        {/* TODO: Implement other step renderers */}
        {!['approach', 'validation'].includes(currentStep) && (
          <div className="text-center py-12 text-gray-500">
            <Microscope className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Step content coming soon</p>
          </div>
        )}
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={saveProgress}
            className={savedProgress ? 'bg-green-100 text-green-700' : ''}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>

          <Button
            onClick={goToNextStep}
            disabled={currentStepIndex === wizardSteps.length - 1}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Complete Step Renderers:
 *    - Overview step with research objectives
 *    - Methods selection with detailed options
 *    - Data collection planning interface
 *    - Analysis strategy configuration
 *    - Ethics and compliance wizard
 *    - Final review and export
 *
 * 2. Template System:
 *    - Pre-built methodology templates
 *    - Custom template creation
 *    - Template sharing and collaboration
 *    - Field-specific methodology guides
 *
 * 3. Validation Engine:
 *    - Comprehensive methodology validation
 *    - Feasibility analysis and scoring
 *    - Risk assessment and mitigation
 *    - Resource requirement calculation
 *
 * 4. AI Integration:
 *    - Intelligent method recommendations
 *    - Automated feasibility analysis
 *    - Ethics compliance checking
 *    - Timeline and resource optimization
 *
 * 5. Collaboration Features:
 *    - Peer review and feedback
 *    - Supervisor approval workflow
 *    - Team methodology development
 *    - Expert consultation integration
 */