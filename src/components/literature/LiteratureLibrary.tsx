/**
 * Literature Library Component
 *
 * Personal research library for organizing and managing saved literature.
 * Provides advanced organization, annotation, and collaboration features.
 *
 * Features:
 * - Personal paper library with collections
 * - Advanced tagging and categorization
 * - Annotation and note-taking system
 * - Citation network visualization
 * - Collaborative reading and sharing
 *
 * @location src/components/literature/LiteratureLibrary.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Folder,
  Tag,
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  Share2,
  Download,
  Edit3,
  Trash2,
  Plus,
  Star,
  Clock,
  Users,
  FileText,
  Quote,
  Link,
  MoreVertical,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LiteratureItem, LiteratureCollection, LiteratureNote } from '../../types/literature';

/**
 * Props for the LiteratureLibrary component
 */
export interface LiteratureLibraryProps {
  projectId?: string;
  papers?: LiteratureItem[];
  collections?: LiteratureCollection[];
  onPaperSelect?: (paper: LiteratureItem) => void;
  onCreateCollection?: (name: string, description?: string) => void;
  onAddNote?: (paperId: string, note: LiteratureNote) => void;
  onDeletePaper?: (paperId: string) => void;
  className?: string;
}

/**
 * Library view modes
 */
type ViewMode = 'grid' | 'list' | 'timeline';

/**
 * Sort options for papers
 */
type SortOption = 'title' | 'authors' | 'year' | 'relevance' | 'added' | 'citations';

/**
 * LiteratureLibrary component for managing research papers
 */
export const LiteratureLibrary: React.FC<LiteratureLibraryProps> = ({
  projectId,
  papers = [],
  collections = [],
  onPaperSelect,
  onCreateCollection,
  onAddNote,
  onDeletePaper,
  className,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [] as string[],
    yearRange: { start: 2020, end: new Date().getFullYear() },
    hasNotes: false,
    hasAnnotations: false,
    readStatus: 'all' as 'all' | 'read' | 'unread' | 'reading',
  });

  /**
   * Filter and sort papers
   */
  const filteredPapers = papers.filter(paper => {
    // Collection filter
    if (selectedCollection !== 'all') {
      const collection = collections.find(c => c.id === selectedCollection);
      if (!collection?.paperIds.includes(paper.id)) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = paper.title.toLowerCase().includes(query);
      const matchesAuthors = paper.authors.some(author =>
        author.toLowerCase().includes(query)
      );
      const matchesAbstract = paper.abstract?.toLowerCase().includes(query);
      const matchesTags = paper.tags.some(tag =>
        tag.toLowerCase().includes(query)
      );

      if (!matchesTitle && !matchesAuthors && !matchesAbstract && !matchesTags) {
        return false;
      }
    }

    // Tag filter
    if (filters.tags.length > 0) {
      if (!filters.tags.some(tag => paper.tags.includes(tag))) return false;
    }

    // Year filter
    if (paper.year < filters.yearRange.start || paper.year > filters.yearRange.end) {
      return false;
    }

    // Notes filter
    if (filters.hasNotes && (!paper.notes || paper.notes.length === 0)) {
      return false;
    }

    // Read status filter
    if (filters.readStatus !== 'all' && paper.readStatus !== filters.readStatus) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'authors':
        return a.authors[0]?.localeCompare(b.authors[0] || '') || 0;
      case 'year':
        return b.year - a.year;
      case 'citations':
        return b.citations - a.citations;
      case 'relevance':
        return b.relevanceScore - a.relevanceScore;
      case 'added':
      default:
        return new Date(b.addedAt || '').getTime() - new Date(a.addedAt || '').getTime();
    }
  });

  /**
   * Handle paper selection
   */
  const handlePaperSelect = (paper: LiteratureItem) => {
    onPaperSelect?.(paper);
  };

  /**
   * Handle bulk paper selection
   */
  const handlePaperToggle = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };

  /**
   * Get all unique tags from papers
   */
  const allTags = Array.from(new Set(papers.flatMap(paper => paper.tags)));

  /**
   * Render paper card
   */
  const renderPaperCard = (paper: LiteratureItem) => (
    <Card
      key={paper.id}
      className="p-4 cursor-pointer transition-all hover:shadow-md"
      onClick={() => handlePaperSelect(paper)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedPapers.has(paper.id)}
            onChange={(e) => {
              e.stopPropagation();
              handlePaperToggle(paper.id);
            }}
            className="rounded"
          />
          {paper.readStatus === 'read' && (
            <Badge variant="success" size="sm">Read</Badge>
          )}
          {paper.readStatus === 'reading' && (
            <Badge variant="warning" size="sm">Reading</Badge>
          )}
          {paper.openAccess && (
            <Badge variant="info" size="sm">Open Access</Badge>
          )}
        </div>

        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {paper.title}
      </h3>

      <p className="text-sm text-gray-600 mb-2">
        {paper.authors.slice(0, 3).join(', ')}
        {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
      </p>

      <p className="text-sm text-gray-600 mb-3">
        {paper.journal || paper.venue} • {paper.year}
      </p>

      {paper.abstract && (
        <p className="text-xs text-gray-700 line-clamp-3 mb-3">
          {paper.abstract}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{paper.citations} citations</span>
          {paper.notes && paper.notes.length > 0 && (
            <span className="flex items-center gap-1">
              <Edit3 className="h-3 w-3" />
              {paper.notes.length} notes
            </span>
          )}
          {paper.addedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(paper.addedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < (paper.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {paper.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-3">
          {paper.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
          {paper.tags.length > 3 && (
            <Badge variant="outline" size="sm">
              +{paper.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );

  /**
   * Render paper list item
   */
  const renderPaperListItem = (paper: LiteratureItem) => (
    <Card
      key={paper.id}
      className="p-4 cursor-pointer transition-all hover:shadow-sm"
      onClick={() => handlePaperSelect(paper)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selectedPapers.has(paper.id)}
            onChange={(e) => {
              e.stopPropagation();
              handlePaperToggle(paper.id);
            }}
            className="rounded"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {paper.title}
              </h3>
              {paper.readStatus === 'read' && (
                <Badge variant="success" size="sm">Read</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="truncate">
                {paper.authors.slice(0, 2).join(', ')}
                {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
              </span>
              <span>{paper.journal || paper.venue}</span>
              <span>{paper.year}</span>
              <span>{paper.citations} citations</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {paper.notes && paper.notes.length > 0 && (
            <Badge variant="outline" size="sm">
              {paper.notes.length} notes
            </Badge>
          )}

          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Literature Library
          </h2>
          <p className="text-gray-600">
            Organize and manage your research papers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Papers
          </Button>

          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-1" />
            Share Library
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Collections and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Collections</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateCollection?.('New Collection')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedCollection('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCollection === 'all'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>All Papers</span>
                  <Badge variant="secondary" size="sm">{papers.length}</Badge>
                </div>
              </button>

              {collections.map(collection => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCollection === collection.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{collection.name}</span>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {collection.paperIds.length}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Tags */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Quick Tags</h4>
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (filters.tags.includes(tag)) {
                        setFilters(prev => ({
                          ...prev,
                          tags: prev.tags.filter(t => t !== tag)
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          tags: [...prev.tags, tag]
                        }));
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Controls */}
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="added">Date Added</option>
                    <option value="title">Title</option>
                    <option value="authors">Authors</option>
                    <option value="year">Year</option>
                    <option value="citations">Citations</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>

                {selectedPapers.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedPapers.size} selected
                    </span>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button variant="outline" size="sm">
                      <Folder className="h-4 w-4 mr-1" />
                      Add to Collection
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* Papers Display */}
          <div>
            {filteredPapers.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPapers.map(renderPaperCard)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPapers.map(renderPaperListItem)}
                </div>
              )
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || filters.tags.length > 0 ? 'No matching papers' : 'No papers in this collection'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filters.tags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Start adding papers to build your research library'
                  }
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Papers
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Advanced Organization:
 *    - Hierarchical collections and subcollections
 *    - Smart collections based on AI analysis
 *    - Automatic tagging and categorization
 *    - Duplicate paper detection and merging
 *
 * 2. Annotation System:
 *    - PDF annotation and highlighting
 *    - Voice notes and transcription
 *    - Collaborative annotations
 *    - Cross-reference linking
 *
 * 3. Analysis Tools:
 *    - Citation network visualization
 *    - Research trend analysis
 *    - Author collaboration networks
 *    - Impact factor tracking
 *
 * 4. Integration Features:
 *    - Reference manager sync (Zotero, Mendeley)
 *    - Academic database imports
 *    - Social media sharing
 *    - Email and calendar integration
 *
 * 5. Collaboration Features:
 *    - Shared libraries and collections
 *    - Team reading lists
 *    - Discussion and review systems
 *    - Reading progress synchronization
 */