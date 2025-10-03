/**
 * WP4-1.3: Methodology Embeddings for Pinecone
 * Creates and manages vector embeddings for methodology data in Pinecone
 */

import type { MethodologyData } from '../supabase/methodology'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EmbeddingMetadata {
  projectId: string;
  methodType: string;
  methodName: string;
  phase: 'methodology';
  createdAt: string;
}

export interface MethodologyEmbedding {
  id: string;
  values: number[];
  metadata: EmbeddingMetadata;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Converts methodology data to text for embedding
 */
export function methodologyToText(methodology: MethodologyData): string {
  const parts: string[] = []

  // Add method information
  parts.push(`Research Method: ${methodology.methodName}`)
  parts.push(`Method Type: ${methodology.methodType}`)

  if (methodology.reasoning) {
    parts.push(`Reasoning: ${methodology.reasoning}`)
  }

  // Add variables
  if (methodology.independentVariables?.length) {
    const ivText = methodology.independentVariables
      .map(v => `${v.name}: ${v.description}`)
      .join(', ')
    parts.push(`Independent Variables: ${ivText}`)
  }

  if (methodology.dependentVariables?.length) {
    const dvText = methodology.dependentVariables
      .map(v => `${v.name}: ${v.description}`)
      .join(', ')
    parts.push(`Dependent Variables: ${dvText}`)
  }

  if (methodology.controlVariables?.length) {
    const cvText = methodology.controlVariables
      .map(v => `${v.name}: ${v.description}`)
      .join(', ')
    parts.push(`Control Variables: ${cvText}`)
  }

  // Add participant information
  if (methodology.participantCriteria) {
    parts.push(`Participant Criteria: ${methodology.participantCriteria}`)
  }

  if (methodology.estimatedSampleSize) {
    parts.push(`Sample Size: ${methodology.estimatedSampleSize}`)
  }

  if (methodology.recruitmentStrategy) {
    parts.push(`Recruitment: ${methodology.recruitmentStrategy}`)
  }

  if (methodology.procedureDraft) {
    parts.push(`Procedure: ${methodology.procedureDraft}`)
  }

  return parts.join('\n\n')
}

/**
 * Generates embedding vector for methodology text using OpenAI API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('/api/embeddings/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`)
    }

    const data = await response.json()
    return data.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// ============================================================================
// PINECONE OPERATIONS
// ============================================================================

/**
 * Creates and stores methodology embedding in Pinecone
 */
export async function createMethodologyEmbedding(
  projectId: string,
  methodology: MethodologyData
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('🧠 Creating methodology embedding for project:', projectId)

    // Convert methodology to text
    const text = methodologyToText(methodology)

    // Generate embedding vector
    const embedding = await generateEmbedding(text)

    // Prepare metadata
    const metadata: EmbeddingMetadata = {
      projectId,
      methodType: methodology.methodType,
      methodName: methodology.methodName,
      phase: 'methodology',
      createdAt: new Date().toISOString()
    }

    // Store in Pinecone via API
    const response = await fetch('/api/pinecone/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: `project-${projectId}`,
        vectors: [{
          id: `methodology-${projectId}`,
          values: embedding,
          metadata
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pinecone upsert error: ${error.message}`)
    }

    console.log('✅ Methodology embedding created successfully')
    return { success: true }
  } catch (error) {
    console.error('💥 Error creating methodology embedding:', error)
    return { success: false, error }
  }
}

/**
 * Retrieves methodology context from Pinecone for AI chat
 */
export async function getMethodologyContext(
  projectId: string,
  query: string
): Promise<{ context: string | null; error?: any }> {
  try {
    console.log('🔍 Retrieving methodology context for query:', query)

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query)

    // Search Pinecone
    const response = await fetch('/api/pinecone/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: `project-${projectId}`,
        vector: queryEmbedding,
        topK: 1,
        filter: {
          phase: { $eq: 'methodology' }
        },
        includeMetadata: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pinecone query error: ${error.message}`)
    }

    const data = await response.json()

    if (!data.matches || data.matches.length === 0) {
      console.log('ℹ️ No methodology context found')
      return { context: null }
    }

    // Extract context from top match
    const match = data.matches[0]
    const context = `Methodology: ${match.metadata.methodName} (${match.metadata.methodType})`

    console.log('✅ Methodology context retrieved')
    return { context }
  } catch (error) {
    console.error('💥 Error retrieving methodology context:', error)
    return { context: null, error }
  }
}

/**
 * Deletes methodology embedding from Pinecone
 */
export async function deleteMethodologyEmbedding(
  projectId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('🗑️ Deleting methodology embedding for project:', projectId)

    const response = await fetch('/api/pinecone/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: `project-${projectId}`,
        ids: [`methodology-${projectId}`]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pinecone delete error: ${error.message}`)
    }

    console.log('✅ Methodology embedding deleted')
    return { success: true }
  } catch (error) {
    console.error('💥 Error deleting methodology embedding:', error)
    return { success: false, error }
  }
}

// ============================================================================
// CROSS-PHASE INTEGRATION
// ============================================================================

/**
 * Updates methodology in project memory for cross-phase access
 */
export async function updateProjectMemory(
  projectId: string,
  methodology: MethodologyData
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('💾 Updating project memory with methodology')

    const response = await fetch('/api/projects/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        phase: 'methodology',
        data: {
          methodType: methodology.methodType,
          methodName: methodology.methodName,
          reasoning: methodology.reasoning,
          variables: {
            independent: methodology.independentVariables,
            dependent: methodology.dependentVariables,
            control: methodology.controlVariables
          },
          sampling: {
            criteria: methodology.participantCriteria,
            sampleSize: methodology.estimatedSampleSize,
            recruitment: methodology.recruitmentStrategy
          },
          procedure: methodology.procedureDraft
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Memory update error: ${error.message}`)
    }

    console.log('✅ Project memory updated')
    return { success: true }
  } catch (error) {
    console.error('💥 Error updating project memory:', error)
    return { success: false, error }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates Pinecone configuration
 */
export function validatePineconeConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = []

  if (!process.env.NEXT_PUBLIC_PINECONE_API_KEY) {
    errors.push('PINECONE_API_KEY environment variable not set')
  }

  if (!process.env.NEXT_PUBLIC_PINECONE_INDEX) {
    errors.push('PINECONE_INDEX environment variable not set')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Health check for Pinecone integration
 */
export async function checkPineconeHealth(): Promise<{
  healthy: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/pinecone/health', {
      method: 'GET'
    })

    if (!response.ok) {
      const error = await response.json()
      return { healthy: false, error: error.message }
    }

    return { healthy: true }
  } catch (error: any) {
    return { healthy: false, error: error.message }
  }
}
