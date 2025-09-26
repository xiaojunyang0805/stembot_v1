/**
 * Export Components Export Index
 *
 * Centralized exports for all export and presentation components.
 * Provides clean imports for research export and sharing UI.
 *
 * @location src/components/export/index.ts
 */

// Export and presentation components
export { ResearchExporter } from './ResearchExporter';

// Re-export types for convenience
export type {
  ExportFormat,
  ExportTemplate,
} from './ResearchExporter';

/**
 * TODO: Additional export components to implement
 *
 * 1. TemplateEditor - Custom export template creation and editing
 * 2. PublicationFormatter - Journal-specific formatting tools
 * 3. ArchiveManager - Project archiving and backup management
 * 4. SharingControls - Advanced sharing and collaboration controls
 * 5. ExportHistory - Export history and version management
 * 6. BatchExporter - Bulk export operations
 * 7. CloudExporter - Cloud storage integration for exports
 * 8. PresentationBuilder - Slide deck creation from research
 */