-- Create paper_sections table for section-by-section writing
CREATE TABLE IF NOT EXISTS paper_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL,
  content TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, section_name)
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_paper_sections_project_id ON paper_sections(project_id);

-- Add RLS policies
ALTER TABLE paper_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sections for their own projects
CREATE POLICY "Users can view their own project sections"
  ON paper_sections
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert sections for their own projects
CREATE POLICY "Users can create sections for their own projects"
  ON paper_sections
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update sections for their own projects
CREATE POLICY "Users can update their own project sections"
  ON paper_sections
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete sections for their own projects
CREATE POLICY "Users can delete their own project sections"
  ON paper_sections
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_paper_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER paper_sections_updated_at
  BEFORE UPDATE ON paper_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_paper_sections_updated_at();
