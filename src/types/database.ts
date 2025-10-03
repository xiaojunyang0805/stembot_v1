/**
 * StemBot Database Types
 * Generated TypeScript types for Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type AcademicLevel = 'undergraduate' | 'graduate' | 'phd' | 'postdoc' | 'faculty'
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'
export type ResearchPhase = 'question' | 'literature' | 'methodology' | 'writing'
export type ContentType = 'conversation' | 'document' | 'insight' | 'note' | 'research_context'
export type SourceType = 'journal' | 'book' | 'conference' | 'thesis' | 'report' | 'website' | 'other'
export type SourceStatus = 'pending' | 'reviewed' | 'cited' | 'rejected'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          university: string | null
          subscription_tier: SubscriptionTier
          research_interests: string[] | null
          academic_level: AcademicLevel | null
          stripe_customer_id: string | null
          profile_data: Json
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          university?: string | null
          subscription_tier?: SubscriptionTier
          research_interests?: string[] | null
          academic_level?: AcademicLevel | null
          stripe_customer_id?: string | null
          profile_data?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          university?: string | null
          subscription_tier?: SubscriptionTier
          research_interests?: string[] | null
          academic_level?: AcademicLevel | null
          stripe_customer_id?: string | null
          profile_data?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          research_question: string | null
          subject: string | null
          subject_emoji: string | null
          status: ProjectStatus
          current_phase: ResearchPhase
          due_date: string | null
          memory_context: Json
          progress_data: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          research_question?: string | null
          subject?: string | null
          subject_emoji?: string | null
          status?: ProjectStatus
          current_phase?: ResearchPhase
          due_date?: string | null
          memory_context?: Json
          progress_data?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          research_question?: string | null
          subject?: string | null
          subject_emoji?: string | null
          status?: ProjectStatus
          current_phase?: ResearchPhase
          due_date?: string | null
          memory_context?: Json
          progress_data?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      project_memory: {
        Row: {
          id: string
          project_id: string
          content_type: ContentType
          content: string
          embedding_vector: number[] | null
          relevance_score: number | null
          metadata: Json
          timestamp: string
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          content_type: ContentType
          content: string
          embedding_vector?: number[] | null
          relevance_score?: number | null
          metadata?: Json
          timestamp?: string
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          content_type?: ContentType
          content?: string
          embedding_vector?: number[] | null
          relevance_score?: number | null
          metadata?: Json
          timestamp?: string
          session_id?: string | null
          created_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          project_id: string
          title: string
          authors: string[] | null
          url: string | null
          doi: string | null
          publication_year: number | null
          journal: string | null
          source_type: SourceType | null
          credibility_score: number | null
          summary: string | null
          notes: string | null
          memory_tags: string[] | null
          citation_style: Json
          file_path: string | null
          status: SourceStatus
          added_at: string
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          authors?: string[] | null
          url?: string | null
          doi?: string | null
          publication_year?: number | null
          journal?: string | null
          source_type?: SourceType | null
          credibility_score?: number | null
          summary?: string | null
          notes?: string | null
          memory_tags?: string[] | null
          citation_style?: Json
          file_path?: string | null
          status?: SourceStatus
          added_at?: string
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          authors?: string[] | null
          url?: string | null
          doi?: string | null
          publication_year?: number | null
          journal?: string | null
          source_type?: SourceType | null
          credibility_score?: number | null
          summary?: string | null
          notes?: string | null
          memory_tags?: string[] | null
          citation_style?: Json
          file_path?: string | null
          status?: SourceStatus
          added_at?: string
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          message: string
          ai_response: string
          context_recall: Json
          tokens_used: number | null
          model_used: string | null
          conversation_metadata: Json
          attachments: Json
          feedback: Json
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          message: string
          ai_response: string
          context_recall?: Json
          tokens_used?: number | null
          model_used?: string | null
          conversation_metadata?: Json
          attachments?: Json
          feedback?: Json
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          message?: string
          ai_response?: string
          context_recall?: Json
          tokens_used?: number | null
          model_used?: string | null
          conversation_metadata?: Json
          attachments?: Json
          feedback?: Json
          timestamp?: string
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          session_start: string
          session_end: string | null
          activity_data: Json
          total_duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          session_start?: string
          session_end?: string | null
          activity_data?: Json
          total_duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          session_start?: string
          session_end?: string | null
          activity_data?: Json
          total_duration?: number | null
          created_at?: string
        }
      }
      project_methodology: {
        Row: {
          id: string
          project_id: string
          method_type: string
          method_name: string
          reasoning: string | null
          independent_variables: Json
          dependent_variables: Json
          control_variables: Json
          participant_criteria: string | null
          estimated_sample_size: number | null
          recruitment_strategy: string | null
          procedure_draft: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          method_type: string
          method_name: string
          reasoning?: string | null
          independent_variables?: Json
          dependent_variables?: Json
          control_variables?: Json
          participant_criteria?: string | null
          estimated_sample_size?: number | null
          recruitment_strategy?: string | null
          procedure_draft?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          method_type?: string
          method_name?: string
          reasoning?: string | null
          independent_variables?: Json
          dependent_variables?: Json
          control_variables?: Json
          participant_criteria?: string | null
          estimated_sample_size?: number | null
          recruitment_strategy?: string | null
          procedure_draft?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_project_with_stats: {
        Args: {
          project_uuid: string
        }
        Returns: Json
      }
      search_project_memory: {
        Args: {
          project_uuid: string
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          content_type: string
          relevance_score: number
          similarity: number
          timestamp: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for application use
export type User = Database['public']['Tables']['users']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectMemory = Database['public']['Tables']['project_memory']['Row']
export type Source = Database['public']['Tables']['sources']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type ProjectMethodology = Database['public']['Tables']['project_methodology']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectMemoryInsert = Database['public']['Tables']['project_memory']['Insert']
export type SourceInsert = Database['public']['Tables']['sources']['Insert']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type UserSessionInsert = Database['public']['Tables']['user_sessions']['Insert']
export type ProjectMethodologyInsert = Database['public']['Tables']['project_methodology']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProjectMemoryUpdate = Database['public']['Tables']['project_memory']['Update']
export type SourceUpdate = Database['public']['Tables']['sources']['Update']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
export type UserSessionUpdate = Database['public']['Tables']['user_sessions']['Update']
export type ProjectMethodologyUpdate = Database['public']['Tables']['project_methodology']['Update']

// Progress data type structure
export interface ProjectProgressData {
  question: {
    completed: boolean
    progress: number
  }
  literature: {
    completed: boolean
    progress: number
    sources_count: number
  }
  methodology: {
    completed: boolean
    progress: number
  }
  writing: {
    completed: boolean
    progress: number
    word_count: number
  }
}

// User settings type structure
export interface UserSettings {
  notifications: boolean
  email_updates: boolean
  data_sharing: boolean
  theme: 'light' | 'dark'
}

// User profile data type structure
export interface UserProfileData {
  name?: string
  avatar_url?: string
  bio?: string
  university?: string
  major?: string
  year?: string
  location?: string
  website?: string
  social_links?: {
    twitter?: string
    linkedin?: string
    github?: string
    orcid?: string
  }
}

// Memory search result type
export type MemorySearchResult = {
  id: string
  content: string
  content_type: ContentType
  relevance_score: number
  similarity: number
  timestamp: string
}

// Project statistics type
export interface ProjectStats {
  project: Project
  source_count: number
  conversation_count: number
  memory_items_count: number
  last_activity: string | null
}