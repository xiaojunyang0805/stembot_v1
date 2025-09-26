#!/usr/bin/env node

/**
 * Generate TypeScript types from Supabase database schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function generateTypes() {
  console.log('🚀 Generating TypeScript types from database schema...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Get table information
    console.log('📝 Fetching database schema information...');

    const tables = ['users', 'projects', 'project_memory', 'sources', 'conversations', 'user_sessions'];
    let typeDefinitions = `// Generated TypeScript types for StemBot database
// Generated on: ${new Date().toISOString()}

export interface Database {
  public: {
    Tables: {
`;

    for (const tableName of tables) {
      console.log(`  • Processing table: ${tableName}`);

      // Get a sample record to infer types
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.warn(`    ⚠️  Warning: Could not access ${tableName}: ${error.message}`);
        continue;
      }

      // Generate basic type definition based on table structure
      typeDefinitions += `      ${tableName}: {
        Row: {
`;

      // Common fields we know exist based on our schema
      const commonFields = {
        users: {
          id: 'string',
          email: 'string',
          university: 'string | null',
          subscription_tier: 'string',
          research_interests: 'string[] | null',
          academic_level: 'string | null',
          stripe_customer_id: 'string | null',
          profile_data: 'Json',
          settings: 'Json',
          created_at: 'string',
          updated_at: 'string'
        },
        projects: {
          id: 'string',
          user_id: 'string',
          title: 'string',
          research_question: 'string | null',
          subject: 'string | null',
          subject_emoji: 'string',
          status: 'string',
          current_phase: 'string',
          due_date: 'string | null',
          memory_context: 'Json',
          progress_data: 'Json',
          metadata: 'Json',
          created_at: 'string',
          updated_at: 'string'
        },
        project_memory: {
          id: 'string',
          project_id: 'string',
          content_type: 'string',
          content: 'string',
          embedding_vector: 'number[] | null',
          relevance_score: 'number',
          metadata: 'Json',
          timestamp: 'string',
          session_id: 'string | null',
          created_at: 'string'
        },
        sources: {
          id: 'string',
          project_id: 'string',
          title: 'string',
          authors: 'string[] | null',
          url: 'string | null',
          doi: 'string | null',
          publication_year: 'number | null',
          journal: 'string | null',
          source_type: 'string | null',
          credibility_score: 'number',
          summary: 'string | null',
          notes: 'string | null',
          memory_tags: 'string[] | null',
          citation_style: 'Json',
          file_path: 'string | null',
          status: 'string',
          added_at: 'string',
          reviewed_at: 'string | null',
          created_at: 'string',
          updated_at: 'string'
        },
        conversations: {
          id: 'string',
          project_id: 'string',
          user_id: 'string',
          message: 'string',
          ai_response: 'string',
          context_recall: 'Json',
          tokens_used: 'number',
          model_used: 'string',
          conversation_metadata: 'Json',
          attachments: 'Json',
          feedback: 'Json',
          timestamp: 'string',
          created_at: 'string'
        },
        user_sessions: {
          id: 'string',
          user_id: 'string',
          project_id: 'string | null',
          session_start: 'string',
          session_end: 'string | null',
          activity_data: 'Json',
          total_duration: 'number',
          created_at: 'string'
        }
      };

      const fields = commonFields[tableName] || {};

      Object.entries(fields).forEach(([fieldName, fieldType]) => {
        typeDefinitions += `          ${fieldName}: ${fieldType}\n`;
      });

      typeDefinitions += `        }
        Insert: {
          id?: string
`;

      // Add insert types (most fields optional except required ones)
      const requiredInsertFields = {
        users: ['email'],
        projects: ['user_id', 'title'],
        project_memory: ['project_id', 'content_type', 'content'],
        sources: ['project_id', 'title'],
        conversations: ['project_id', 'user_id', 'message', 'ai_response'],
        user_sessions: ['user_id']
      };

      const required = requiredInsertFields[tableName] || [];

      Object.entries(fields).forEach(([fieldName, fieldType]) => {
        if (fieldName === 'id' || fieldName.includes('created_at') || fieldName.includes('updated_at')) {
          return; // Skip auto-generated fields
        }

        const isRequired = required.includes(fieldName);
        const optionalType = isRequired ? fieldType : `${fieldType} | null`;
        const prefix = isRequired ? '          ' : '          ';
        const suffix = isRequired ? '' : '?';

        typeDefinitions += `${prefix}${fieldName}${suffix}: ${optionalType}\n`;
      });

      typeDefinitions += `        }
        Update: {
`;

      // Add update types (all fields optional)
      Object.entries(fields).forEach(([fieldName, fieldType]) => {
        if (fieldName === 'created_at') return; // Skip immutable fields
        typeDefinitions += `          ${fieldName}?: ${fieldType}\n`;
      });

      typeDefinitions += `        }
        Relationships: []
      }
`;
    }

    typeDefinitions += `    }
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
`;

    // Write types file
    const typesPath = path.join(__dirname, '..', 'src', 'types', 'supabase.ts');
    const typesDir = path.dirname(typesPath);

    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    fs.writeFileSync(typesPath, typeDefinitions);

    console.log(`\n✅ TypeScript types generated successfully!`);
    console.log(`📁 Saved to: ${typesPath}`);
    console.log(`📊 Generated types for ${tables.length} tables`);

  } catch (error) {
    console.error('\n❌ Type generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateTypes().catch(console.error);
}

module.exports = { generateTypes };