-- Create source_organizations table for caching AI-powered source organization
-- This table stores source organization results to avoid re-processing the same collections

CREATE TABLE source_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Project association
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Organization data (stored as JSONB for flexibility)
  organization_data JSONB NOT NULL,

  -- Organization metadata
  source_count INTEGER NOT NULL DEFAULT 0,
  organization_version TEXT DEFAULT '1.0',
  clustering_method TEXT DEFAULT 'ai-similarity',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_source_organizations_project_id ON source_organizations(project_id);
CREATE INDEX idx_source_organizations_created_at ON source_organizations(created_at);
CREATE INDEX idx_source_organizations_source_count ON source_organizations(source_count);
CREATE INDEX idx_source_organizations_clustering_method ON source_organizations(clustering_method);

-- Add RLS (Row Level Security)
ALTER TABLE source_organizations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own source organizations
CREATE POLICY "Users can view their own source organizations" ON source_organizations
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to insert source organizations for their projects
CREATE POLICY "Users can insert source organizations for their projects" ON source_organizations
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to update their own source organizations
CREATE POLICY "Users can update their own source organizations" ON source_organizations
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to delete their own source organizations
CREATE POLICY "Users can delete their own source organizations" ON source_organizations
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Add update trigger
CREATE OR REPLACE FUNCTION update_source_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_source_organizations_updated_at
  BEFORE UPDATE ON source_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_source_organizations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE source_organizations IS 'Cache for AI-powered source organization by project';
COMMENT ON COLUMN source_organizations.organization_data IS 'Complete source organization including themes, methodologies, and timeline';
COMMENT ON COLUMN source_organizations.source_count IS 'Number of sources that were organized';
COMMENT ON COLUMN source_organizations.organization_version IS 'Version of the organization algorithm used';
COMMENT ON COLUMN source_organizations.clustering_method IS 'Method used for clustering (ai-similarity, manual, hybrid)';