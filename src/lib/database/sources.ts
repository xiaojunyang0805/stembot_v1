/**
 * Sources Database Service
 *
 * Manages external literature sources for projects, integrating with the existing
 * Supabase sources table and providing CRUD operations for the literature review workflow.
 *
 * Location: src/lib/database/sources.ts
 */

import { supabase } from '../supabase';
import { SourceData, CredibilityAssessment } from '@/components/literature/SourceCard';
import { generateCredibilityAssessment } from '../services/credibilityAssessment';

// Types for database integration
export interface DatabaseSource {
  id: string;
  project_id: string;
  title: string;
  authors: string[];
  url?: string;
  doi?: string;
  publication_year: number;
  journal: string;
  source_type: 'journal' | 'book' | 'conference' | 'thesis' | 'report' | 'website' | 'other';
  credibility_score: number;
  summary?: string;
  notes?: string;
  memory_tags: string[];
  citation_style: any;
  file_path?: string;
  status: 'pending' | 'reviewed' | 'cited' | 'rejected';
  added_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save an external source to the project
 */
export async function saveSourceToProject(
  projectId: string,
  sourceData: SourceData
): Promise<{ data: DatabaseSource | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return { data: null, error: projectError || new Error('Project not found or access denied') };
    }

    // Prepare source data for database
    const dbSource = {
      project_id: projectId,
      title: sourceData.title,
      authors: sourceData.authors,
      url: sourceData.fullTextUrl,
      doi: sourceData.doi,
      publication_year: sourceData.year,
      journal: sourceData.journal,
      source_type: 'journal' as const,
      credibility_score: sourceData.credibility.score / 100, // Convert to 0-1 scale
      summary: sourceData.abstract || sourceData.relevanceExplanation,
      notes: JSON.stringify({
        keyFindings: sourceData.keyFindings,
        relevanceExplanation: sourceData.relevanceExplanation,
        credibility: sourceData.credibility
      }),
      memory_tags: [
        sourceData.credibility.level.toLowerCase(),
        sourceData.credibility.researchField || 'general',
        ...sourceData.keyFindings.slice(0, 3) // Add first 3 key findings as tags
      ],
      citation_style: {
        apa: generateAPACitation(sourceData),
        mla: generateMLACitation(sourceData)
      },
      status: 'reviewed' as const
    };

    // Insert into database
    const { data, error } = await supabase
      .from('sources')
      .insert(dbSource)
      .select()
      .single();

    if (error) {
      console.error('Error saving source to database:', error);
      return { data: null, error };
    }

    // Update project progress
    await updateProjectSourcesProgress(projectId);

    return { data, error: null };

  } catch (error) {
    console.error('Error in saveSourceToProject:', error);
    return { data: null, error };
  }
}

/**
 * Get all sources for a project
 */
export async function getProjectSources(
  projectId: string
): Promise<{ data: DatabaseSource[] | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    // Verify user owns the project and get sources
    const { data, error } = await supabase
      .from('sources')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('project_id', projectId)
      .eq('projects.user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching project sources:', error);
      return { data: null, error };
    }

    // Remove the joined projects data from results
    const cleanData = data?.map(source => {
      const { projects, ...cleanSource } = source as any;
      return cleanSource as DatabaseSource;
    });

    return { data: cleanData || [], error: null };

  } catch (error) {
    console.error('Error in getProjectSources:', error);
    return { data: null, error };
  }
}

/**
 * Remove a source from the project
 */
export async function removeSourceFromProject(
  projectId: string,
  sourceId: string
): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') };
    }

    // Delete source (with RLS ensuring user can only delete from their projects)
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error removing source:', error);
      return { error };
    }

    // Update project progress
    await updateProjectSourcesProgress(projectId);

    return { error: null };

  } catch (error) {
    console.error('Error in removeSourceFromProject:', error);
    return { error };
  }
}

/**
 * Convert database source to SourceData format
 */
export function convertDatabaseSourceToSourceData(dbSource: DatabaseSource): SourceData {
  let credibility: CredibilityAssessment;
  let keyFindings: string[] = [];
  let relevanceExplanation: string = '';

  try {
    const notes = JSON.parse(dbSource.notes || '{}');
    credibility = notes.credibility || {
      level: dbSource.credibility_score > 0.8 ? 'High' : dbSource.credibility_score > 0.6 ? 'Moderate' : 'Low',
      score: Math.round(dbSource.credibility_score * 100),
      strengths: ['Saved to project'],
      limitations: ['Detailed assessment needed'],
      explanation: 'Previously saved source - credibility assessment available',
      publicationYear: dbSource.publication_year
    };
    keyFindings = notes.keyFindings || [];
    relevanceExplanation = notes.relevanceExplanation || dbSource.summary || '';
  } catch {
    // Fallback credibility assessment
    credibility = {
      level: dbSource.credibility_score > 0.8 ? 'High' : dbSource.credibility_score > 0.6 ? 'Moderate' : 'Low',
      score: Math.round(dbSource.credibility_score * 100),
      strengths: ['Saved to project'],
      limitations: ['Detailed assessment needed'],
      explanation: 'Previously saved source - credibility assessment available',
      publicationYear: dbSource.publication_year
    };
  }

  return {
    id: dbSource.id,
    title: dbSource.title,
    authors: dbSource.authors,
    journal: dbSource.journal,
    year: dbSource.publication_year,
    doi: dbSource.doi,
    abstract: dbSource.summary,
    keyFindings,
    relevanceExplanation,
    fullTextUrl: dbSource.url,
    credibility,
    isSaved: true,
    addedToProject: true
  };
}

/**
 * Update project sources progress
 */
async function updateProjectSourcesProgress(projectId: string): Promise<void> {
  try {
    // Get current source count
    const { data: sources } = await getProjectSources(projectId);
    const sourceCount = sources?.length || 0;

    // Calculate progress based on source count
    const progress = Math.min(100, sourceCount * 20); // 20% per source, max 100%

    // Update project progress
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('progress_data')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      console.warn('Could not fetch project for progress update:', fetchError);
      return;
    }

    const currentProgress = project.progress_data as any || {};
    const updatedProgress = {
      ...currentProgress,
      literature: {
        ...currentProgress.literature,
        progress,
        sources_count: sourceCount,
        completed: sourceCount >= 5 // Mark as completed when 5+ sources
      }
    };

    await supabase
      .from('projects')
      .update({
        progress_data: updatedProgress,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

  } catch (error) {
    console.warn('Error updating project progress:', error);
  }
}

/**
 * Generate APA citation
 */
function generateAPACitation(source: SourceData): string {
  const authorString = source.authors.length > 0
    ? source.authors.length === 1
      ? source.authors[0]
      : source.authors.length === 2
        ? `${source.authors[0]} & ${source.authors[1]}`
        : `${source.authors[0]} et al.`
    : 'Unknown Author';

  return `${authorString} (${source.year}). ${source.title}. *${source.journal}*.${source.doi ? ` https://doi.org/${source.doi}` : ''}`;
}

/**
 * Generate MLA citation
 */
function generateMLACitation(source: SourceData): string {
  const authorString = source.authors.length > 0
    ? source.authors.length === 1
      ? source.authors[0]
      : source.authors.length === 2
        ? `${source.authors[0]} and ${source.authors[1]}`
        : `${source.authors[0]} et al.`
    : 'Unknown Author';

  return `${authorString}. "${source.title}." *${source.journal}*, ${source.year}.${source.doi ? ` doi:${source.doi}.` : ''}`;
}