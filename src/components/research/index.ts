/**
 * Research Components Export Index
 *
 * Centralized exports for all research process components.
 * Provides clean imports for research workflow and management UI.
 *
 * @location src/components/research/index.ts
 */

// Existing components
export { ProjectCard } from './ProjectCard';
export { ProjectWizard } from './ProjectWizard';
export { ResearchProgress } from './ResearchProgress';

// New research mentoring components
export { ResearchWorkflow } from './ResearchWorkflow';
export { ResearchInsights } from './ResearchInsights';

// Re-export types for convenience
export type {
  ResearchProject,
  ResearchStage,
  ProjectMilestone,
  ProjectDeadline,
  ResearchSession,
  ProjectCollaboration,
} from '../../types/research-project';

export type {
  ResearchInsight,
  ResearchAnalytics,
  InsightType,
} from './ResearchInsights';

/**
 * TODO: Additional research components to implement
 *
 * 1. ResearchPlanner - Advanced project planning with AI assistance
 * 2. ResearchCollaboration - Team collaboration and communication tools
 * 3. ResearchValidation - Methodology and result validation systems
 * 4. ResearchPublication - Publication preparation and submission tools
 * 5. ResearchArchive - Project archiving and knowledge preservation
 * 6. ResearchTemplate - Pre-configured research project templates
 * 7. ResearchMetrics - Advanced analytics and performance metrics
 * 8. ResearchIntegration - External tool and service integrations
 * 9. ResearchEthics - Ethics compliance and approval management
 * 10. ResearchFunding - Grant application and funding management
 */