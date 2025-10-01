/**
 * Question Memory Service
 *
 * Stores and retrieves question-related conversations with embeddings
 * for intelligent context recall during research question development.
 */

import { supabase } from '../supabase';
import { ProjectMemoryInsert, ContentType } from '../../types/database';

export interface QuestionDiscussion {
  id?: string;
  projectId: string;
  content: string;
  contentType: ContentType;
  metadata: {
    questionVersion?: string;
    discussionType: 'question_refinement' | 'focus_area' | 'ai_suggestion' | 'document_insight' | 'student_response';
    aiSuggestion?: string;
    studentResponse?: string;
    questionStage?: 'initial' | 'emerging' | 'focused' | 'research-ready';
    documentName?: string;
    timestamp: string;
  };
  sessionId?: string;
}

export interface MemorySearchResult {
  id: string;
  content: string;
  contentType: ContentType;
  similarity: number;
  metadata: any;
  timestamp: string;
}

/**
 * Generate embedding vector for text content
 * Uses OpenAI API to create embeddings for semantic search
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('/api/ai/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn('Embedding API failed, using mock embedding');
      // Generate mock embedding (1536 dimensions like OpenAI)
      return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.warn('Error generating embedding:', error);
    // Fallback to mock embedding
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }
}

/**
 * Store a question-related discussion in memory
 */
export async function storeQuestionDiscussion(discussion: QuestionDiscussion): Promise<string | null> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(discussion.content);

    // Prepare memory record
    const memoryRecord: ProjectMemoryInsert = {
      project_id: discussion.projectId,
      content_type: discussion.contentType,
      content: discussion.content,
      embedding_vector: embedding,
      relevance_score: 1.0, // High relevance for question discussions
      metadata: discussion.metadata,
      session_id: discussion.sessionId,
    };

    // Insert into project_memory table
    const { data, error } = await supabase
      .from('project_memory')
      .insert(memoryRecord)
      .select('id')
      .single();

    if (error) {
      console.error('Error storing question discussion:', error);
      return null;
    }

    console.log('✅ Question discussion stored in memory:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error in storeQuestionDiscussion:', error);
    return null;
  }
}

// Memory retrieval cache for <500ms performance
const memoryCache = new Map<string, { results: MemorySearchResult[]; timestamp: number }>();
const MEMORY_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for memory queries

/**
 * High-performance memory retrieval with caching
 * Target: <500ms response time
 */
export async function retrieveQuestionDiscussions(
  projectId: string,
  query: string,
  limit: number = 5
): Promise<MemorySearchResult[]> {
  const startTime = performance.now();

  try {
    // Create cache key from project + query hash
    const queryHash = query.toLowerCase().substring(0, 50);
    const cacheKey = `${projectId}:${queryHash}:${limit}`;

    // Check cache first for fast retrieval
    const cached = memoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < MEMORY_CACHE_TTL) {
      const endTime = performance.now();
      console.log(`🚀 Memory cache hit: ${(endTime - startTime).toFixed(1)}ms`);
      return cached.results;
    }

    // Generate embedding for search query
    const embeddingStartTime = performance.now();
    const queryEmbedding = await generateEmbedding(query);
    const embeddingEndTime = performance.now();
    console.log(`⚡ Embedding generation: ${(embeddingEndTime - embeddingStartTime).toFixed(1)}ms`);

    // Search using Supabase vector similarity function with optimized parameters
    const searchStartTime = performance.now();
    const { data, error } = await supabase.rpc('search_project_memory', {
      project_uuid: projectId,
      query_embedding: queryEmbedding,
      match_threshold: 0.6, // Lowered threshold for better recall, faster search
      match_count: Math.min(limit, 10), // Cap at 10 for performance
    });
    const searchEndTime = performance.now();
    console.log(`⚡ Vector search: ${(searchEndTime - searchStartTime).toFixed(1)}ms`);

    if (error) {
      console.error('Error retrieving question discussions:', error);
      return [];
    }

    // Transform results efficiently
    const transformStartTime = performance.now();
    const results = data.map((item: any) => ({
      id: item.id,
      content: item.content,
      contentType: item.content_type as ContentType,
      similarity: item.similarity,
      metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
      timestamp: item.timestamp,
    }));
    const transformEndTime = performance.now();
    console.log(`⚡ Result transformation: ${(transformEndTime - transformStartTime).toFixed(1)}ms`);

    // Cache the results
    memoryCache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (Math.random() < 0.1) {
      const now = Date.now();
      for (const [key, entry] of memoryCache.entries()) {
        if (now - entry.timestamp > MEMORY_CACHE_TTL) {
          memoryCache.delete(key);
        }
      }
    }

    const totalEndTime = performance.now();
    console.log(`⚡ Total memory retrieval: ${(totalEndTime - startTime).toFixed(1)}ms`);

    return results;
  } catch (error) {
    const endTime = performance.now();
    console.error(`Error in retrieveQuestionDiscussions (${(endTime - startTime).toFixed(1)}ms):`, error);
    return [];
  }
}

/**
 * Store specific types of question-related conversations
 */
export const QuestionMemoryHelpers = {
  /**
   * Store AI's question about focus areas
   */
  storeFocusQuestion: async (projectId: string, question: string, sessionId?: string) => {
    return storeQuestionDiscussion({
      projectId,
      content: question,
      contentType: 'conversation',
      metadata: {
        discussionType: 'focus_area',
        timestamp: new Date().toISOString(),
      },
      sessionId,
    });
  },

  /**
   * Store student's response about their focus
   */
  storeStudentFocus: async (projectId: string, response: string, questionVersion?: string, sessionId?: string) => {
    return storeQuestionDiscussion({
      projectId,
      content: response,
      contentType: 'conversation',
      metadata: {
        discussionType: 'student_response',
        questionVersion,
        timestamp: new Date().toISOString(),
      },
      sessionId,
    });
  },

  /**
   * Store AI's suggestions for specificity
   */
  storeAISuggestion: async (projectId: string, suggestion: string, currentQuestion?: string, sessionId?: string) => {
    return storeQuestionDiscussion({
      projectId,
      content: suggestion,
      contentType: 'insight',
      metadata: {
        discussionType: 'ai_suggestion',
        questionVersion: currentQuestion,
        timestamp: new Date().toISOString(),
      },
      sessionId,
    });
  },

  /**
   * Store insights from uploaded documents
   */
  storeDocumentInsight: async (projectId: string, insight: string, documentName?: string, sessionId?: string) => {
    return storeQuestionDiscussion({
      projectId,
      content: insight,
      contentType: 'document',
      metadata: {
        discussionType: 'document_insight',
        documentName,
        timestamp: new Date().toISOString(),
      },
      sessionId,
    });
  },

  /**
   * Store question refinement discussions
   */
  storeQuestionRefinement: async (
    projectId: string,
    oldQuestion: string,
    newQuestion: string,
    refinementReason: string,
    questionStage?: 'initial' | 'emerging' | 'focused' | 'research-ready',
    sessionId?: string
  ) => {
    const content = `Question refined from "${oldQuestion}" to "${newQuestion}". Reason: ${refinementReason}`;
    return storeQuestionDiscussion({
      projectId,
      content,
      contentType: 'research_context',
      metadata: {
        discussionType: 'question_refinement',
        questionVersion: newQuestion,
        questionStage,
        timestamp: new Date().toISOString(),
      },
      sessionId,
    });
  },
};

/**
 * Get formatted memory context for AI prompts
 */
export async function getQuestionMemoryContext(projectId: string, currentQuery: string): Promise<string> {
  const memories = await retrieveQuestionDiscussions(projectId, currentQuery, 3);

  if (memories.length === 0) {
    return '';
  }

  const formattedMemories = memories.map(memory => {
    const meta = memory.metadata;
    return `[Previous discussion - ${meta.discussionType}]: ${memory.content}`;
  }).join('\n\n');

  return `\n\n=== RELEVANT PAST DISCUSSIONS ===\n${formattedMemories}\n=== END PAST DISCUSSIONS ===\n`;
}