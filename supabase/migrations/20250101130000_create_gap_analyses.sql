-- Create gap_analyses table for caching AI-powered literature gap analyses
-- This table stores gap analysis results to avoid re-processing the same source collections

CREATE TABLE gap_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Project association
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Analysis results (stored as JSONB for flexibility)
  analysis_data JSONB NOT NULL,

  -- Analysis metadata
  source_count INTEGER NOT NULL DEFAULT 0,
  analysis_version TEXT DEFAULT '1.0',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_gap_analyses_project_id ON gap_analyses(project_id);
CREATE INDEX idx_gap_analyses_created_at ON gap_analyses(created_at);
CREATE INDEX idx_gap_analyses_source_count ON gap_analyses(source_count);

-- Add RLS (Row Level Security)
ALTER TABLE gap_analyses ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own gap analyses
CREATE POLICY "Users can view their own gap analyses" ON gap_analyses
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to insert gap analyses for their projects
CREATE POLICY "Users can insert gap analyses for their projects" ON gap_analyses
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to update their own gap analyses
CREATE POLICY "Users can update their own gap analyses" ON gap_analyses
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to delete their own gap analyses
CREATE POLICY "Users can delete their own gap analyses" ON gap_analyses
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Add update trigger
CREATE OR REPLACE FUNCTION update_gap_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gap_analyses_updated_at
  BEFORE UPDATE ON gap_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_gap_analyses_updated_at();

-- Add comments for documentation
COMMENT ON TABLE gap_analyses IS 'Cache for AI-powered literature gap analyses by project';
COMMENT ON COLUMN gap_analyses.analysis_data IS 'Complete gap analysis results including identified gaps, opportunities, and recommendations';
COMMENT ON COLUMN gap_analyses.source_count IS 'Number of sources analyzed to generate this gap analysis';
COMMENT ON COLUMN gap_analyses.analysis_version IS 'Version of the gap analysis algorithm used';