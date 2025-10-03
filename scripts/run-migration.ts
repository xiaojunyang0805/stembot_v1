/**
 * Script to execute database migration for project_methodology table
 * Run with: npx ts-node scripts/run-migration.ts
 */

import fs from 'fs'
import path from 'path'

const MIGRATION_SQL = `
-- WP4-1.3: Database Schema for Methodology Storage
-- Creates project_methodology table to persist methodology choices

-- Create project_methodology table
CREATE TABLE IF NOT EXISTS project_methodology (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  method_type VARCHAR(50) NOT NULL,
  method_name VARCHAR(255) NOT NULL,
  reasoning TEXT,
  independent_variables JSONB,
  dependent_variables JSONB,
  control_variables JSONB,
  participant_criteria TEXT,
  estimated_sample_size INTEGER,
  recruitment_strategy TEXT,
  procedure_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_methodology_project ON project_methodology(project_id);
CREATE INDEX IF NOT EXISTS idx_methodology_created ON project_methodology(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_methodology_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER methodology_updated_at
  BEFORE UPDATE ON project_methodology
  FOR EACH ROW
  EXECUTE FUNCTION update_methodology_updated_at();

-- Add RLS policies
ALTER TABLE project_methodology ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own project methodologies
CREATE POLICY "Users can view their own project methodologies"
  ON project_methodology
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert methodologies for their own projects
CREATE POLICY "Users can insert methodologies for their own projects"
  ON project_methodology
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own project methodologies
CREATE POLICY "Users can update their own project methodologies"
  ON project_methodology
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own project methodologies
CREATE POLICY "Users can delete their own project methodologies"
  ON project_methodology
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE project_methodology IS 'Stores methodology decisions for research projects, including variables, procedures, and sampling strategies';
`

async function runMigration() {
  console.log('🚀 Starting migration execution...\n')

  try {
    // Use direct Supabase connection
    const { createClient } = require('@supabase/supabase-js')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('📝 Executing SQL migration...')

    // Split SQL into individual statements
    const statements = MIGRATION_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`)

      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement })

        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error.message)
          // Continue with next statement
        } else {
          console.log(`✅ Statement ${i + 1} completed`)
        }
      } catch (err: any) {
        console.error(`❌ Statement ${i + 1} error:`, err.message)
        // Continue with next statement
      }
    }

    console.log('\n✅ Migration execution completed!')
    console.log('📊 Verifying table creation...')

    // Verify table exists
    const { data, error } = await supabase
      .from('project_methodology')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      console.log('⚠️  Table not found - migration may have failed')
      console.log('Please apply the migration manually via Supabase SQL Editor')
    } else if (error) {
      console.log('⚠️  Verification error:', error.message)
    } else {
      console.log('✅ Table verified successfully!')
    }

  } catch (error: any) {
    console.error('💥 Migration failed:', error.message)
    console.log('\n📋 Manual migration instructions:')
    console.log('1. Go to https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq/sql/new')
    console.log('2. Copy the SQL from supabase/migrations/20251003_create_project_methodology.sql')
    console.log('3. Paste and run it in the SQL Editor')
    process.exit(1)
  }
}

runMigration()
