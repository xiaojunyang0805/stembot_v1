/**
 * Literature Review Component
 *
 * Advanced source management with AI-powered credibility scoring and gap analysis.
 * Curates and organizes research sources with memory-driven recommendations.
 *
 * Features:
 * - Curated top 5 sources display with credibility scoring
 * - AI-powered gap analysis visualization
 * - Memory-stored source organization and recall
 * - Academic credibility assessment with explanations
 * - Interactive source management workflow
 *
 * @location src/components/ui/LiteratureReview.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  Brain,
  Search,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  Users,
  Quote,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';

/**
 * Source credibility levels
 */
export type CredibilityLevel = 'high' | 'medium' | 'low' | 'questionable';

/**
 * Research source interface
 */
export interface ResearchSource {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  abstract: string;
  credibilityScore: number;
  credibilityLevel: CredibilityLevel;
  credibilityFactors: {
    peerReviewed: boolean;
    impactFactor?: number;
    citationCount: number;
    authorReputation: number;
    recency: number;
    methodology: number;
  };
  relevanceScore: number;
  tags: string[];
  notes?: string;
  keyFindings: string[];
  memoryContext?: {
    addedDate: Date;
    readingProgress: number;
    highlights: string[];
    connections: string[];
  };
}

/**
 * Literature gap interface
 */
export interface LiteratureGap {
  id: string;
  type: 'methodology' | 'population' | 'timeframe' | 'geographic' | 'theoretical';
  title: string;
  description: string;
  severity: 'critical' | 'important' | 'minor';
  suggestions: string[];
  potentialSources?: ResearchSource[];
}

/**
 * Search filter interface
 */
export interface SearchFilters {
  yearRange: [number, number];
  credibilityLevel: CredibilityLevel[];
  sourceType: ('journal' | 'conference' | 'book' | 'thesis' | 'report')[];
  tags: string[];
  peerReviewed: boolean;
}

/**
 * Props for the LiteratureReview component
 */
export interface LiteratureReviewProps {
  projectId: string;
  sources: ResearchSource[];
  gaps: LiteratureGap[];
  onSourceAdd?: (source: ResearchSource) => void;
  onSourceUpdate?: (sourceId: string, updates: Partial<ResearchSource>) => void;
  onSearchSources?: (query: string, filters: SearchFilters) => Promise<ResearchSource[]>;
  onGapAnalysis?: () => Promise<LiteratureGap[]>;
  className?: string;
}

/**
 * LiteratureReview component for source management and analysis
 */
export const LiteratureReview: React.FC<LiteratureReviewProps> = ({
  projectId,
  sources,
  gaps,
  onSourceAdd,
  onSourceUpdate,
  onSearchSources,
  onGapAnalysis,
  className,
}) => {
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'gaps' | 'search'>('sources');
  const [filters, setFilters] = useState<SearchFilters>({
    yearRange: [2019, 2024],
    credibilityLevel: ['high', 'medium'],
    sourceType: ['journal', 'conference'],
    tags: [],
    peerReviewed: true,
  });

  const credibilityConfig = {
    high: {
      color: 'text-semantic-success',
      bgColor: 'bg-semantic-success',
      icon: Shield,
      label: 'High',
      description: 'Peer-reviewed, high-impact, well-cited',
      minScore: 80,
    },
    medium: {
      color: 'text-academic-blue',
      bgColor: 'bg-academic-blue',
      icon: CheckCircle,
      label: 'Medium',
      description: 'Reputable source with good methodology',
      minScore: 60,
    },
    low: {
      color: 'text-semantic-warning',
      bgColor: 'bg-semantic-warning',
      icon: AlertTriangle,
      label: 'Low',
      description: 'Limited peer review or impact',
      minScore: 40,
    },
    questionable: {
      color: 'text-semantic-error',
      bgColor: 'bg-semantic-error',
      icon: AlertTriangle,
      label: 'Questionable',
      description: 'Predatory journal or poor methodology',
      minScore: 0,
    },
  };

  // Get top 5 sources by combined credibility and relevance
  const topSources = sources
    .sort((a, b) => (b.credibilityScore + b.relevanceScore) - (a.credibilityScore + a.relevanceScore))
    .slice(0, 5);

  const criticalGaps = gaps.filter(gap => gap.severity === 'critical');

  const handleSearch = async () => {
    if (!searchQuery.trim() || !onSearchSources) return;

    setIsSearching(true);
    try {
      const results = await onSearchSources(searchQuery, filters);
      // Handle search results
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getCredibilityInfo = (score: number): typeof credibilityConfig[CredibilityLevel] => {
    if (score >= 80) return credibilityConfig.high;
    if (score >= 60) return credibilityConfig.medium;
    if (score >= 40) return credibilityConfig.low;
    return credibilityConfig.questionable;
  };

  return (
    <div className={`academic-container ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-academic-blue rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="academic-heading-secondary mb-1">Literature Review</h2>
            <p className="academic-body-text text-academic-secondary">
              Curated sources with AI-powered credibility assessment and gap analysis
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="academic-grid-3 gap-4">
          <div className="p-4 bg-academic-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-academic-blue" />
              <span className="font-medium text-academic-primary">Total Sources</span>
            </div>
            <div className="text-2xl font-bold text-academic-primary">{sources.length}</div>
            <div className="text-sm text-academic-secondary">
              {topSources.length} high-priority sources
            </div>
          </div>

          <div className="p-4 bg-academic-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-semantic-success" />
              <span className="font-medium text-academic-primary">Avg. Credibility</span>
            </div>
            <div className="text-2xl font-bold text-academic-primary">
              {sources.length > 0 ? Math.round(sources.reduce((sum, s) => sum + s.credibilityScore, 0) / sources.length) : 0}%
            </div>
            <div className="text-sm text-academic-secondary">
              {sources.filter(s => s.credibilityLevel === 'high').length} high-credibility sources
            </div>
          </div>

          <div className="p-4 bg-academic-primary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-semantic-warning" />
              <span className="font-medium text-academic-primary">Literature Gaps</span>
            </div>
            <div className="text-2xl font-bold text-academic-primary">{gaps.length}</div>
            <div className="text-sm text-academic-secondary">
              {criticalGaps.length} critical gaps identified
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-academic-primary">
          <nav className="flex space-x-8">
            {[
              { id: 'sources', label: 'Top Sources', icon: Star },
              { id: 'gaps', label: 'Gap Analysis', icon: Target },
              { id: 'search', label: 'Source Search', icon: Search },
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

      {/* Top Sources Tab */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {topSources.map((source, index) => {
            const credibilityInfo = getCredibilityInfo(source.credibilityScore);
            const CredibilityIcon = credibilityInfo.icon;

            return (
              <div key={source.id} className="academic-research-card">
                <div className="flex items-start gap-4">
                  {/* Ranking Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-semantic-warning' :
                    index === 1 ? 'bg-academic-primary' :
                    index === 2 ? 'bg-academic-primary' : 'bg-academic-muted'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    {/* Source Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="academic-heading-section mb-2 line-clamp-2">
                          {source.title}
                        </h3>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm text-academic-primary">
                            {source.authors.slice(0, 3).join(', ')}
                            {source.authors.length > 3 && ` et al.`}
                          </span>
                          <span className="text-sm text-academic-muted">
                            {source.year}
                          </span>
                          {source.journal && (
                            <span className="text-sm text-academic-blue">
                              {source.journal}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Credibility Badge */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${credibilityInfo.bgColor} text-white`}>
                          <CredibilityIcon className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {credibilityInfo.label}
                          </span>
                          <span className="text-xs">
                            {source.credibilityScore}%
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedSource(selectedSource?.id === source.id ? null : source)}
                          className="p-2 hover:bg-academic-primary rounded-lg"
                        >
                          <Eye className="h-4 w-4 text-academic-muted" />
                        </button>
                      </div>
                    </div>

                    {/* Abstract Preview */}
                    <p className="academic-body-text text-sm text-academic-secondary mb-3 line-clamp-3">
                      {source.abstract}
                    </p>

                    {/* Key Findings */}
                    {source.keyFindings.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-academic-primary mb-2">
                          Key Findings:
                        </h4>
                        <div className="space-y-1">
                          {source.keyFindings.slice(0, 2).map((finding, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Quote className="h-3 w-3 text-academic-blue mt-1 flex-shrink-0" />
                              <span className="text-sm text-academic-secondary">
                                {finding}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-academic-blue" />
                          <span className="text-sm text-academic-muted">
                            Relevance: {source.relevanceScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-academic-muted" />
                          <span className="text-sm text-academic-muted">
                            {source.credibilityFactors.citationCount} citations
                          </span>
                        </div>
                        {source.memoryContext && (
                          <div className="flex items-center gap-1">
                            <Brain className="h-4 w-4 text-memory-purple" />
                            <span className="text-sm text-memory-purple">
                              {source.memoryContext.readingProgress}% read
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {source.url && (
                          <button className="academic-btn-outline text-xs py-1 px-3 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            View
                          </button>
                        )}
                        <button className="academic-btn-outline text-xs py-1 px-3 flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedSource?.id === source.id && (
                      <div className="mt-4 pt-4 border-t border-academic-primary">
                        <div className="academic-grid-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-academic-primary mb-2">
                              Credibility Factors:
                            </h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Peer Reviewed:</span>
                                <span className={source.credibilityFactors.peerReviewed ? 'text-semantic-success' : 'text-semantic-error'}>
                                  {source.credibilityFactors.peerReviewed ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Author Reputation:</span>
                                <span>{source.credibilityFactors.authorReputation}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Methodology Score:</span>
                                <span>{source.credibilityFactors.methodology}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Recency Score:</span>
                                <span>{source.credibilityFactors.recency}/100</span>
                              </div>
                            </div>
                          </div>

                          {source.memoryContext && (
                            <div>
                              <h4 className="text-sm font-medium text-academic-primary mb-2">
                                Reading Progress:
                              </h4>
                              <div className="progress-bar h-2 mb-2">
                                <div
                                  className="progress-fill bg-memory-purple"
                                  style={{ width: `${source.memoryContext.readingProgress}%` }}
                                />
                              </div>
                              <div className="text-xs text-academic-muted">
                                Added: {source.memoryContext.addedDate.toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-academic-primary rounded-lg">
                          <p className="academic-caption">
                            <strong>Credibility Assessment:</strong> {credibilityInfo.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-academic-muted mx-auto mb-4" />
              <h3 className="academic-heading-section text-academic-muted mb-2">
                No sources added yet
              </h3>
              <p className="text-academic-secondary mb-4">
                Start building your literature review by searching for relevant sources
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="academic-btn-primary"
              >
                Search Sources
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gap Analysis Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          {gaps.map((gap) => (
            <div key={gap.id} className="academic-research-card">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  gap.severity === 'critical' ? 'bg-semantic-error' :
                  gap.severity === 'important' ? 'bg-semantic-warning' : 'bg-academic-blue'
                }`}>
                  <Target className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="academic-heading-section mb-0">{gap.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs text-white capitalize ${
                      gap.severity === 'critical' ? 'bg-semantic-error' :
                      gap.severity === 'important' ? 'bg-semantic-warning' : 'bg-academic-blue'
                    }`}>
                      {gap.severity}
                    </span>
                    <span className="px-2 py-1 bg-academic-primary text-xs rounded capitalize">
                      {gap.type}
                    </span>
                  </div>

                  <p className="academic-body-text text-sm text-academic-secondary mb-4">
                    {gap.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-academic-primary mb-2">
                      Suggestions to Address:
                    </h4>
                    <div className="space-y-1">
                      {gap.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-academic-blue mt-1" />
                          <span className="text-sm text-academic-secondary">
                            {suggestion}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {gap.potentialSources && gap.potentialSources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-academic-primary mb-2">
                        Potential Sources:
                      </h4>
                      <div className="space-y-2">
                        {gap.potentialSources.slice(0, 3).map((source) => (
                          <div key={source.id} className="flex items-center justify-between p-2 bg-academic-primary rounded">
                            <span className="text-sm text-academic-primary line-clamp-1">
                              {source.title}
                            </span>
                            <button className="academic-btn-outline text-xs py-1 px-2">
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {gaps.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-academic-muted mx-auto mb-4" />
              <h3 className="academic-heading-section text-academic-muted mb-2">
                No gaps identified yet
              </h3>
              <p className="text-academic-secondary mb-4">
                Add more sources to enable comprehensive gap analysis
              </p>
              <button
                onClick={onGapAnalysis}
                className="academic-btn-primary"
              >
                Analyze Gaps
              </button>
            </div>
          )}
        </div>
      )}

      {/* Source Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Interface */}
          <div className="academic-research-card">
            <h3 className="academic-heading-section mb-4">Source Search</h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for research papers, authors, or keywords..."
                    className="w-full p-3 border border-academic-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-blue focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="academic-btn-outline flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="academic-btn-primary flex items-center gap-2"
                >
                  {isSearching ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="p-4 bg-academic-primary rounded-lg">
                  <div className="academic-grid-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-academic-primary mb-2">
                        Publication Year Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={filters.yearRange[0]}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            yearRange: [parseInt(e.target.value), prev.yearRange[1]]
                          }))}
                          className="w-20 p-2 border border-academic-primary rounded text-sm"
                        />
                        <span className="py-2">to</span>
                        <input
                          type="number"
                          value={filters.yearRange[1]}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            yearRange: [prev.yearRange[0], parseInt(e.target.value)]
                          }))}
                          className="w-20 p-2 border border-academic-primary rounded text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-academic-primary mb-2">
                        Source Type
                      </label>
                      <div className="space-y-1">
                        {['journal', 'conference', 'book', 'thesis'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.sourceType.includes(type as any)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    sourceType: [...prev.sourceType, type as any]
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    sourceType: prev.sourceType.filter(t => t !== type)
                                  }));
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results Placeholder */}
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-academic-muted mx-auto mb-4" />
            <h3 className="academic-heading-section text-academic-muted mb-2">
              Search Academic Sources
            </h3>
            <p className="text-academic-secondary">
              Enter keywords to find relevant research papers and sources
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteratureReview;