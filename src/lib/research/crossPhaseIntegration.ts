/**
 * Cross-Phase Data Flow Integration
 *
 * Manages data flow between literature review and other research phases,
 * ensuring seamless integration and memory-driven research workflow.
 *
 * Location: src/lib/research/crossPhaseIntegration.ts
 */

import { SourceData } from '@/components/literature/SourceCard';
import { OrganizedSources } from './sourceOrganizer';
import { GapAnalysisResult } from './gapAnalysis';
import { supabase } from '../supabase';
import { updateProjectProgress } from '../database/projects';

// Types for cross-phase integration
export interface ProjectLiteratureState {
  projectId: string;
  sources: SourceData[];
  organization?: OrganizedSources;
  gapAnalysis?: GapAnalysisResult;
  literatureProgress: LiteratureProgress;
  methodologyRecommendations: MethodologyRecommendation[];
  citationDatabase: CitationEntry[];
  lastUpdated: string;
}

export interface LiteratureProgress {
  sourceCount: number;
  highQualitySourceCount: number;
  gapAnalysisCompleted: boolean;
  organizationCompleted: boolean;
  progressPercentage: number;
  milestones: ProgressMilestone[];
  nextActions: string[];
}

export interface MethodologyRecommendation {
  id: string;
  methodType: string;
  rationale: string;
  basedOnSources: string[];
  feasibility: 'high' | 'medium' | 'low';
  recommendationStrength: number; // 0-100
  implementationSteps: string[];
  requiredResources: string[];
}

export interface CitationEntry {
  sourceId: string;
  citationKey: string; // e.g., "smith2024"
  fullCitation: string;
  inTextCitation: string;
  topics: string[];
  keyFindings: string[];
  usageContext: 'methodology' | 'background' | 'results' | 'discussion';
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  requirement: number; // e.g., 5 sources needed
  current: number; // e.g., 3 sources collected
}

export interface CrossPhaseNotification {
  id: string;
  type: 'gap_identified' | 'milestone_reached' | 'methodology_suggestion' | 'citation_ready';
  title: string;
  message: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  read: boolean;
}

/**
 * Main function to synchronize literature data across phases
 */
export async function syncLiteratureAcrossPhases(
  projectId: string,
  sources: SourceData[],
  organization?: OrganizedSources,
  gapAnalysis?: GapAnalysisResult
): Promise<void> {
  try {
    console.log(`Syncing literature data for project ${projectId}`);

    // 1. Calculate literature progress
    const progress = calculateLiteratureProgress(sources, organization, gapAnalysis);

    // 2. Generate methodology recommendations
    const methodologyRecommendations = await generateMethodologyRecommendations(sources, organization);

    // 3. Create citation database
    const citationDatabase = createCitationDatabase(sources);

    // 4. Update project literature state
    const literatureState: ProjectLiteratureState = {
      projectId,
      sources,
      organization,
      gapAnalysis,
      literatureProgress: progress,
      methodologyRecommendations,
      citationDatabase,
      lastUpdated: new Date().toISOString()
    };

    // 5. Store in database
    await storeLiteratureState(literatureState);

    // 6. Update dashboard progress
    await updateDashboardProgress(projectId, progress);

    // 7. Generate notifications
    const notifications = generateNotifications(literatureState);
    await storeNotifications(projectId, notifications);

    // 8. Update project memory
    await updateProjectMemory(projectId, literatureState);

    console.log('Literature sync completed successfully');

  } catch (error) {
    console.error('Error syncing literature across phases:', error);
    throw error;
  }
}

/**
 * Calculate literature progress metrics
 */
function calculateLiteratureProgress(
  sources: SourceData[],
  organization?: OrganizedSources,
  gapAnalysis?: GapAnalysisResult
): LiteratureProgress {
  const sourceCount = sources.length;
  const highQualitySourceCount = sources.filter(s => s.credibility?.level === 'High').length;
  const gapAnalysisCompleted = !!gapAnalysis;
  const organizationCompleted = !!organization;

  // Define milestones
  const milestones: ProgressMilestone[] = [
    {
      id: 'initial_sources',
      title: 'Initial Source Collection',
      description: 'Collect first 3 sources',
      completed: sourceCount >= 3,
      completedAt: sourceCount >= 3 ? new Date().toISOString() : undefined,
      requirement: 3,
      current: sourceCount
    },
    {
      id: 'source_organization',
      title: 'Source Organization',
      description: 'Organize sources into themes and methodologies',
      completed: organizationCompleted,
      completedAt: organizationCompleted ? new Date().toISOString() : undefined,
      requirement: 1,
      current: organizationCompleted ? 1 : 0
    },
    {
      id: 'gap_analysis',
      title: 'Gap Analysis',
      description: 'Complete AI-powered gap analysis',
      completed: gapAnalysisCompleted,
      completedAt: gapAnalysisCompleted ? new Date().toISOString() : undefined,
      requirement: 1,
      current: gapAnalysisCompleted ? 1 : 0
    },
    {
      id: 'quality_sources',
      title: 'High-Quality Sources',
      description: 'Collect 5 high-quality sources',
      completed: highQualitySourceCount >= 5,
      completedAt: highQualitySourceCount >= 5 ? new Date().toISOString() : undefined,
      requirement: 5,
      current: highQualitySourceCount
    },
    {
      id: 'comprehensive_review',
      title: 'Comprehensive Review',
      description: 'Collect 10+ sources with organization and gap analysis',
      completed: sourceCount >= 10 && organizationCompleted && gapAnalysisCompleted,
      completedAt: (sourceCount >= 10 && organizationCompleted && gapAnalysisCompleted) ? new Date().toISOString() : undefined,
      requirement: 10,
      current: sourceCount
    }
  ];

  // Calculate overall progress percentage
  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPercentage = Math.round((completedMilestones / milestones.length) * 100);

  // Generate next actions
  const nextActions: string[] = [];
  if (sourceCount < 3) {
    nextActions.push('Add more sources to reach minimum requirement');
  } else if (!organizationCompleted) {
    nextActions.push('Organize sources into themes and methodologies');
  } else if (!gapAnalysisCompleted) {
    nextActions.push('Run gap analysis to identify research opportunities');
  } else if (highQualitySourceCount < 5) {
    nextActions.push('Add more high-quality sources for robust foundation');
  } else if (sourceCount < 10) {
    nextActions.push('Expand literature collection for comprehensive coverage');
  } else {
    nextActions.push('Literature review is ready for methodology phase');
  }

  return {
    sourceCount,
    highQualitySourceCount,
    gapAnalysisCompleted,
    organizationCompleted,
    progressPercentage,
    milestones,
    nextActions
  };
}

/**
 * Generate methodology recommendations based on literature
 */
async function generateMethodologyRecommendations(
  sources: SourceData[],
  organization?: OrganizedSources
): Promise<MethodologyRecommendation[]> {
  try {
    if (!organization || sources.length < 3) {
      return generateBasicMethodologyRecommendations(sources);
    }

    const recommendations: MethodologyRecommendation[] = [];

    // Analyze methodology patterns from organization
    for (const methodGroup of organization.methodologies) {
      const recommendation: MethodologyRecommendation = {
        id: `method-rec-${methodGroup.id}`,
        methodType: methodGroup.methodologyType,
        rationale: `Based on ${methodGroup.sources.length} sources using ${methodGroup.name}, this approach has proven effective in your research area.`,
        basedOnSources: methodGroup.sources.map(s => s.id),
        feasibility: methodGroup.sources.length >= 3 ? 'high' : 'medium',
        recommendationStrength: Math.min(methodGroup.sources.length * 20, 100),
        implementationSteps: methodGroup.characteristics.map(char => `Implement ${char.toLowerCase()}`),
        requiredResources: ['Research design expertise', 'Data collection tools', 'Analysis software']
      };

      recommendations.push(recommendation);
    }

    // Use AI to enhance recommendations
    const enhancedRecommendations = await enhanceRecommendationsWithAI(recommendations, sources);
    return enhancedRecommendations;

  } catch (error) {
    console.warn('Error generating methodology recommendations:', error);
    return generateBasicMethodologyRecommendations(sources);
  }
}

/**
 * Enhance methodology recommendations using AI
 */
async function enhanceRecommendationsWithAI(
  recommendations: MethodologyRecommendation[],
  sources: SourceData[]
): Promise<MethodologyRecommendation[]> {
  try {
    const sourceSummary = sources.slice(0, 5).map(s =>
      `${s.title} (${s.year}) - ${s.credibility?.studyType || 'Unknown method'}`
    ).join('\n');

    const response = await fetch('/api/ai/enhanced-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          role: 'user',
          content: `Based on these research sources, provide detailed methodology recommendations for a student research project:

Sources:
${sourceSummary}

Current methodology analysis shows these approaches:
${recommendations.map(r => `- ${r.methodType}: ${r.rationale}`).join('\n')}

For each methodology, provide:
1. Specific implementation steps for a student researcher
2. Required resources and tools
3. Feasibility assessment (high/medium/low)
4. Potential challenges and solutions

Focus on practical, achievable recommendations for university-level research.`
        },
        projectId: 'methodology-recommendations'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiContent = data.message?.content || '';

      // Parse AI response and enhance existing recommendations
      return enhanceRecommendationsFromAIResponse(recommendations, aiContent);
    }

    return recommendations;

  } catch (error) {
    console.warn('AI enhancement failed, using basic recommendations:', error);
    return recommendations;
  }
}

/**
 * Create citation database for writing phase
 */
function createCitationDatabase(sources: SourceData[]): CitationEntry[] {
  return sources.map((source, index) => {
    const firstAuthor = source.authors[0]?.split(',')[0]?.trim() || 'Unknown';
    const year = source.year || new Date().getFullYear();

    // Generate citation key (e.g., "smith2024")
    const citationKey = `${firstAuthor.toLowerCase().replace(/[^a-z]/g, '')}${year}`;

    // Generate full citation (APA style)
    const authorsText = source.authors.length > 3
      ? `${source.authors.slice(0, 3).join(', ')}, et al.`
      : source.authors.join(', ');

    const fullCitation = `${authorsText} (${year}). ${source.title}. ${source.journal}${source.doi ? `. https://doi.org/${source.doi}` : ''}`;

    // Generate in-text citation
    const inTextCitation = source.authors.length === 1
      ? `${firstAuthor} (${year})`
      : source.authors.length === 2
      ? `${source.authors[0]?.split(',')[0]} & ${source.authors[1]?.split(',')[0]} (${year})`
      : `${firstAuthor} et al. (${year})`;

    // Extract topics from title and findings
    const topics = extractTopicsFromSource(source);

    return {
      sourceId: source.id,
      citationKey,
      fullCitation,
      inTextCitation,
      topics,
      keyFindings: source.keyFindings || [],
      usageContext: 'background' as const
    };
  });
}

/**
 * Extract topics from source for categorization
 */
function extractTopicsFromSource(source: SourceData): string[] {
  const text = `${source.title} ${source.abstract || ''} ${source.keyFindings?.join(' ') || ''}`.toLowerCase();

  // Common research topics
  const topicPatterns = {
    'machine learning': /machine learning|artificial intelligence|deep learning|neural networks/,
    'education': /education|learning|teaching|student|academic/,
    'health': /health|medical|clinical|patient|treatment/,
    'psychology': /psychology|cognitive|behavior|mental/,
    'social': /social|society|community|culture/,
    'technology': /technology|digital|computer|software/,
    'methodology': /method|approach|technique|procedure/,
    'analysis': /analysis|statistical|data|measurement/
  };

  const topics: string[] = [];
  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(text)) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general'];
}

/**
 * Store literature state in database
 */
async function storeLiteratureState(state: ProjectLiteratureState): Promise<void> {
  try {
    const { error } = await supabase
      .from('project_literature_states')
      .upsert({
        project_id: state.projectId,
        literature_data: state,
        source_count: state.sources.length,
        progress_percentage: state.literatureProgress.progressPercentage,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Failed to store literature state:', error);
    }
  } catch (error) {
    console.warn('Error storing literature state:', error);
  }
}

/**
 * Update dashboard progress
 */
async function updateDashboardProgress(projectId: string, progress: LiteratureProgress): Promise<void> {
  try {
    console.log(`Updating dashboard progress for project ${projectId}:`, progress);

    // Use the proper updateProjectProgress function
    const { data, error } = await updateProjectProgress(projectId, 'literature', {
      progress: progress.progressPercentage,
      completed: progress.progressPercentage >= 80,
      sources_count: progress.sourceCount,
      high_quality_sources: progress.highQualitySourceCount,
      gap_analysis_completed: progress.gapAnalysisCompleted,
      organization_completed: progress.organizationCompleted,
      milestones_reached: progress.milestones.filter(m => m.completed).length,
      next_actions: progress.nextActions,
      last_updated: new Date().toISOString()
    });

    if (error) {
      console.warn('Failed to update dashboard progress:', error);
    } else {
      console.log('Dashboard progress updated successfully:', JSON.stringify(data?.progress_data));
    }

    // Trigger a cross-phase progress entry for tracking
    await supabase.from('cross_phase_progress').insert({
      project_id: projectId,
      from_phase: 'literature',
      to_phase: 'dashboard',
      data_type: 'progress_update',
      data_payload: {
        progress_percentage: progress.progressPercentage,
        source_count: progress.sourceCount,
        milestones: progress.milestones,
        updated_at: new Date().toISOString()
      },
      status: 'synced'
    });

  } catch (error) {
    console.warn('Error updating dashboard progress:', error);
  }
}

/**
 * Generate notifications based on literature state
 */
function generateNotifications(state: ProjectLiteratureState): CrossPhaseNotification[] {
  const notifications: CrossPhaseNotification[] = [];

  // Gap analysis completion notification
  if (state.gapAnalysis && state.gapAnalysis.identifiedGaps.length > 0) {
    notifications.push({
      id: `gap-notification-${Date.now()}`,
      type: 'gap_identified',
      title: 'Research Gaps Identified',
      message: `Found ${state.gapAnalysis.identifiedGaps.length} research gaps that could guide your methodology`,
      actionUrl: `/projects/${state.projectId}/literature`,
      priority: 'high',
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  // Milestone completion notifications
  state.literatureProgress.milestones.forEach(milestone => {
    if (milestone.completed && milestone.completedAt) {
      const recentlyCompleted = new Date(milestone.completedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (recentlyCompleted) {
        notifications.push({
          id: `milestone-${milestone.id}-${Date.now()}`,
          type: 'milestone_reached',
          title: 'Literature Milestone Reached',
          message: `Completed: ${milestone.title}`,
          actionUrl: `/projects/${state.projectId}/literature`,
          priority: 'medium',
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }
  });

  // Methodology suggestion notification
  if (state.methodologyRecommendations.length > 0) {
    const highStrengthRecs = state.methodologyRecommendations.filter(r => r.recommendationStrength >= 70);

    if (highStrengthRecs.length > 0) {
      notifications.push({
        id: `methodology-suggestion-${Date.now()}`,
        type: 'methodology_suggestion',
        title: 'Methodology Recommendations Ready',
        message: `Based on your literature, we recommend ${highStrengthRecs.length} methodology approaches`,
        actionUrl: `/projects/${state.projectId}/methodology`,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        read: false
      });
    }
  }

  // Citation readiness notification
  if (state.citationDatabase.length >= 5) {
    notifications.push({
      id: `citation-ready-${Date.now()}`,
      type: 'citation_ready',
      title: 'Citations Ready for Writing',
      message: `${state.citationDatabase.length} sources are formatted and ready for citation`,
      actionUrl: `/projects/${state.projectId}/writing`,
      priority: 'low',
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  return notifications;
}

/**
 * Generate basic methodology recommendations when AI fails
 */
function generateBasicMethodologyRecommendations(sources: SourceData[]): MethodologyRecommendation[] {
  const recommendations: MethodologyRecommendation[] = [];

  // Basic recommendations based on source count and types
  if (sources.length >= 3) {
    recommendations.push({
      id: 'basic-survey',
      methodType: 'survey',
      rationale: 'Survey methodology is accessible for student research and can validate findings from your literature',
      basedOnSources: sources.slice(0, 3).map(s => s.id),
      feasibility: 'high',
      recommendationStrength: 70,
      implementationSteps: [
        'Design questionnaire based on literature themes',
        'Identify target population',
        'Pilot test with small group',
        'Collect and analyze responses'
      ],
      requiredResources: ['Survey platform', 'Statistical analysis software', 'Target participants']
    });
  }

  if (sources.some(s => s.credibility?.studyType?.toLowerCase().includes('experimental'))) {
    recommendations.push({
      id: 'basic-experimental',
      methodType: 'experimental',
      rationale: 'Experimental approaches found in your literature could be adapted for student research',
      basedOnSources: sources.filter(s => s.credibility?.studyType?.toLowerCase().includes('experimental')).map(s => s.id),
      feasibility: 'medium',
      recommendationStrength: 60,
      implementationSteps: [
        'Simplify experimental design from literature',
        'Define variables and controls',
        'Plan data collection procedure',
        'Conduct pilot experiment'
      ],
      requiredResources: ['Lab space or controlled environment', 'Measurement tools', 'Participants or subjects']
    });
  }

  return recommendations;
}

/**
 * Enhance recommendations from AI response
 */
function enhanceRecommendationsFromAIResponse(
  recommendations: MethodologyRecommendation[],
  aiContent: string
): MethodologyRecommendation[] {
  // This would parse the AI response and enhance the recommendations
  // For now, return the original recommendations with minor enhancements
  return recommendations.map(rec => ({
    ...rec,
    implementationSteps: rec.implementationSteps.map(step =>
      `${step} (consider time and resource constraints)`
    ),
    requiredResources: [...rec.requiredResources, 'Faculty guidance', 'Ethical approval if needed']
  }));
}

/**
 * Retrieve literature state for other phases
 */
export async function getLiteratureStateForProject(projectId: string): Promise<ProjectLiteratureState | null> {
  try {
    const { data, error } = await supabase
      .from('project_literature_states')
      .select('literature_data')
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.literature_data as ProjectLiteratureState;
  } catch (error) {
    console.warn('Error retrieving literature state:', error);
    return null;
  }
}

/**
 * Get sources for citation in writing phase
 */
export async function getSourcesForCitation(projectId: string, topic?: string): Promise<CitationEntry[]> {
  try {
    const state = await getLiteratureStateForProject(projectId);
    if (!state) return [];

    let citations = state.citationDatabase;

    // Filter by topic if specified
    if (topic) {
      citations = citations.filter(c =>
        c.topics.some(t => t.toLowerCase().includes(topic.toLowerCase())) ||
        c.keyFindings.some(f => f.toLowerCase().includes(topic.toLowerCase()))
      );
    }

    return citations;
  } catch (error) {
    console.warn('Error getting sources for citation:', error);
    return [];
  }
}

/**
 * Get methodology recommendations for methodology phase
 */
export async function getMethodologyRecommendations(projectId: string): Promise<MethodologyRecommendation[]> {
  try {
    const state = await getLiteratureStateForProject(projectId);
    return state?.methodologyRecommendations || [];
  } catch (error) {
    console.warn('Error getting methodology recommendations:', error);
    return [];
  }
}

/**
 * Export functions for external use
 */
export {
  syncLiteratureAcrossPhases as default,
  calculateLiteratureProgress,
  createCitationDatabase,
  generateMethodologyRecommendations
};