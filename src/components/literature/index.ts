/**
 * Literature Components Export Index
 *
 * Centralized exports for all literature review components.
 * Provides clean imports for literature search and management UI.
 *
 * @location src/components/literature/index.ts
 */

// Literature search and discovery components
export { LiteratureSearch } from './LiteratureSearch';
export { LiteratureLibrary } from './LiteratureLibrary';

// Re-export types for convenience
export type {
  LiteratureItem,
  LiteratureCollection,
  LiteratureNote,
  SearchFilters,
  DatabaseSource,
} from '../../types/literature';

/**
 * TODO: Additional literature components to implement
 *
 * 1. LiteratureCitationNetwork - Interactive citation network visualization
 * 2. LiteratureAnalyzer - AI-powered literature analysis and insights
 * 3. LiteratureAnnotator - PDF annotation and note-taking interface
 * 4. LiteratureReviewGenerator - Automated literature review drafting
 * 5. LiteratureCitationManager - Citation formatting and bibliography tools
 * 6. LiteratureGapFinder - Research gap identification and analysis
 * 7. LiteratureMetrics - Impact factor and citation analysis
 * 8. LiteratureExporter - Export tools for various reference formats
 * 9. LiteratureCollaboration - Team literature sharing and discussion
 * 10. LiteratureTimeline - Historical development tracking
 */