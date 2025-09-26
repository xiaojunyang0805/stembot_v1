/**
 * Memory Components Export Index
 *
 * Centralized exports for all memory system components.
 * Provides clean imports for memory-related UI components.
 *
 * @location src/components/memory/index.ts
 */

// Existing components
export { ContextRecall } from './ContextRecall';
export { MemoryHub } from './MemoryHub';
export { SessionContinuity } from './SessionContinuity';

// New research mentoring components
export { MemoryNavigator } from './MemoryNavigator';
export { MemoryTimeline } from './MemoryTimeline';

// Re-export types for convenience
export type {
  MemoryItem,
  MemoryCluster,
  MemorySearchFilters,
  MemoryTimelineEntry,
  TimelinePeriod,
} from '../../types/memory';

/**
 * TODO: Additional memory components to implement
 *
 * 1. MemoryGraph - Interactive network visualization of memory connections
 * 2. MemorySearch - Advanced search interface with AI-powered suggestions
 * 3. MemoryAnalytics - Memory usage patterns and insights dashboard
 * 4. MemoryExport - Export memory data in various formats
 * 5. MemoryImport - Import memory data from external sources
 * 6. MemoryBackup - Backup and restore memory systems
 * 7. MemoryCollaboration - Shared memory spaces for team research
 * 8. MemoryTemplate - Pre-configured memory structures for research types
 */