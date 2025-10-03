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
