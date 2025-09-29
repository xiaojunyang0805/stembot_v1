import { supabase } from '../supabase'
import type { Database } from '../../types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
  conversationId?: string
}

export interface ConversationData {
  projectId: string
  userMessage: string
  aiResponse: string
  modelUsed?: string
  tokensUsed?: number
  contextRecall?: any
  metadata?: any
}

// Save a conversation to the database
export async function saveConversation(data: ConversationData): Promise<{ data: Conversation | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const conversationData: ConversationInsert = {
      project_id: data.projectId,
      user_id: user.id,
      message: data.userMessage,
      ai_response: data.aiResponse,
      model_used: data.modelUsed || 'gpt-4o-mini',
      tokens_used: data.tokensUsed || 0,
      context_recall: data.contextRecall || {},
      conversation_metadata: data.metadata || {},
      attachments: {},
      feedback: {},
      timestamp: new Date().toISOString()
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single()

    return { data: conversation, error }
  } catch (error) {
    console.error('Error saving conversation:', error)
    return { data: null, error }
  }
}

// Get conversations for a project
export async function getProjectConversations(projectId: string): Promise<{ data: Conversation[] | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id) // Ensure user can only access their own conversations
      .order('timestamp', { ascending: true })

    return { data, error }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return { data: null, error }
  }
}

// Convert database conversations to chat messages format
export function convertToMessages(conversations: Conversation[]): ChatMessage[] {
  const messages: ChatMessage[] = []

  conversations.forEach((conv, index) => {
    // Add user message
    messages.push({
      id: `${conv.id}-user`,
      role: 'user',
      content: conv.message,
      timestamp: new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversationId: conv.id // Add conversation ID for deletion
    })

    // Add AI response
    messages.push({
      id: `${conv.id}-ai`,
      role: 'ai',
      content: conv.ai_response,
      timestamp: new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversationId: conv.id // Add conversation ID for deletion
    })
  })

  return messages
}

// Get recent conversation context for memory
export async function getRecentContext(projectId: string, limit: number = 5): Promise<{ data: any | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('message, ai_response, timestamp, context_recall')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      return { data: null, error }
    }

    // Create context summary
    const context = {
      recentMessages: data.map(conv => ({
        userMessage: conv.message,
        aiResponse: conv.ai_response,
        timestamp: conv.timestamp
      })),
      lastActivity: data[0]?.timestamp || null,
      conversationCount: data.length
    }

    return { data: context, error: null }
  } catch (error) {
    console.error('Error fetching conversation context:', error)
    return { data: null, error }
  }
}

// Update conversation with feedback
export async function updateConversationFeedback(
  conversationId: string,
  feedback: { helpful?: boolean; rating?: number; comments?: string }
): Promise<{ data: Conversation | null; error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('conversations')
      .update({
        feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id) // Ensure user can only update their own conversations
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error updating conversation feedback:', error)
    return { data: null, error }
  }
}

// Delete old conversations (for cleanup)
export async function cleanupOldConversations(projectId: string, daysToKeep: number = 30): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .lt('timestamp', cutoffDate.toISOString())

    return { error }
  } catch (error) {
    console.error('Error cleaning up conversations:', error)
    return { error }
  }
}

// Delete a specific conversation
export async function deleteConversation(conversationId: string): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    // Delete the conversation (with RLS ensuring user can only delete their own)
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id) // Extra security check

    return { error }

  } catch (error) {
    console.error('Error deleting conversation:', error)
    return { error }
  }
}

// Delete multiple conversations
export async function deleteConversations(conversationIds: string[]): Promise<{ error: any }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') }
    }

    // Delete multiple conversations
    const { error } = await supabase
      .from('conversations')
      .delete()
      .in('id', conversationIds)
      .eq('user_id', user.id) // Extra security check

    return { error }

  } catch (error) {
    console.error('Error deleting conversations:', error)
    return { error }
  }
}