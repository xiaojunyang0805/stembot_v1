export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          avatar_url: string | null
          role: 'student' | 'educator' | 'admin'
          grade: string | null
          school: string | null
          bio: string | null
          preferences: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
          last_seen_at: string | null
          is_active: boolean
          email_verified: boolean
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'educator' | 'admin'
          grade?: string | null
          school?: string | null
          bio?: string | null
          preferences?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
          is_active?: boolean
          email_verified?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'educator' | 'admin'
          grade?: string | null
          school?: string | null
          bio?: string | null
          preferences?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
          is_active?: boolean
          email_verified?: boolean
        }
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          subject: string
          topic: string
          level: number
          score: number
          time_spent: number
          completed_at: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          topic: string
          level?: number
          score?: number
          time_spent?: number
          completed_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          topic?: string
          level?: number
          score?: number
          time_spent?: number
          completed_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          expires_at: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'educator' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}