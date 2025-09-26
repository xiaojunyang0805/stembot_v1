/**
 * Literature Search Component
 *
 * Advanced literature discovery and search interface with AI-powered recommendations.
 * Integrates with multiple academic databases and provides intelligent search assistance.
 *
 * Features:
 * - Multi-database search with unified results
 * - AI-powered search query optimization
 * - Semantic search and similarity matching
 * - Citation network analysis
 * - Research gap identification
 *
 * @location src/components/literature/LiteratureSearch.tsx
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  ExternalLink,
  Download,
  Star,
  Clock,
  TrendingUp,
  Brain,
  Network,
  Bookmark,
  Share2,
  MoreVertical,
  RefreshCw,
  Zap,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LiteratureItem, SearchFilters, DatabaseSource } from '../../types/literature';

/**
 * Props for the LiteratureSearch component
 */
export interface LiteratureSearchProps {
  projectId?: string;
  initialQuery?: string;
  onPaperSelect?: (paper: LiteratureItem) => void;
  onSaveToLibrary?: (paper: LiteratureItem) => void;
  onCiteReference?: (paper: LiteratureItem) => void;
  className?: string;
}

/**
 * Search result sorting options
 */
type SortOption = 'relevance' | 'citations' | 'date' | 'impact';

/**
 * LiteratureSearch component for academic literature discovery
 */
export const LiteratureSearch: React.FC<LiteratureSearchProps> = ({
  projectId,
  initialQuery = '',
  onPaperSelect,
  onSaveToLibrary,
  onCiteReference,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<LiteratureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<LiteratureItem | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    yearRange: { start: 2020, end: new Date().getFullYear() },
    sources: [],
    paperTypes: [],
    minCitations: 0,
    languages: ['en'],
  });
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [savedPapers, setSavedPapers] = useState<Set<string>>(new Set());
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Available database sources
   */
  const databaseSources: DatabaseSource[] = [
    {
      id: 'arxiv',
      name: 'arXiv',
      description: 'Preprint repository',
      url: 'https://arxiv.org',
      searchFields: ['title', 'author', 'abstract'],
      resultFormat: 'json' as const,
      isActive: true,
      enabled: true
    },
    {
      id: 'pubmed',
      name: 'PubMed',
      description: 'Biomedical literature',
      url: 'https://pubmed.ncbi.nlm.nih.gov',
      searchFields: ['title', 'author', 'abstract', 'mesh'],
      resultFormat: 'json' as const,
      isActive: true,
      enabled: true
    },
    {
      id: 'ieee',
      name: 'IEEE Xplore',
      description: 'Engineering and technology',
      url: 'https://ieeexplore.ieee.org',
      searchFields: ['title', 'author', 'abstract'],
      resultFormat: 'json' as const,
      isActive: false,
      enabled: false
    },
    {
      id: 'acm',
      name: 'ACM Digital Library',
      description: 'Computer science',
      url: 'https://dl.acm.org',
      searchFields: ['title', 'author', 'abstract'],
      resultFormat: 'json' as const,
      isActive: false,
      enabled: false
    },
    {
      id: 'springer',
      name: 'Springer',
      description: 'Academic publisher',
      url: 'https://link.springer.com',
      searchFields: ['title', 'author', 'abstract'],
      resultFormat: 'json' as const,
      isActive: false,
      enabled: false
    },
    {
      id: 'elsevier',
      name: 'ScienceDirect',
      description: 'Scientific database',
      url: 'https://www.sciencedirect.com',
      searchFields: ['title', 'author', 'abstract'],
      resultFormat: 'json' as const,
      isActive: false,
      enabled: false
    },
  ];

  /**
   * Perform literature search
   */
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual literature search API
      const response = await fetch('/api/literature/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters,
          sortBy,
          projectId,
          sources: databaseSources.filter(s => s.enabled).map(s => s.id),
        }),
      });

      if (response.ok) {
        const { results, suggestions } = await response.json();
        setSearchResults(results);
        setSearchSuggestions(suggestions || []);
      }
    } catch (error) {
      console.error('Literature search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, projectId, databaseSources]);

  /**
   * Handle search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  /**
   * Get AI-powered search suggestions
   */
  const getSearchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) return;

    try {
      const response = await fetch('/api/literature/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, projectId }),
      });

      if (response.ok) {
        const { suggestions } = await response.json();
        setSearchSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
    }
  }, [projectId]);

  /**
   * Handle paper selection
   */
  const handlePaperSelect = (paper: LiteratureItem) => {
    setSelectedPaper(paper);
    onPaperSelect?.(paper);
  };

  /**
   * Handle save to library
   */
  const handleSaveToLibrary = (paper: LiteratureItem) => {
    setSavedPapers(prev => new Set([...Array.from(prev), paper.id]));
    onSaveToLibrary?.(paper);
  };

  /**
   * Get citation count color
   */
  const getCitationColor = (citations: number) => {
    if (citations >= 100) return 'text-green-600';
    if (citations >= 50) return 'text-blue-600';
    if (citations >= 10) return 'text-orange-600';
    return 'text-gray-600';
  };

  /**
   * Format publication year
   */
  const formatYear = (year: number) => {
    const currentYear = new Date().getFullYear();
    const yearsAgo = currentYear - year;
    if (yearsAgo === 0) return 'This year';
    if (yearsAgo === 1) return 'Last year';
    return `${yearsAgo} years ago`;
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Literature Search
          </h2>
          <p className="text-gray-600">
            Discover relevant academic literature with AI-powered search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Interface */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter research keywords, topics, or specific questions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                getSearchSuggestions(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => getSearchSuggestions(searchQuery)}
                title="Get AI suggestions"
              >
                <Brain className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Suggestions:</span>
              {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Quick Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="citations">Citations</option>
                <option value="date">Publication Date</option>
                <option value="impact">Impact Factor</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sources:</span>
              {databaseSources.filter(s => s.enabled).map(source => (
                <Badge key={source.id} variant="secondary" size="sm">
                  {source.name}
                </Badge>
              ))}
            </div>
          </div>
        </form>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Year
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.yearRange?.start ?? 2020}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    yearRange: {
                      start: parseInt(e.target.value),
                      end: prev.yearRange?.end ?? new Date().getFullYear()
                    }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={filters.yearRange?.end ?? new Date().getFullYear()}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    yearRange: {
                      start: prev.yearRange?.start ?? 2020,
                      end: parseInt(e.target.value)
                    }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Citation Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Citations
              </label>
              <input
                type="number"
                value={filters.minCitations}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minCitations: parseInt(e.target.value) || 0
                }))}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                min="0"
              />
            </div>

            {/* Paper Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Types
              </label>
              <div className="space-y-1">
                {['journal', 'conference', 'preprint', 'review'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.paperTypes?.includes(type) ?? false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            paperTypes: [...(prev.paperTypes ?? []), type]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            paperTypes: (prev.paperTypes ?? []).filter(t => t !== type)
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
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Searching Academic Literature
            </h3>
            <p className="text-gray-600">
              AI is analyzing multiple databases to find relevant papers...
            </p>
          </Card>
        ) : searchResults.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({searchResults.length})
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Network className="h-4 w-4 mr-1" />
                  Citation Network
                </Button>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-1" />
                  Find Gaps
                </Button>
              </div>
            </div>

            {searchResults.map((paper) => (
              <Card
                key={paper.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedPaper?.id === paper.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handlePaperSelect(paper)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2">
                        {paper.title}
                      </h4>
                      {paper.openAccess && (
                        <Badge variant="success" size="sm">
                          Open Access
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <span>{paper.authors.slice(0, 3).join(', ')}</span>
                      {paper.authors.length > 3 && <span>+{paper.authors.length - 3} more</span>}
                      <span>•</span>
                      <span>{paper.journal || paper.venue}</span>
                      <span>•</span>
                      <span>{paper.year}</span>
                    </div>

                    {paper.abstract && (
                      <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                        {paper.abstract}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm ${getCitationColor(paper.citations)}`}>
                          {paper.citations} citations
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {paper.relevanceScore.toFixed(2)} relevance
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatYear(paper.year)}
                        </span>
                      </div>

                      {paper.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveToLibrary(paper);
                      }}
                      className={savedPapers.has(paper.id) ? 'text-blue-600' : ''}
                    >
                      <Bookmark className={`h-4 w-4 ${savedPapers.has(paper.id) ? 'fill-current' : ''}`} />
                    </Button>

                    {paper.doi && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://doi.org/${paper.doi}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCiteReference?.(paper);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : searchQuery ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find relevant literature.
            </p>
            <Button onClick={() => getSearchSuggestions(searchQuery)}>
              <Brain className="h-4 w-4 mr-1" />
              Get AI Suggestions
            </Button>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Your Literature Search
            </h3>
            <p className="text-gray-600">
              Enter keywords or research questions to discover relevant academic papers.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Database Integration:
 *    - Multiple academic database APIs (PubMed, arXiv, IEEE, ACM, etc.)
 *    - Real-time search result aggregation
 *    - Citation network analysis
 *    - Full-text PDF access when available
 *
 * 2. AI-Powered Features:
 *    - Semantic search using embeddings
 *    - Research gap identification
 *    - Automated literature review generation
 *    - Citation recommendation engine
 *
 * 3. Advanced Search Features:
 *    - Boolean query support
 *    - Field-specific searches (author, title, abstract)
 *    - Related paper discovery
 *    - Search history and saved searches
 *
 * 4. Collaboration Tools:
 *    - Shared literature libraries
 *    - Collaborative annotation
 *    - Team recommendation systems
 *    - Literature discussion threads
 *
 * 5. Export and Integration:
 *    - Reference manager integration (Zotero, Mendeley)
 *    - Citation formatting (APA, MLA, Chicago, etc.)
 *    - Bibliography generation
 *    - PDF annotation and highlighting
 */