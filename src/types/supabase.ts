// Generated TypeScript types for StemBot database
// Generated on: 2025-09-25T21:00:41.523Z

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          university: string | null
          subscription_tier: string
          research_interests: string[] | null
          academic_level: string | null
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
          subscription_tier?: string
          research_interests?: string[] | null
          academic_level?: string | null
          stripe_customer_id?: string | null
          profile_data?: Json
          settings?: Json
        }
        Update: {
          id?: string
          email?: string
          university?: string | null
          subscription_tier?: string
          research_interests?: string[] | null
          academic_level?: string | null
          stripe_customer_id?: string | null
          profile_data?: Json
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          research_question: string | null
          subject: string | null
          subject_emoji: string
          status: string
          current_phase: string
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
          subject_emoji?: string
          status?: string
          current_phase?: string
          due_date?: string | null
          memory_context?: Json
          progress_data?: Json
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          research_question?: string | null
          subject?: string | null
          subject_emoji?: string
          status?: string
          current_phase?: string
          due_date?: string | null
          memory_context?: Json
          progress_data?: Json
          metadata?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_memory: {
        Row: {
          id: string
          project_id: string
          content_type: string
          content: string
          embedding_vector: number[] | null
          relevance_score: number
          metadata: Json
          timestamp: string
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          content_type: string
          content: string
          embedding_vector?: number[] | null
          relevance_score?: number
          metadata?: Json
          timestamp?: string
          session_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          content_type?: string
          content?: string
          embedding_vector?: number[] | null
          relevance_score?: number
          metadata?: Json
          timestamp?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_memory_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
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
          source_type: string | null
          credibility_score: number
          summary: string | null
          notes: string | null
          memory_tags: string[] | null
          citation_style: Json
          file_path: string | null
          status: string
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
          source_type?: string | null
          credibility_score?: number
          summary?: string | null
          notes?: string | null
          memory_tags?: string[] | null
          citation_style?: Json
          file_path?: string | null
          status?: string
          added_at?: string
          reviewed_at?: string | null
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
          source_type?: string | null
          credibility_score?: number
          summary?: string | null
          notes?: string | null
          memory_tags?: string[] | null
          citation_style?: Json
          file_path?: string | null
          status?: string
          added_at?: string
          reviewed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          message: string
          ai_response: string
          context_recall: Json
          tokens_used: number
          model_used: string
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
          tokens_used?: number
          model_used?: string
          conversation_metadata?: Json
          attachments?: Json
          feedback?: Json
          timestamp?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          message?: string
          ai_response?: string
          context_recall?: Json
          tokens_used?: number
          model_used?: string
          conversation_metadata?: Json
          attachments?: Json
          feedback?: Json
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          session_start: string
          session_end: string | null
          activity_data: Json
          total_duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          session_start?: string
          session_end?: string | null
          activity_data?: Json
          total_duration?: number
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          session_start?: string
          session_end?: string | null
          activity_data?: Json
          total_duration?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]