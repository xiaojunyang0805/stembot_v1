import { supabase } from '../supabase'
import type { QuestionAnalysis } from '../research/questionAnalyzer'

export interface QuestionHistoryEntry {
  id: string;
  project_id: string;
  question_text: string;
  stage: 'vague' | 'emerging' | 'focused' | 'research-ready';
  quality_score: number;
  improved_from_version?: string;
  detected_issues: string[];
  created_at: string;
  updated_at: string;
}

export interface QuestionHistoryInsert {
  project_id: string;
  question_text: string;
  stage: 'vague' | 'emerging' | 'focused' | 'research-ready';
  quality_score?: number;
  improved_from_version?: string;
  detected_issues?: string[];
}

/**
 * Simple text similarity comparison using word overlap
 * Returns similarity percentage (0-100)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (text: string) =>
    text.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)           // Split into words
        .filter(word => word.length > 2); // Filter short words

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  // Calculate Jaccard similarity (intersection / union)
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Get the latest question for a project
 */
export async function getLatestQuestionHistory(projectId: string): Promise<{ data: QuestionHistoryEntry | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('question_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching latest question history:', error);
    return { data: null, error };
  }
}

/**
 * Get all question history for a project (chronological order)
 */
export async function getProjectQuestionHistory(projectId: string): Promise<{ data: QuestionHistoryEntry[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('question_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('Error fetching project question history:', error);
    return { data: null, error };
  }
}

/**
 * Save a new question version if it's significantly different
 */
export async function trackQuestionEvolution(
  projectId: string,
  questionText: string,
  analysis: QuestionAnalysis
): Promise<{ data: QuestionHistoryEntry | null; error: any; wasStored: boolean }> {
  try {
    // Clean and validate the question text
    const cleanQuestion = questionText.trim();
    if (!cleanQuestion || cleanQuestion.length < 5) {
      return { data: null, error: null, wasStored: false };
    }

    // Get the latest question for comparison
    const { data: latestQuestion, error: fetchError } = await getLatestQuestionHistory(projectId);

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.warn('Error fetching latest question:', fetchError);
    }

    // If we have a previous question, check similarity
    if (latestQuestion) {
      const similarity = calculateTextSimilarity(latestQuestion.question_text, cleanQuestion);
      console.log(`🔍 Question similarity: ${similarity}%`);

      // If similarity is >70%, don't store (not significantly different)
      if (similarity > 70) {
        console.log('📝 Question too similar to previous version, not storing');
        return { data: null, error: null, wasStored: false };
      }
    }

    // Store the new question version
    const questionEntry: QuestionHistoryInsert = {
      project_id: projectId,
      question_text: cleanQuestion,
      stage: analysis.currentStage,
      quality_score: analysis.confidence,
      improved_from_version: latestQuestion?.id || undefined,
      detected_issues: analysis.detectedIssues || []
    };

    const { data, error } = await supabase
      .from('question_history')
      .insert(questionEntry)
      .select()
      .single();

    if (error) {
      console.error('Error storing question history:', error);
      return { data: null, error, wasStored: false };
    }

    console.log('✅ New question version stored:', {
      stage: analysis.currentStage,
      quality: analysis.confidence,
      improved_from: latestQuestion?.id ? 'previous version' : 'first version'
    });

    return { data, error: null, wasStored: true };

  } catch (error) {
    console.error('Error in trackQuestionEvolution:', error);
    return { data: null, error, wasStored: false };
  }
}

/**
 * Get question improvement chain (how a question evolved)
 */
export async function getQuestionImprovementChain(questionId: string): Promise<{ data: QuestionHistoryEntry[] | null; error: any }> {
  try {
    // Get the question and trace back through improvements
    const chain: QuestionHistoryEntry[] = [];
    let currentId = questionId;

    while (currentId) {
      const { data: question, error } = await supabase
        .from('question_history')
        .select('*')
        .eq('id', currentId)
        .single();

      if (error || !question) break;

      chain.unshift(question); // Add to beginning (chronological order)
      currentId = question.improved_from_version || '';
    }

    return { data: chain, error: null };
  } catch (error) {
    console.error('Error fetching question improvement chain:', error);
    return { data: null, error };
  }
}

/**
 * Get improvement statistics for a project
 */
export async function getQuestionImprovementStats(projectId: string): Promise<{
  data: {
    totalVersions: number;
    currentStage: string;
    stageProgression: { stage: string; count: number }[];
    qualityImprovement: number; // Percentage improvement from first to last
  } | null;
  error: any;
}> {
  try {
    const { data: history, error } = await getProjectQuestionHistory(projectId);

    if (error || !history || history.length === 0) {
      return { data: null, error };
    }

    // Calculate stage progression
    const stageProgression = history.reduce((acc, entry) => {
      const existing = acc.find(item => item.stage === entry.stage);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ stage: entry.stage, count: 1 });
      }
      return acc;
    }, [] as { stage: string; count: number }[]);

    // Calculate quality improvement
    const firstVersion = history[0];
    const latestVersion = history[history.length - 1];
    const qualityImprovement = latestVersion.quality_score - firstVersion.quality_score;

    return {
      data: {
        totalVersions: history.length,
        currentStage: latestVersion.stage,
        stageProgression,
        qualityImprovement
      },
      error: null
    };

  } catch (error) {
    console.error('Error calculating improvement stats:', error);
    return { data: null, error };
  }
}