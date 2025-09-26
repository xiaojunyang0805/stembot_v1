/**
 * Memory Timeline Component
 *
 * Temporal visualization of research project memories with interactive timeline.
 * Shows memory evolution, key insights, and research progress over time.
 *
 * Features:
 * - Interactive timeline with zoom and pan
 * - Memory clustering by time periods
 * - Research milestone integration
 * - Context-aware memory highlighting
 * - Progress tracking visualization
 *
 * @location src/components/memory/MemoryTimeline.tsx
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MemoryItem, MemoryTimelineEntry, TimelinePeriod } from '../../types/memory';
import { ProjectMilestone } from '../../types/research-project';

/**
 * Props for the MemoryTimeline component
 */
export interface MemoryTimelineProps {
  projectId: string;
  memories: MemoryItem[];
  milestones?: ProjectMilestone[];
  onMemorySelect?: (memory: MemoryItem) => void;
  onPeriodSelect?: (period: TimelinePeriod) => void;
  onCreateMemory?: (date: Date) => void;
  className?: string;
}

/**
 * Timeline view mode types
 */
type TimelineViewMode = 'daily' | 'weekly' | 'monthly' | 'milestone';

/**
 * Timeline zoom level
 */
type ZoomLevel = 'week' | 'month' | 'quarter' | 'year';

/**
 * MemoryTimeline component for temporal memory visualization
 */
export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  projectId,
  memories,
  milestones = [],
  onMemorySelect,
  onPeriodSelect,
  onCreateMemory,
  className,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<TimelineViewMode>('weekly');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    importance: { min: 0, max: 1 },
    showMilestones: true,
  });

  /**
   * Group memories by date for timeline visualization
   */
  const timelineEntries = useMemo(() => {
    const entries: MemoryTimelineEntry[] = [];

    // Group memories by date
    const memoryGroups = memories.reduce((groups, memory) => {
      const date = new Date(memory.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(memory);
      return groups;
    }, {} as Record<string, MemoryItem[]>);

    // Create timeline entries
    Object.entries(memoryGroups).forEach(([dateStr, dayMemories]) => {
      const date = new Date(dateStr);

      // Filter memories based on current filters
      const filteredMemories = dayMemories.filter(memory => {
        if (filters.types.length > 0 && !filters.types.includes(memory.type)) {
          return false;
        }
        if (memory.importance < filters.importance.min || memory.importance > filters.importance.max) {
          return false;
        }
        return true;
      });

      if (filteredMemories.length > 0) {
        entries.push({
          id: `timeline-${dateStr}`,
          timestamp: date,
          event: `Research session with ${filteredMemories.length} memories`,
          insights: [],
          context: `Memory session on ${dateStr}`,
          date,
          memories: filteredMemories,
          totalMemories: filteredMemories.length,
          averageImportance: filteredMemories.reduce((sum, m) => sum + m.importance, 0) / filteredMemories.length,
          types: Array.from(new Set(filteredMemories.map(m => m.type))),
          milestone: milestones.find(m =>
            new Date(m.createdAt).toDateString() === dateStr
          ),
        });
      }
    });

    // Sort by date
    return entries.sort((a, b) => (a.date ?? a.timestamp).getTime() - (b.date ?? b.timestamp).getTime());
  }, [memories, milestones, filters]);

  /**
   * Get date range for current view
   */
  const getDateRange = () => {
    const now = selectedDate;
    let start: Date, end: Date;

    switch (zoomLevel) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(now);
        end = new Date(now);
    }

    return { start, end };
  };

  /**
   * Navigate timeline
   */
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);

    switch (zoomLevel) {
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }

    setSelectedDate(newDate);
  };

  /**
   * Handle memory selection
   */
  const handleMemorySelect = (memory: MemoryItem) => {
    setSelectedMemory(memory);
    onMemorySelect?.(memory);
  };

  /**
   * Get color for memory type
   */
  const getMemoryTypeColor = (type: string) => {
    const colors = {
      factual: 'bg-blue-100 border-blue-300 text-blue-800',
      procedural: 'bg-green-100 border-green-300 text-green-800',
      contextual: 'bg-purple-100 border-purple-300 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  /**
   * Render timeline entry
   */
  const renderTimelineEntry = (entry: MemoryTimelineEntry) => (
    <div key={(entry.date ?? entry.timestamp).toISOString()} className="relative">
      {/* Timeline connector */}
      <div className="absolute left-6 top-8 w-0.5 h-full bg-gray-200" />

      {/* Timeline node */}
      <div className="flex items-start gap-4">
        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
          entry.milestone ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-300'
        }`}>
          {entry.milestone ? (
            <Target className="h-5 w-5 text-yellow-600" />
          ) : (
            <Brain className="h-5 w-5 text-gray-600" />
          )}
        </div>

        <div className="flex-1 min-w-0 pb-8">
          {/* Date header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {(entry.date ?? entry.timestamp).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{entry.totalMemories ?? entry.memories.length} memories</span>
                <span>Avg importance: {((entry.averageImportance ?? 0) * 100).toFixed(0)}%</span>
                {entry.milestone && (
                  <Badge variant="warning" size="sm">
                    Milestone: {entry.milestone.title}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateMemory?.(entry.date ?? entry.timestamp)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Memory cards */}
          <div className="space-y-2">
            {entry.memories.map((memory) => (
              <Card
                key={memory.id}
                className={`p-3 cursor-pointer transition-all hover:shadow-md border-l-4 ${
                  getMemoryTypeColor(memory.type)
                } ${selectedMemory?.id === memory.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleMemorySelect(memory)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" size="sm">
                        {memory.type}
                      </Badge>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < memory.importance * 5 ? 'bg-yellow-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(memory.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 line-clamp-2 mb-1">
                      {memory.content}
                    </p>

                    {memory.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {memory.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                        {memory.tags.length > 3 && (
                          <Badge variant="outline" size="sm">
                            +{memory.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const { start, end } = getDateRange();
  const visibleEntries = timelineEntries.filter(
    entry => (entry.date ?? entry.timestamp) >= start && (entry.date ?? entry.timestamp) <= end
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Memory Timeline
          </h2>
          <p className="text-sm text-gray-600">
            Track your research memories and milestones over time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTimeline('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center min-w-48">
              <div className="font-semibold text-gray-900">
                {start.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="text-sm text-gray-600">
                {start.toLocaleDateString()} - {end.toLocaleDateString()}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTimeline('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
            {(['week', 'month', 'quarter', 'year'] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  zoomLevel === level
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {visibleEntries.length > 0 ? (
          <div className="space-y-0">
            {visibleEntries.map(renderTimelineEntry)}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No memories in this period
            </h3>
            <p className="text-gray-600 mb-4">
              Start creating memories to see them appear on your timeline
            </p>
            <Button onClick={() => onCreateMemory?.(new Date())}>
              <Plus className="h-4 w-4 mr-1" />
              Create Memory
            </Button>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {visibleEntries.reduce((sum, entry) => sum + (entry.totalMemories ?? entry.memories.length), 0)}
            </div>
            <div className="text-xs text-gray-600">Memories This Period</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {visibleEntries.filter(entry => entry.milestone).length}
            </div>
            <div className="text-xs text-gray-600">Milestones Reached</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {visibleEntries.length}
            </div>
            <div className="text-xs text-gray-600">Active Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {visibleEntries.length > 0
                ? (visibleEntries.reduce((sum, entry) => sum + (entry.averageImportance ?? 0), 0) / visibleEntries.length * 100).toFixed(0)
                : 0}%
            </div>
            <div className="text-xs text-gray-600">Avg Importance</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Advanced Timeline Features:
 *    - Interactive zooming and panning
 *    - Memory density heatmap overlay
 *    - Research velocity tracking
 *    - Milestone dependency visualization
 *
 * 2. Smart Filtering:
 *    - AI-powered memory relevance scoring
 *    - Context-aware memory grouping
 *    - Research phase correlation
 *    - Topic-based memory clustering
 *
 * 3. Export and Sharing:
 *    - Timeline export to various formats
 *    - Memory report generation
 *    - Research progress visualization
 *    - Collaborative timeline sharing
 *
 * 4. Performance Optimization:
 *    - Virtual scrolling for large timelines
 *    - Memory content lazy loading
 *    - Timeline data caching
 *    - Smooth animations and transitions
 */