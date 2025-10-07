import { supabase, createClientComponentClient } from '../supabase';

export interface PaperOutline {
  id: string;
  project_id: string;
  outline_data: {
    sections: {
      title: string;
      wordTarget: number;
      keyPoints: string[];
    }[];
    researchQuestion: string;
    topSources: string[];
    methodology: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Get paper outline for a project
 */
export async function getPaperOutline(projectId: string): Promise<{ data: PaperOutline | null; error: any }> {
  try {
    const client = createClientComponentClient();

    const { data, error } = await client
      .from('paper_outlines')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching paper outline:', error);
      return { data: null, error };
    }

    return { data: data as PaperOutline | null, error: null };
  } catch (err) {
    console.error('Exception in getPaperOutline:', err);
    return { data: null, error: err };
  }
}

/**
 * Create a new paper outline for a project
 */
export async function createPaperOutline(
  projectId: string,
  outlineData: PaperOutline['outline_data']
): Promise<{ data: PaperOutline | null; error: any }> {
  try {
    const client = createClientComponentClient();

    const { data, error } = await client
      .from('paper_outlines')
      .insert({
        project_id: projectId,
        outline_data: outlineData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating paper outline:', error);
      return { data: null, error };
    }

    return { data: data as PaperOutline, error: null };
  } catch (err) {
    console.error('Exception in createPaperOutline:', err);
    return { data: null, error: err };
  }
}

/**
 * Update an existing paper outline
 */
export async function updatePaperOutline(
  outlineId: string,
  outlineData: PaperOutline['outline_data']
): Promise<{ data: PaperOutline | null; error: any }> {
  try {
    const client = createClientComponentClient();

    const { data, error } = await client
      .from('paper_outlines')
      .update({
        outline_data: outlineData,
        updated_at: new Date().toISOString()
      })
      .eq('id', outlineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating paper outline:', error);
      return { data: null, error };
    }

    return { data: data as PaperOutline, error: null };
  } catch (err) {
    console.error('Exception in updatePaperOutline:', err);
    return { data: null, error: err };
  }
}
