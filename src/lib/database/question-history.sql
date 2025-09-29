-- Question History Tracking Table
-- Tracks how research questions evolve over time

CREATE TABLE IF NOT EXISTS question_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('vague', 'emerging', 'focused', 'research-ready')),
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  improved_from_version UUID REFERENCES question_history(id) ON DELETE SET NULL,
  detected_issues TEXT[], -- Array of issues found
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_history_project_id ON question_history(project_id);
CREATE INDEX IF NOT EXISTS idx_question_history_created_at ON question_history(created_at);
CREATE INDEX IF NOT EXISTS idx_question_history_stage ON question_history(stage);

-- RLS (Row Level Security) policies
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access question history for their own projects
CREATE POLICY "Users can access their own question history" ON question_history
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_question_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_question_history_updated_at
  BEFORE UPDATE ON question_history
  FOR EACH ROW
  EXECUTE FUNCTION update_question_history_updated_at();