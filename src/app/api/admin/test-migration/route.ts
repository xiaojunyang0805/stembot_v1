/**
 * Test endpoint to check Supabase connection and run migration
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const MIGRATION_SQL = `
-- WP4-1.3: Database Schema for Methodology Storage
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

CREATE INDEX IF NOT EXISTS idx_methodology_project ON project_methodology(project_id);
CREATE INDEX IF NOT EXISTS idx_methodology_created ON project_methodology(created_at);

CREATE OR REPLACE FUNCTION update_methodology_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS methodology_updated_at ON project_methodology;
CREATE TRIGGER methodology_updated_at
  BEFORE UPDATE ON project_methodology
  FOR EACH ROW
  EXECUTE FUNCTION update_methodology_updated_at();

ALTER TABLE project_methodology ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own project methodologies" ON project_methodology;
CREATE POLICY "Users can view their own project methodologies"
  ON project_methodology FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert methodologies for their own projects" ON project_methodology;
CREATE POLICY "Users can insert methodologies for their own projects"
  ON project_methodology FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own project methodologies" ON project_methodology;
CREATE POLICY "Users can update their own project methodologies"
  ON project_methodology FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own project methodologies" ON project_methodology;
CREATE POLICY "Users can delete their own project methodologies"
  ON project_methodology FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

COMMENT ON TABLE project_methodology IS 'Stores methodology decisions for research projects, including variables, procedures, and sampling strategies';
`

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...')

    // Test 1: Basic connection
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)

    if (projectError) {
      return NextResponse.json({
        success: false,
        step: 'connection_test',
        error: projectError.message
      }, { status: 500 })
    }

    console.log('✅ Connection successful')

    // Test 2: Check if table exists
    const { data: methodData, error: methodError } = await supabase
      .from('project_methodology')
      .select('id')
      .limit(1)

    const tableExists = methodError?.code !== '42P01'

    return NextResponse.json({
      success: true,
      connectionOk: true,
      tableExists,
      message: tableExists
        ? 'Migration already applied'
        : 'Table does not exist - ready to migrate'
    })
  } catch (error: any) {
    console.error('💥 Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('🚀 Running migration...')

    // Execute migration using raw SQL
    const { error } = await supabase.rpc('exec', {
      sql: MIGRATION_SQL
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('✅ Migration completed')

    // Verify table was created
    const { data, error: verifyError } = await supabase
      .from('project_methodology')
      .select('id')
      .limit(1)

    if (verifyError && verifyError.code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Table was not created',
        suggestion: 'Try manual migration via Supabase dashboard'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      tableExists: true
    })
  } catch (error: any) {
    console.error('💥 Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
