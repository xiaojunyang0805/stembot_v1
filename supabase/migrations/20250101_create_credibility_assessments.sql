-- Create credibility_assessments table for caching AI-powered credibility assessments
-- This table stores credibility assessments to avoid re-analyzing the same papers

CREATE TABLE credibility_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Source identification
  source_hash TEXT NOT NULL UNIQUE, -- Hash of title+journal+year+authors for caching
  title TEXT NOT NULL,
  journal TEXT NOT NULL,
  year INTEGER NOT NULL,
  doi TEXT,

  -- Assessment data (stored as JSONB for flexibility)
  assessment_data JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_credibility_assessments_source_hash ON credibility_assessments(source_hash);
CREATE INDEX idx_credibility_assessments_journal ON credibility_assessments(journal);
CREATE INDEX idx_credibility_assessments_year ON credibility_assessments(year);
CREATE INDEX idx_credibility_assessments_created_at ON credibility_assessments(created_at);

-- Add RLS (Row Level Security) - assessments are public for efficiency
ALTER TABLE credibility_assessments ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading cached assessments (public for performance)
CREATE POLICY "Allow reading credibility assessments" ON credibility_assessments
  FOR SELECT
  USING (true);

-- Policy to allow inserting/updating assessments (public for caching)
CREATE POLICY "Allow inserting credibility assessments" ON credibility_assessments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updating credibility assessments" ON credibility_assessments
  FOR UPDATE
  USING (true);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_credibility_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credibility_assessments_updated_at
  BEFORE UPDATE ON credibility_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_credibility_assessments_updated_at();

-- Add comments for documentation
COMMENT ON TABLE credibility_assessments IS 'Cache for AI-powered source credibility assessments';
COMMENT ON COLUMN credibility_assessments.source_hash IS 'Unique hash identifying the source (title+journal+year+authors)';
COMMENT ON COLUMN credibility_assessments.assessment_data IS 'Complete credibility assessment data including scores, explanations, and metrics';