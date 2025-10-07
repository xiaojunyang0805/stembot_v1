-- Create paper_outlines table for storing generated paper outlines
CREATE TABLE IF NOT EXISTS paper_outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  outline_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_paper_outlines_project_id ON paper_outlines(project_id);

-- Add RLS policies
ALTER TABLE paper_outlines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view outlines for their own projects
CREATE POLICY "Users can view their own project outlines"
  ON paper_outlines
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert outlines for their own projects
CREATE POLICY "Users can create outlines for their own projects"
  ON paper_outlines
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update outlines for their own projects
CREATE POLICY "Users can update their own project outlines"
  ON paper_outlines
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete outlines for their own projects
CREATE POLICY "Users can delete their own project outlines"
  ON paper_outlines
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
