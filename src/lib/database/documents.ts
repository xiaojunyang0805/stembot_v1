/**
 * Document Storage and Management
 * Handles document uploads, analysis results, and metadata
 */

import { supabase } from '../supabase'
import type { Json } from '../../types/database'

// Document interfaces
export interface DocumentMetadata {
  id: string
  project_id: string
  user_id: string
  filename: string
  original_name: string
  file_size: number
  mime_type: string
  storage_path: string | null
  extracted_text: string | null
  analysis_result: Json
  upload_status: 'uploading' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface DocumentUploadData {
  projectId: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  extractedText?: string
  analysisResult?: any
  storagePath?: string
}

/**
 * Save document metadata and analysis to database
 */
export async function saveDocumentMetadata(data: DocumentUploadData): Promise<{ data: DocumentMetadata | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const documentData = {
      project_id: data.projectId,
      user_id: user.id,
      filename: data.filename,
      original_name: data.originalName,
      file_size: data.fileSize,
      mime_type: data.mimeType,
      storage_path: data.storagePath || null,
      extracted_text: data.extractedText || null,
      analysis_result: data.analysisResult || {},
      upload_status: 'completed' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: document, error } = await supabase
      .from('project_documents')
      .insert(documentData)
      .select()
      .single()

    return { data: document, error }

  } catch (error) {
    console.error('Error saving document metadata:', error)
    return { data: null, error }
  }
}

/**
 * Get documents for a project
 */
export async function getProjectDocuments(projectId: string): Promise<{ data: DocumentMetadata[] | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data: documents, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data: documents, error }

  } catch (error) {
    console.error('Error fetching project documents:', error)
    return { data: null, error }
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    // Get document info first (for potential file deletion)
    const { data: document } = await supabase
      .from('project_documents')
      .select('storage_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    // Delete from database
    const { error } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    // TODO: Also delete from storage if storage_path exists
    if (document?.storage_path) {
      // Future: Delete from Supabase Storage
      console.log('TODO: Delete file from storage:', document.storage_path)
    }

    return { error }

  } catch (error) {
    console.error('Error deleting document:', error)
    return { error }
  }
}

/**
 * Update document analysis result
 */
export async function updateDocumentAnalysis(
  documentId: string,
  analysisResult: any,
  extractedText?: string
): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    const updateData: any = {
      analysis_result: analysisResult,
      updated_at: new Date().toISOString(),
      upload_status: 'completed'
    }

    if (extractedText) {
      updateData.extracted_text = extractedText
    }

    const { error } = await supabase
      .from('project_documents')
      .update(updateData)
      .eq('id', documentId)
      .eq('user_id', user.id)

    return { error }

  } catch (error) {
    console.error('Error updating document analysis:', error)
    return { error }
  }
}

/**
 * Search documents by text content
 */
export async function searchDocuments(
  projectId: string,
  query: string
): Promise<{ data: DocumentMetadata[] | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    // Basic text search (could be enhanced with full-text search)
    const { data: documents, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .or(`extracted_text.ilike.%${query}%,original_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    return { data: documents, error }

  } catch (error) {
    console.error('Error searching documents:', error)
    return { data: null, error }
  }
}

/**
 * Get document statistics for a project
 */
export async function getDocumentStats(projectId: string): Promise<{
  data: {
    totalDocuments: number
    totalSize: number
    documentTypes: Record<string, number>
  } | null
  error: any
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data: documents, error } = await supabase
      .from('project_documents')
      .select('file_size, mime_type')
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (error || !documents) {
      return { data: null, error }
    }

    const stats = {
      totalDocuments: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.file_size, 0),
      documentTypes: documents.reduce((types: Record<string, number>, doc) => {
        const type = doc.mime_type
        types[type] = (types[type] || 0) + 1
        return types
      }, {})
    }

    return { data: stats, error: null }

  } catch (error) {
    console.error('Error getting document stats:', error)
    return { data: null, error }
  }
}