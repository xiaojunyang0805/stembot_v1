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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-academic-blue rounded-lg">
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
        <div className="p-4 bg-academic-primary rounded-lg">
          <h3 className="text-sm font-medium text-academic-primary mb-2">
            Research Question:
          </h3>
          <p className="academic-body-text text-sm text-academic-secondary">
            "{researchQuestion}"
          </p>
        </div>

        {/* Status Overview */}
        <div className="mt-4 academic-grid-3 gap-4">
          <div className="p-4 bg-white border border-academic-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-academic-blue" />
              <span className="font-medium text-academic-primary">Method Selected</span>
            </div>
            <div className="text-lg font-bold text-academic-primary">
              {selectedMethod ? selectedMethod.name : 'Not Selected'}
            </div>
            <div className="text-sm text-academic-secondary">
              {selectedMethod ? `${selectedMethod.suitabilityScore}% match` : 'Choose methodology'}
            </div>
          </div>

          <div className="p-4 bg-white border border-academic-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-5 w-5 ${criticalFlaws.length > 0 ? 'text-semantic-error' : 'text-semantic-success'}`} />
              <span className="font-medium text-academic-primary">Design Issues</span>
            </div>
            <div className="text-lg font-bold text-academic-primary">
              {detectedFlaws.length}
            </div>
            <div className="text-sm text-academic-secondary">
              {criticalFlaws.length} critical issues
            </div>
          </div>

          <div className="p-4 bg-white border border-academic-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`h-5 w-5 ${requiredEthics.length > 0 ? 'text-semantic-warning' : 'text-semantic-success'}`} />
              <span className="font-medium text-academic-primary">Ethics Review</span>
            </div>
            <div className="text-lg font-bold text-academic-primary">
              {ethicsConsiderations.length}
            </div>
            <div className="text-sm text-academic-secondary">
              {requiredEthics.length} required items
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-academic-primary">
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
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-academic-blue text-academic-blue'
                      : 'border-transparent text-academic-muted hover:text-academic-primary'
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
                className={`academic-research-card transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-academic-blue border-academic-blue' : ''
                }`}
                onClick={() => setSelectedMethod(method)}
              >
                <div className="flex items-start gap-4">
                  {/* Ranking */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-semantic-warning' :
                    index === 1 ? 'bg-academic-primary' : 'bg-academic-muted'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    {/* Method Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="academic-heading-section mb-2 flex items-center gap-2">
                          {method.name}
                          {isSelected && <Star className="h-4 w-4 text-semantic-warning fill-current" />}
                        </h3>
                        <p className="academic-body-text text-sm text-academic-secondary mb-3">
                          {method.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-academic-blue">
                            {method.suitabilityScore}%
                          </div>
                          <div className="text-xs text-academic-muted">
                            Suitability
                          </div>
                        </div>

                        <span className={`px-2 py-1 rounded text-xs ${complexityInfo.color} border border-current`}>
                          {complexityInfo.label} Complexity
                        </span>
                      </div>
                    </div>

                    {/* Method Details Grid */}
                    <div className="academic-grid-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-semantic-success mb-2">
                          Advantages:
                        </h4>
                        <ul className="space-y-1">
                          {method.advantages.slice(0, 3).map((advantage, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-semantic-success mt-1 flex-shrink-0" />
                              <span className="text-sm text-academic-secondary">
                                {advantage}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-semantic-warning mb-2">
                          Limitations:
                        </h4>
                        <ul className="space-y-1">
                          {method.limitations.slice(0, 3).map((limitation, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-semantic-warning mt-1 flex-shrink-0" />
                              <span className="text-sm text-academic-secondary">
                                {limitation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Method Specifications */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-academic-primary rounded-lg">
                      <div>
                        <div className="text-xs text-academic-muted uppercase">Timeframe</div>
                        <div className="text-sm font-medium text-academic-primary">{method.timeframe}</div>
                      </div>
                      <div>
                        <div className="text-xs text-academic-muted uppercase">Sample Size</div>
                        <div className="text-sm font-medium text-academic-primary">
                          {method.sampleSizeRange[0]}-{method.sampleSizeRange[1]}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-academic-muted uppercase">Ethics</div>
                        <div className="text-sm font-medium text-academic-primary capitalize">
                          {method.ethicsComplexity}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-academic-muted uppercase">Resources</div>
                        <div className="text-sm font-medium text-academic-primary">
                          {method.requiredResources.length} items
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-academic-muted">
                          Match: {method.suitabilityScore}% • {complexityInfo.description}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button className="academic-btn-outline text-xs py-1 px-3 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMethodologySelect?.(method);
                          }}
                          className={`text-xs py-1 px-3 flex items-center gap-1 ${
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
                  <div className={`p-2 rounded-lg ${severityInfo.bgColor}`}>
                    <SeverityIcon className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="academic-heading-section mb-0">{flaw.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs text-white ${severityInfo.bgColor}`}>
                        {severityInfo.label}
                      </span>
                      <span className="px-2 py-1 bg-academic-primary text-xs rounded capitalize">
                        {flaw.type}
                      </span>
                    </div>

                    <p className="academic-body-text text-sm text-academic-secondary mb-3">
                      {flaw.description}
                    </p>

                    {showFlawDetails === flaw.id && (
                      <div className="mb-4 p-3 bg-academic-primary rounded-lg">
                        <h4 className="text-sm font-medium text-academic-primary mb-2">
                          Detailed Explanation:
                        </h4>
                        <p className="text-sm text-academic-secondary mb-3">
                          {flaw.explanation}
                        </p>
                        <div className="p-2 bg-semantic-warning rounded border-l-4 border-semantic-warning">
                          <span className="text-sm font-medium text-academic-primary">Impact: </span>
                          <span className="text-sm text-academic-secondary">{flaw.impact}</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-academic-primary mb-2">
                        Suggested Solutions:
                      </h4>
                      <div className="space-y-1">
                        {flaw.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-academic-blue mt-1" />
                            <span className="text-sm text-academic-secondary">
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
                        className="text-xs text-academic-blue hover:text-academic-blue font-medium"
                      >
                        {showFlawDetails === flaw.id ? 'Hide Details' : 'Show Details'}
                      </button>

                      <div className="flex gap-2">
                        <button className="academic-btn-outline text-xs py-1 px-3 flex items-center gap-1">
                          <Book className="h-3 w-3" />
                          Learn More
                        </button>
                        <button
                          onClick={() => onFlawAddressed?.(flaw.id)}
                          className="academic-btn-primary text-xs py-1 px-3 flex items-center gap-1"
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
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-semantic-success mx-auto mb-4" />
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
                  <Calculator className="h-5 w-5 text-academic-blue" />
                  Power Analysis
                </h3>

                <div className="academic-grid-2 gap-4 mb-4">
                  <div className="p-3 bg-academic-primary rounded-lg">
                    <div className="text-sm text-academic-muted mb-1">Required Sample Size</div>
                    <div className="text-2xl font-bold text-academic-primary">
                      {statisticalPlan.powerAnalysis.requiredSampleSize}
                    </div>
                  </div>
                  <div className="p-3 bg-academic-primary rounded-lg">
                    <div className="text-sm text-academic-muted mb-1">Statistical Power</div>
                    <div className="text-2xl font-bold text-academic-primary">
                      {(statisticalPlan.powerAnalysis.power * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-academic-muted uppercase">Effect Size</div>
                    <div className="text-lg font-medium text-academic-primary">
                      {statisticalPlan.powerAnalysis.effectSize}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-academic-muted uppercase">Alpha Level</div>
                    <div className="text-lg font-medium text-academic-primary">
                      {statisticalPlan.powerAnalysis.alpha}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-academic-muted uppercase">Power</div>
                    <div className="text-lg font-medium text-academic-primary">
                      {statisticalPlan.powerAnalysis.power}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Plan */}
              <div className="academic-research-card">
                <h3 className="academic-heading-section mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-academic-blue" />
                  Analysis Plan
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-academic-primary mb-2">
                      Primary Analysis:
                    </h4>
                    <p className="text-sm text-academic-secondary p-3 bg-academic-primary rounded-lg">
                      {statisticalPlan.primaryAnalysis}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-academic-primary mb-2">
                      Secondary Analyses:
                    </h4>
                    <div className="space-y-1">
                      {statisticalPlan.secondaryAnalyses.map((analysis, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 text-academic-blue mt-1" />
                          <span className="text-sm text-academic-secondary">
                            {analysis}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-academic-primary mb-2">
                      Recommended Software:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {statisticalPlan.softwareRecommendations.map((software, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-academic-blue text-white text-xs rounded"
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
            <div className="text-center py-12">
              <Calculator className="h-16 w-16 text-academic-muted mx-auto mb-4" />
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
                <div className={`p-2 rounded-lg ${
                  ethics.priority === 'required' ? 'bg-semantic-error' :
                  ethics.priority === 'recommended' ? 'bg-semantic-warning' : 'bg-academic-blue'
                }`}>
                  <Shield className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="academic-heading-section mb-0">{ethics.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs text-white capitalize ${
                      ethics.priority === 'required' ? 'bg-semantic-error' :
                      ethics.priority === 'recommended' ? 'bg-semantic-warning' : 'bg-academic-blue'
                    }`}>
                      {ethics.priority}
                    </span>
                    <span className="px-2 py-1 bg-academic-primary text-xs rounded capitalize">
                      {ethics.category.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="academic-body-text text-sm text-academic-secondary mb-4">
                    {ethics.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-academic-primary mb-2">
                      Requirements:
                    </h4>
                    <div className="space-y-1">
                      {ethics.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-semantic-success mt-1" />
                          <span className="text-sm text-academic-secondary">
                            {requirement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {ethics.documentation.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-academic-primary mb-2">
                        Required Documentation:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ethics.documentation.map((doc, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-academic-primary text-xs rounded"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ethics.approvalNeeded && (
                    <div className="p-3 bg-semantic-warning rounded-lg border-l-4 border-semantic-warning">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-semantic-warning" />
                        <span className="text-sm font-medium text-academic-primary">
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
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-semantic-success mx-auto mb-4" />
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