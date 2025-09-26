/**
 * Methodology Components Export Index
 *
 * Centralized exports for all methodology planning components.
 * Provides clean imports for research methodology design UI.
 *
 * @location src/components/methodology/index.ts
 */

// Methodology planning components
export { MethodologyDesigner } from './MethodologyDesigner';

// Re-export types for convenience
export type {
  MethodologyDesign,
  MethodologyTemplate,
  MethodologyValidation,
  ResearchMethod,
  DataCollectionPlan,
  AnalysisStrategy,
} from '../../types/methodology';

/**
 * TODO: Additional methodology components to implement
 *
 * 1. MethodologyTemplateLibrary - Pre-built methodology templates
 * 2. MethodologyValidator - Comprehensive validation system
 * 3. EthicsComplianceChecker - Ethics and IRB compliance tools
 * 4. DataCollectionPlanner - Detailed data collection planning
 * 5. AnalysisStrategyBuilder - Analysis technique selection
 * 6. MethodologyExporter - Export to various formats
 * 7. FeasibilityAnalyzer - Resource and timeline analysis
 * 8. MethodologyCollaboration - Team methodology development
 */