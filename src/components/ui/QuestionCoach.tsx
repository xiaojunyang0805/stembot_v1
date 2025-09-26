/**
 * Question Coach Component
 *
 * Interactive research question refinement with Socratic prompting and memory integration.
 * Guides users from vague ideas to specific, researchable questions.
 *
 * Features:
 * - Socratic prompting interface with AI coaching
 * - Question iteration history with progress tracking
 * - Memory-driven suggestions and context awareness
 * - Academic question quality assessment
 * - Interactive refinement workflow
 *
 * @location src/components/ui/QuestionCoach.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  History,
  TrendingUp,
  BookOpen,
  Search,
  Zap,
  RefreshCw,
} from 'lucide-react';

/**
 * Question quality levels
 */
export type QuestionQuality = 'vague' | 'developing' | 'focused' | 'specific' | 'research-ready';

/**
 * Question iteration interface
 */
export interface QuestionIteration {
  id: string;
  text: string;
  quality: QuestionQuality;
  score: number;
  timestamp: Date;
  feedback: string[];
  suggestions: string[];
  memoryContext?: string;
}

/**
 * Socratic prompt interface
 */
export interface SocraticPrompt {
  id: string;
  type: 'clarification' | 'scope' | 'methodology' | 'significance' | 'feasibility';
  question: string;
  purpose: string;
  followUps: string[];
}

/**
 * Memory-driven suggestion interface
 */
export interface MemorySuggestion {
  id: string;
  type: 'question_refinement' | 'scope_adjustment' | 'methodology_hint' | 'literature_gap';
  suggestion: string;
  confidence: number;
  source: 'previous_research' | 'literature_analysis' | 'field_knowledge' | 'methodology_patterns';
  actionable: boolean;
}

/**
 * Props for the QuestionCoach component
 */
export interface QuestionCoachProps {
  projectId: string;
  initialQuestion?: string;
  iterations: QuestionIteration[];
  memorySuggestions: MemorySuggestion[];
  onQuestionUpdate?: (question: string) => void;
  onIterationSave?: (iteration: QuestionIteration) => void;
  onRequestFeedback?: (question: string) => Promise<SocraticPrompt[]>;
  className?: string;
}

/**
 * QuestionCoach component for interactive question refinement
 */
export const QuestionCoach: React.FC<QuestionCoachProps> = ({
  projectId,
  initialQuestion = '',
  iterations,
  memorySuggestions,
  onQuestionUpdate,
  onIterationSave,
  onRequestFeedback,
  className,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPrompts, setCurrentPrompts] = useState<SocraticPrompt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState<string | null>(null);

  const qualityConfig = {
    vague: {
      color: 'text-semantic-error',
      bgColor: 'bg-semantic-error',
      label: 'Vague',
      description: 'Too broad or unclear for research',
      icon: AlertCircle,
    },
    developing: {
      color: 'text-semantic-warning',
      bgColor: 'bg-semantic-warning',
      label: 'Developing',
      description: 'Making progress but needs refinement',
      icon: RefreshCw,
    },
    focused: {
      color: 'text-academic-blue',
      bgColor: 'bg-academic-blue',
      label: 'Focused',
      description: 'Good direction, minor adjustments needed',
      icon: Target,
    },
    specific: {
      color: 'text-semantic-success',
      bgColor: 'bg-semantic-success',
      label: 'Specific',
      description: 'Well-defined and researchable',
      icon: CheckCircle,
    },
    'research-ready': {
      color: 'text-semantic-success',
      bgColor: 'bg-semantic-success',
      label: 'Research Ready',
      description: 'Excellent question ready for investigation',
      icon: CheckCircle,
    },
  };

  const getCurrentQuality = (): QuestionQuality => {
    if (!currentQuestion.trim()) return 'vague';

    const wordCount = currentQuestion.split(' ').length;
    const hasSpecifics = /\b(how|why|what|when|where|which)\b/i.test(currentQuestion);
    const hasScope = /\b(among|within|between|during|in)\b/i.test(currentQuestion);

    if (wordCount < 5) return 'vague';
    if (wordCount < 10 && !hasSpecifics) return 'developing';
    if (hasSpecifics && hasScope && wordCount > 15) return 'research-ready';
    if (hasSpecifics && wordCount > 10) return 'specific';
    if (hasSpecifics) return 'focused';

    return 'developing';
  };

  const currentQuality = getCurrentQuality();
  const qualityInfo = qualityConfig[currentQuality];
  const QualityIcon = qualityInfo.icon;

  const handleAnalyzeQuestion = async () => {
    if (!currentQuestion.trim() || !onRequestFeedback) return;

    setIsAnalyzing(true);
    try {
      const prompts = await onRequestFeedback(currentQuestion);
      setCurrentPrompts(prompts);
    } catch (error) {
      console.error('Failed to analyze question:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveIteration = () => {
    if (!currentQuestion.trim()) return;

    const iteration: QuestionIteration = {
      id: `iteration-${Date.now()}`,
      text: currentQuestion,
      quality: currentQuality,
      score: Math.min(90, (currentQuestion.split(' ').length * 3) +
        (currentQuality === 'research-ready' ? 30 :
         currentQuality === 'specific' ? 20 :
         currentQuality === 'focused' ? 10 : 0)),
      timestamp: new Date(),
      feedback: [],
      suggestions: [],
    };

    onIterationSave?.(iteration);
    onQuestionUpdate?.(currentQuestion);
  };

  const highConfidenceSuggestions = memorySuggestions.filter(s => s.confidence > 0.7);

  return (
    <div className={`academic-container ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-academic-blue rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="academic-heading-secondary mb-1">Research Question Coach</h2>
            <p className="academic-body-text text-academic-secondary">
              Refine your research question with AI-powered Socratic guidance
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4 p-4 bg-academic-primary rounded-lg">
          <QualityIcon className={`h-5 w-5 ${qualityInfo.color}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-academic-primary">
                Question Quality: {qualityInfo.label}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${qualityInfo.bgColor} text-white`}>
                {currentQuality === 'research-ready' ? '90+' :
                 currentQuality === 'specific' ? '70-89' :
                 currentQuality === 'focused' ? '50-69' : '< 50'}% Ready
              </span>
            </div>
            <p className="text-sm text-academic-secondary">
              {qualityInfo.description}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="academic-btn-outline flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History ({iterations.length})
          </button>
        </div>
      </div>

      {/* Question Input */}
      <div className="academic-research-card mb-6">
        <h3 className="academic-heading-section mb-4">Your Research Question</h3>

        <div className="space-y-4">
          <textarea
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Enter your research question... Start with 'How does...', 'What is the relationship between...', or 'Why do...'"
            className="w-full p-4 border border-academic-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-blue focus:border-transparent resize-none"
            rows={4}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-academic-muted">
                Words: {currentQuestion.split(' ').filter(w => w.length > 0).length}
              </span>
              <span className="text-sm text-academic-muted">
                Characters: {currentQuestion.length}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAnalyzeQuestion}
                disabled={!currentQuestion.trim() || isAnalyzing}
                className="academic-btn-outline flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Get Feedback'}
              </button>

              <button
                onClick={handleSaveIteration}
                disabled={!currentQuestion.trim()}
                className="academic-btn-primary flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Save Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Socratic Prompts */}
      {currentPrompts.length > 0 && (
        <div className="academic-research-card mb-6">
          <h3 className="academic-heading-section mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-academic-blue" />
            Coaching Questions
          </h3>

          <div className="space-y-4">
            {currentPrompts.map((prompt) => (
              <div key={prompt.id} className="p-4 bg-academic-primary rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-academic-blue rounded-lg mt-1">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-academic-primary mb-2">
                      {prompt.question}
                    </h4>
                    <p className="text-sm text-academic-secondary mb-3">
                      {prompt.purpose}
                    </p>

                    {prompt.followUps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-academic-muted uppercase">
                          Consider These Aspects:
                        </span>
                        {prompt.followUps.map((followUp, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-academic-blue" />
                            <span className="text-sm text-academic-primary">
                              {followUp}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Suggestions */}
      {highConfidenceSuggestions.length > 0 && (
        <div className="academic-memory-card mb-6">
          <h3 className="academic-heading-section mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-memory-purple" />
            Memory-Driven Suggestions
          </h3>

          <div className="space-y-3">
            {highConfidenceSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  focusedSuggestion === suggestion.id
                    ? 'border-memory-purple bg-memory-purple'
                    : 'border-memory-purple hover:border-memory-purple hover:bg-memory-purple'
                }`}
                onClick={() => setFocusedSuggestion(
                  focusedSuggestion === suggestion.id ? null : suggestion.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-academic-primary mb-2">
                      {suggestion.suggestion}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-memory-purple capitalize">
                        {suggestion.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${
                          suggestion.confidence > 0.8 ? 'bg-semantic-success' :
                          suggestion.confidence > 0.7 ? 'bg-semantic-warning' : 'bg-semantic-error'
                        }`} />
                        <span className="text-xs text-academic-muted">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  {suggestion.actionable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentQuestion(prev =>
                          prev + (prev.endsWith('.') || prev.endsWith('?') ? ' ' : '. ') +
                          suggestion.suggestion
                        );
                      }}
                      className="ml-3 p-1 text-memory-purple hover:bg-memory-purple rounded"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && iterations.length > 0 && (
        <div className="academic-project-card">
          <h3 className="academic-heading-section mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-academic-blue" />
            Question Evolution History
          </h3>

          <div className="space-y-4">
            {iterations.slice(-5).reverse().map((iteration, index) => {
              const iterationQuality = qualityConfig[iteration.quality];
              const IterationIcon = iterationQuality.icon;

              return (
                <div key={iteration.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-lg ${iterationQuality.bgColor}`}>
                      <IterationIcon className="h-4 w-4 text-white" />
                    </div>
                    {index < iterations.length - 1 && (
                      <div className="w-px h-8 bg-academic-primary mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-academic-primary">
                        {iterationQuality.label} - Score: {iteration.score}%
                      </span>
                      <span className="text-xs text-academic-muted">
                        {iteration.timestamp.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-academic-secondary mb-2">
                      "{iteration.text}"
                    </p>

                    <button
                      onClick={() => setCurrentQuestion(iteration.text)}
                      className="text-xs text-academic-blue hover:text-academic-blue font-medium"
                    >
                      Restore this version
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Suggestions */}
      <div className="mt-8 p-6 bg-academic-primary rounded-lg">
        <h3 className="academic-heading-section mb-4">Quick Actions</h3>
        <div className="academic-grid-2 gap-4">
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <Search className="h-4 w-4" />
            Research Similar Questions
          </button>
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <BookOpen className="h-4 w-4" />
            Find Related Literature
          </button>
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <Target className="h-4 w-4" />
            Scope Assessment
          </button>
          <button className="academic-btn-outline flex items-center gap-2 justify-center">
            <Zap className="h-4 w-4" />
            Generate Variations
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCoach;