/**
 * Methodology Guide Component
 *
 * Interactive methodology planning with AI-powered recommendations and validation.
 * Provides method selection, design flaw detection, and ethics considerations.
 *
 * Features:
 * - Method recommendations based on research question type
 * - Design flaw detection with clear explanations
 * - Statistical planning assistance and power analysis
 * - Ethics consideration prompts and compliance checks
 * - Memory-driven methodology suggestions
 *
 * @location src/components/ui/MethodologyGuide.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';

import {
  Settings,
  Brain,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  BarChart3,
  Shield,
  Lightbulb,
  ArrowRight,
  Clock,
  Calculator,
  Book,
  FileText,
  Eye,
  Zap,
  HelpCircle,
  Star,
} from 'lucide-react';

/**
 * Research methodology types
 */
export type MethodologyType =
  | 'experimental'
  | 'survey'
  | 'qualitative'
  | 'mixed-methods'
  | 'case-study'
  | 'longitudinal'
  | 'cross-sectional'
  | 'meta-analysis'
  | 'systematic-review';

/**
 * Methodology recommendation interface
 */
export interface MethodologyRecommendation {
  id: string;
  type: MethodologyType;
  name: string;
  description: string;
  suitabilityScore: number;
  advantages: string[];
  limitations: string[];
  complexity: 'low' | 'medium' | 'high';
  timeframe: string;
  sampleSizeRange: [number, number];
  ethicsComplexity: 'minimal' | 'moderate' | 'complex';
  requiredResources: string[];
}

/**
 * Design flaw interface
 */
export interface DesignFlaw {
  id: string;
  type: 'sampling' | 'bias' | 'validity' | 'reliability' | 'ethics' | 'power' | 'confounding';
  severity: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  explanation: string;
  impact: string;
  suggestions: string[];
  resources: string[];
}

/**
 * Statistical plan interface
 */
export interface StatisticalPlan {
  id: string;
  primaryAnalysis: string;
  secondaryAnalyses: string[];
  powerAnalysis: {
    effectSize: number;
    alpha: number;
    power: number;
    requiredSampleSize: number;
  };
  assumptions: string[];
  alternativeTests: string[];
  softwareRecommendations: string[];
}

/**
 * Ethics consideration interface
 */
export interface EthicsConsideration {
  id: string;
  category: 'consent' | 'privacy' | 'risk' | 'vulnerable-populations' | 'data-protection' | 'deception';
  priority: 'required' | 'recommended' | 'conditional';
  title: string;
  description: string;
  requirements: string[];
  documentation: string[];
  approvalNeeded: boolean;
}

/**
 * Props for the MethodologyGuide component
 */
export interface MethodologyGuideProps {
  projectId: string;
  researchQuestion: string;
  currentMethodology?: MethodologyRecommendation;
  recommendations: MethodologyRecommendation[];
  detectedFlaws: DesignFlaw[];
  statisticalPlan?: StatisticalPlan;
  ethicsConsiderations: EthicsConsideration[];
  onMethodologySelect?: (methodology: MethodologyRecommendation) => void;
  onFlawAddressed?: (flawId: string) => void;
  onStatisticalPlanUpdate?: (plan: StatisticalPlan) => void;
  onEthicsReview?: () => void;
  className?: string;
}

/**
 * MethodologyGuide component for research methodology planning
 */
export const MethodologyGuide: React.FC<MethodologyGuideProps> = ({
  projectId,
  researchQuestion,
  currentMethodology,
  recommendations,
  detectedFlaws,
  statisticalPlan,
  ethicsConsiderations,
  onMethodologySelect,
  onFlawAddressed,
  onStatisticalPlanUpdate,
  onEthicsReview,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'validation' | 'statistics' | 'ethics'>('recommendations');
  const [selectedMethod, setSelectedMethod] = useState<MethodologyRecommendation | null>(currentMethodology || null);
  const [showFlawDetails, setShowFlawDetails] = useState<string | null>(null);

  const complexityConfig = {
    low: { color: 'text-semantic-success', label: 'Low', description: 'Straightforward to implement' },
    medium: { color: 'text-semantic-warning', label: 'Medium', description: 'Moderate complexity' },
    high: { color: 'text-semantic-error', label: 'High', description: 'Requires advanced expertise' },
  };

  const flawSeverityConfig = {
    critical: {
      color: 'text-semantic-error',
      bgColor: 'bg-semantic-error',
      icon: AlertTriangle,
      label: 'Critical',
      description: 'Must be addressed before proceeding'
    },
    major: {
      color: 'text-semantic-warning',
      bgColor: 'bg-semantic-warning',
      icon: AlertTriangle,
      label: 'Major',
      description: 'Should be addressed for validity'
    },
    minor: {
      color: 'text-academic-blue',
      bgColor: 'bg-academic-blue',
      icon: HelpCircle,
      label: 'Minor',
      description: 'Consider addressing for optimization'
    },
  };

  const criticalFlaws = detectedFlaws.filter(flaw => flaw.severity === 'critical');
  const requiredEthics = ethicsConsiderations.filter(ethics => ethics.priority === 'required');

  const topRecommendations = recommendations
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 3);

  return (
    <div className={`academic-container ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-academic-blue rounded-lg p-3">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="academic-heading-secondary mb-1">Methodology Guide</h2>
            <p className="academic-body-text text-academic-secondary">
              AI-powered methodology planning with design validation and ethics guidance
            </p>
          </div>
        </div>

        {/* Research Question Context */}
        <div className="bg-academic-primary rounded-lg p-4">
          <h3 className="text-academic-primary mb-2 text-sm font-medium">
            Research Question:
          </h3>
          <p className="academic-body-text text-academic-secondary text-sm">
            "{researchQuestion}"
          </p>
        </div>

        {/* Status Overview */}
        <div className="academic-grid-3 mt-4 gap-4">
          <div className="border-academic-primary rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <Target className="text-academic-blue h-5 w-5" />
              <span className="text-academic-primary font-medium">Method Selected</span>
            </div>
            <div className="text-academic-primary text-lg font-bold">
              {selectedMethod ? selectedMethod.name : 'Not Selected'}
            </div>
            <div className="text-academic-secondary text-sm">
              {selectedMethod ? `${selectedMethod.suitabilityScore}% match` : 'Choose methodology'}
            </div>
          </div>

          <div className="border-academic-primary rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${criticalFlaws.length > 0 ? 'text-semantic-error' : 'text-semantic-success'}`} />
              <span className="text-academic-primary font-medium">Design Issues</span>
            </div>
            <div className="text-academic-primary text-lg font-bold">
              {detectedFlaws.length}
            </div>
            <div className="text-academic-secondary text-sm">
              {criticalFlaws.length} critical issues
            </div>
          </div>

          <div className="border-academic-primary rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield className={`h-5 w-5 ${requiredEthics.length > 0 ? 'text-semantic-warning' : 'text-semantic-success'}`} />
              <span className="text-academic-primary font-medium">Ethics Review</span>
            </div>
            <div className="text-academic-primary text-lg font-bold">
              {ethicsConsiderations.length}
            </div>
            <div className="text-academic-secondary text-sm">
              {requiredEthics.length} required items
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-academic-primary border-b">
          <nav className="flex space-x-8">
            {[
              { id: 'recommendations', label: 'Method Selection', icon: Target },
              { id: 'validation', label: 'Design Validation', icon: CheckCircle },
              { id: 'statistics', label: 'Statistical Plan', icon: BarChart3 },
              { id: 'ethics', label: 'Ethics Review', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-academic-blue text-academic-blue'
                      : 'text-academic-muted hover:text-academic-primary border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Method Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {topRecommendations.map((method, index) => {
            const complexityInfo = complexityConfig[method.complexity];
            const isSelected = selectedMethod?.id === method.id;

            return (
              <div
                key={method.id}
                className={`academic-research-card cursor-pointer transition-all ${
                  isSelected ? 'ring-academic-blue border-academic-blue ring-2' : ''
                }`}
                onClick={() => setSelectedMethod(method)}
              >
                <div className="flex items-start gap-4">
                  {/* Ranking */}
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    index === 0 ? 'bg-semantic-warning' :
                    index === 1 ? 'bg-academic-primary' : 'bg-academic-muted'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    {/* Method Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="academic-heading-section mb-2 flex items-center gap-2">
                          {method.name}
                          {isSelected && <Star className="text-semantic-warning h-4 w-4 fill-current" />}
                        </h3>
                        <p className="academic-body-text text-academic-secondary mb-3 text-sm">
                          {method.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-academic-blue text-lg font-bold">
                            {method.suitabilityScore}%
                          </div>
                          <div className="text-academic-muted text-xs">
                            Suitability
                          </div>
                        </div>

                        <span className={`rounded px-2 py-1 text-xs ${complexityInfo.color} border border-current`}>
                          {complexityInfo.label} Complexity
                        </span>
                      </div>
                    </div>

                    {/* Method Details Grid */}
                    <div className="academic-grid-2 mb-4 gap-4">
                      <div>
                        <h4 className="text-semantic-success mb-2 text-sm font-medium">
                          Advantages:
                        </h4>
                        <ul className="space-y-1">
                          {method.advantages.slice(0, 3).map((advantage, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="text-semantic-success mt-1 h-3 w-3 flex-shrink-0" />
                              <span className="text-academic-secondary text-sm">
                                {advantage}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-semantic-warning mb-2 text-sm font-medium">
                          Limitations:
                        </h4>
                        <ul className="space-y-1">
                          {method.limitations.slice(0, 3).map((limitation, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertTriangle className="text-semantic-warning mt-1 h-3 w-3 flex-shrink-0" />
                              <span className="text-academic-secondary text-sm">
                                {limitation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Method Specifications */}
                    <div className="bg-academic-primary mb-4 grid grid-cols-2 gap-4 rounded-lg p-3 md:grid-cols-4">
                      <div>
                        <div className="text-academic-muted text-xs uppercase">Timeframe</div>
                        <div className="text-academic-primary text-sm font-medium">{method.timeframe}</div>
                      </div>
                      <div>
                        <div className="text-academic-muted text-xs uppercase">Sample Size</div>
                        <div className="text-academic-primary text-sm font-medium">
                          {method.sampleSizeRange[0]}-{method.sampleSizeRange[1]}
                        </div>
                      </div>
                      <div>
                        <div className="text-academic-muted text-xs uppercase">Ethics</div>
                        <div className="text-academic-primary text-sm font-medium capitalize">
                          {method.ethicsComplexity}
                        </div>
                      </div>
                      <div>
                        <div className="text-academic-muted text-xs uppercase">Resources</div>
                        <div className="text-academic-primary text-sm font-medium">
                          {method.requiredResources.length} items
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-academic-muted text-xs">
                          Match: {method.suitabilityScore}% • {complexityInfo.description}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button className="academic-btn-outline flex items-center gap-1 px-3 py-1 text-xs">
                          <Eye className="h-3 w-3" />
                          Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMethodologySelect?.(method);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 text-xs ${
                            isSelected ? 'academic-btn-secondary' : 'academic-btn-primary'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Target className="h-3 w-3" />
                              Select
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Design Validation Tab */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {detectedFlaws.map((flaw) => {
            const severityInfo = flawSeverityConfig[flaw.severity];
            const SeverityIcon = severityInfo.icon;

            return (
              <div key={flaw.id} className="academic-research-card">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${severityInfo.bgColor}`}>
                    <SeverityIcon className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="academic-heading-section mb-0">{flaw.title}</h3>
                      <span className={`rounded px-2 py-1 text-xs text-white ${severityInfo.bgColor}`}>
                        {severityInfo.label}
                      </span>
                      <span className="bg-academic-primary rounded px-2 py-1 text-xs capitalize">
                        {flaw.type}
                      </span>
                    </div>

                    <p className="academic-body-text text-academic-secondary mb-3 text-sm">
                      {flaw.description}
                    </p>

                    {showFlawDetails === flaw.id && (
                      <div className="bg-academic-primary mb-4 rounded-lg p-3">
                        <h4 className="text-academic-primary mb-2 text-sm font-medium">
                          Detailed Explanation:
                        </h4>
                        <p className="text-academic-secondary mb-3 text-sm">
                          {flaw.explanation}
                        </p>
                        <div className="bg-semantic-warning border-semantic-warning rounded border-l-4 p-2">
                          <span className="text-academic-primary text-sm font-medium">Impact: </span>
                          <span className="text-academic-secondary text-sm">{flaw.impact}</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-academic-primary mb-2 text-sm font-medium">
                        Suggested Solutions:
                      </h4>
                      <div className="space-y-1">
                        {flaw.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="text-academic-blue mt-1 h-3 w-3" />
                            <span className="text-academic-secondary text-sm">
                              {suggestion}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowFlawDetails(
                          showFlawDetails === flaw.id ? null : flaw.id
                        )}
                        className="text-academic-blue hover:text-academic-blue text-xs font-medium"
                      >
                        {showFlawDetails === flaw.id ? 'Hide Details' : 'Show Details'}
                      </button>

                      <div className="flex gap-2">
                        <button className="academic-btn-outline flex items-center gap-1 px-3 py-1 text-xs">
                          <Book className="h-3 w-3" />
                          Learn More
                        </button>
                        <button
                          onClick={() => onFlawAddressed?.(flaw.id)}
                          className="academic-btn-primary flex items-center gap-1 px-3 py-1 text-xs"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark Addressed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {detectedFlaws.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="text-semantic-success mx-auto mb-4 h-16 w-16" />
              <h3 className="academic-heading-section text-academic-primary mb-2">
                No Design Issues Detected
              </h3>
              <p className="text-academic-secondary">
                Your methodology design appears to be well-structured
              </p>
            </div>
          )}
        </div>
      )}

      {/* Statistical Planning Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {statisticalPlan ? (
            <>
              {/* Power Analysis */}
              <div className="academic-research-card">
                <h3 className="academic-heading-section mb-4 flex items-center gap-2">
                  <Calculator className="text-academic-blue h-5 w-5" />
                  Power Analysis
                </h3>

                <div className="academic-grid-2 mb-4 gap-4">
                  <div className="bg-academic-primary rounded-lg p-3">
                    <div className="text-academic-muted mb-1 text-sm">Required Sample Size</div>
                    <div className="text-academic-primary text-2xl font-bold">
                      {statisticalPlan.powerAnalysis.requiredSampleSize}
                    </div>
                  </div>
                  <div className="bg-academic-primary rounded-lg p-3">
                    <div className="text-academic-muted mb-1 text-sm">Statistical Power</div>
                    <div className="text-academic-primary text-2xl font-bold">
                      {(statisticalPlan.powerAnalysis.power * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-academic-muted text-xs uppercase">Effect Size</div>
                    <div className="text-academic-primary text-lg font-medium">
                      {statisticalPlan.powerAnalysis.effectSize}
                    </div>
                  </div>
                  <div>
                    <div className="text-academic-muted text-xs uppercase">Alpha Level</div>
                    <div className="text-academic-primary text-lg font-medium">
                      {statisticalPlan.powerAnalysis.alpha}
                    </div>
                  </div>
                  <div>
                    <div className="text-academic-muted text-xs uppercase">Power</div>
                    <div className="text-academic-primary text-lg font-medium">
                      {statisticalPlan.powerAnalysis.power}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Plan */}
              <div className="academic-research-card">
                <h3 className="academic-heading-section mb-4 flex items-center gap-2">
                  <BarChart3 className="text-academic-blue h-5 w-5" />
                  Analysis Plan
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-academic-primary mb-2 text-sm font-medium">
                      Primary Analysis:
                    </h4>
                    <p className="text-academic-secondary bg-academic-primary rounded-lg p-3 text-sm">
                      {statisticalPlan.primaryAnalysis}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-academic-primary mb-2 text-sm font-medium">
                      Secondary Analyses:
                    </h4>
                    <div className="space-y-1">
                      {statisticalPlan.secondaryAnalyses.map((analysis, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowRight className="text-academic-blue mt-1 h-3 w-3" />
                          <span className="text-academic-secondary text-sm">
                            {analysis}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-academic-primary mb-2 text-sm font-medium">
                      Recommended Software:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {statisticalPlan.softwareRecommendations.map((software, index) => (
                        <span
                          key={index}
                          className="bg-academic-blue rounded px-2 py-1 text-xs text-white"
                        >
                          {software}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Calculator className="text-academic-muted mx-auto mb-4 h-16 w-16" />
              <h3 className="academic-heading-section text-academic-muted mb-2">
                Statistical Plan Not Available
              </h3>
              <p className="text-academic-secondary mb-4">
                Select a methodology to generate a customized statistical plan
              </p>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="academic-btn-primary"
              >
                Select Methodology
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ethics Review Tab */}
      {activeTab === 'ethics' && (
        <div className="space-y-6">
          {ethicsConsiderations.map((ethics) => (
            <div key={ethics.id} className="academic-research-card">
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${
                  ethics.priority === 'required' ? 'bg-semantic-error' :
                  ethics.priority === 'recommended' ? 'bg-semantic-warning' : 'bg-academic-blue'
                }`}>
                  <Shield className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="academic-heading-section mb-0">{ethics.title}</h3>
                    <span className={`rounded px-2 py-1 text-xs capitalize text-white ${
                      ethics.priority === 'required' ? 'bg-semantic-error' :
                      ethics.priority === 'recommended' ? 'bg-semantic-warning' : 'bg-academic-blue'
                    }`}>
                      {ethics.priority}
                    </span>
                    <span className="bg-academic-primary rounded px-2 py-1 text-xs capitalize">
                      {ethics.category.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="academic-body-text text-academic-secondary mb-4 text-sm">
                    {ethics.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-academic-primary mb-2 text-sm font-medium">
                      Requirements:
                    </h4>
                    <div className="space-y-1">
                      {ethics.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="text-semantic-success mt-1 h-3 w-3" />
                          <span className="text-academic-secondary text-sm">
                            {requirement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {ethics.documentation.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-academic-primary mb-2 text-sm font-medium">
                        Required Documentation:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ethics.documentation.map((doc, index) => (
                          <span
                            key={index}
                            className="bg-academic-primary rounded px-2 py-1 text-xs"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ethics.approvalNeeded && (
                    <div className="bg-semantic-warning border-semantic-warning rounded-lg border-l-4 p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="text-semantic-warning h-4 w-4" />
                        <span className="text-academic-primary text-sm font-medium">
                          IRB/Ethics Board Approval Required
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {ethicsConsiderations.length === 0 && (
            <div className="py-12 text-center">
              <Shield className="text-semantic-success mx-auto mb-4 h-16 w-16" />
              <h3 className="academic-heading-section text-academic-primary mb-2">
                No Ethics Issues Identified
              </h3>
              <p className="text-academic-secondary mb-4">
                Your research appears to have minimal ethical considerations
              </p>
              <button
                onClick={onEthicsReview}
                className="academic-btn-primary"
              >
                Request Full Ethics Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MethodologyGuide;