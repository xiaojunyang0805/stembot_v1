-- Create tables for cross-phase integration
-- These tables support data flow between literature review and other research phases

-- Project literature states table
CREATE TABLE project_literature_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Project association
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Literature state data (stored as JSONB for flexibility)
  literature_data JSONB NOT NULL,

  -- Quick access metadata
  source_count INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project notifications table
CREATE TABLE project_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Project association
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Notification data (stored as JSONB for flexibility)
  notification_data JSONB NOT NULL,

  -- Quick access fields
  type TEXT NOT NULL, -- 'gap_identified', 'milestone_reached', 'methodology_suggestion', 'citation_ready'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  read BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project memory table for AI context
CREATE TABLE project_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Project association
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Memory type and data
  memory_type TEXT NOT NULL, -- 'literature_context', 'methodology_context', 'writing_context'
  memory_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one memory entry per type per project
  UNIQUE(project_id, memory_type)
);

-- Cross-phase progress tracking
CREATE TABLE cross_phase_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Project association
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Phase information
  from_phase TEXT NOT NULL, -- 'literature', 'methodology', 'writing'
  to_phase TEXT NOT NULL,

  -- Data flow information
  data_type TEXT NOT NULL, -- 'sources', 'recommendations', 'citations', 'gaps'
  data_payload JSONB NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'synced', 'failed'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_project_literature_states_project_id ON project_literature_states(project_id);
CREATE INDEX idx_project_literature_states_updated_at ON project_literature_states(updated_at);
CREATE INDEX idx_project_literature_states_progress ON project_literature_states(progress_percentage);

CREATE INDEX idx_project_notifications_project_id ON project_notifications(project_id);
CREATE INDEX idx_project_notifications_created_at ON project_notifications(created_at);
CREATE INDEX idx_project_notifications_type ON project_notifications(type);
CREATE INDEX idx_project_notifications_priority ON project_notifications(priority);
CREATE INDEX idx_project_notifications_read ON project_notifications(read);

CREATE INDEX idx_project_memory_project_id ON project_memory(project_id);
CREATE INDEX idx_project_memory_type ON project_memory(memory_type);
CREATE INDEX idx_project_memory_updated_at ON project_memory(updated_at);

CREATE INDEX idx_cross_phase_progress_project_id ON cross_phase_progress(project_id);
CREATE INDEX idx_cross_phase_progress_phases ON cross_phase_progress(from_phase, to_phase);
CREATE INDEX idx_cross_phase_progress_status ON cross_phase_progress(status);
CREATE INDEX idx_cross_phase_progress_created_at ON cross_phase_progress(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE project_literature_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_phase_progress ENABLE ROW LEVEL SECURITY;

-- Policies for project_literature_states
CREATE POLICY "Users can view their own project literature states" ON project_literature_states
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert literature states for their projects" ON project_literature_states
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project literature states" ON project_literature_states
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project literature states" ON project_literature_states
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policies for project_notifications
CREATE POLICY "Users can view their own project notifications" ON project_notifications
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notifications for their projects" ON project_notifications
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project notifications" ON project_notifications
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project notifications" ON project_notifications
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policies for project_memory (similar pattern for other tables)
CREATE POLICY "Users can view their own project memory" ON project_memory
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert memory for their projects" ON project_memory
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project memory" ON project_memory
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project memory" ON project_memory
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policies for cross_phase_progress
CREATE POLICY "Users can view their own cross-phase progress" ON cross_phase_progress
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cross-phase progress for their projects" ON cross_phase_progress
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cross-phase progress" ON cross_phase_progress
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cross-phase progress" ON cross_phase_progress
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Add update triggers
CREATE OR REPLACE FUNCTION update_cross_phase_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_literature_states_updated_at
  BEFORE UPDATE ON project_literature_states
  FOR EACH ROW
  EXECUTE FUNCTION update_cross_phase_updated_at();

CREATE TRIGGER update_project_notifications_updated_at
  BEFORE UPDATE ON project_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_cross_phase_updated_at();

CREATE TRIGGER update_project_memory_updated_at
  BEFORE UPDATE ON project_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_cross_phase_updated_at();

CREATE TRIGGER update_cross_phase_progress_updated_at
  BEFORE UPDATE ON cross_phase_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_cross_phase_updated_at();

-- Add comments for documentation
COMMENT ON TABLE project_literature_states IS 'Stores complete literature state for cross-phase integration';
COMMENT ON COLUMN project_literature_states.literature_data IS 'Complete literature state including sources, organization, gap analysis, and recommendations';
COMMENT ON COLUMN project_literature_states.source_count IS 'Quick access to number of sources';
COMMENT ON COLUMN project_literature_states.progress_percentage IS 'Literature review progress percentage';

COMMENT ON TABLE project_notifications IS 'Cross-phase notifications for milestone tracking and suggestions';
COMMENT ON COLUMN project_notifications.notification_data IS 'Complete notification data including title, message, and actions';
COMMENT ON COLUMN project_notifications.type IS 'Notification type for filtering and processing';
COMMENT ON COLUMN project_notifications.priority IS 'Priority level for notification ordering';

COMMENT ON TABLE project_memory IS 'AI context memory for cross-phase conversations';
COMMENT ON COLUMN project_memory.memory_type IS 'Type of memory context (literature, methodology, writing)';
COMMENT ON COLUMN project_memory.memory_data IS 'Memory context data for AI conversations';

COMMENT ON TABLE cross_phase_progress IS 'Tracks data flow between research phases';
COMMENT ON COLUMN cross_phase_progress.from_phase IS 'Source phase of data flow';
COMMENT ON COLUMN cross_phase_progress.to_phase IS 'Target phase of data flow';
COMMENT ON COLUMN cross_phase_progress.data_type IS 'Type of data being transferred';
COMMENT ON COLUMN cross_phase_progress.data_payload IS 'Actual data being transferred between phases';