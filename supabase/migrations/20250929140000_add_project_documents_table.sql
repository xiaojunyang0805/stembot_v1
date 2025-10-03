-- Create project_documents table for file upload and document management
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL,
    storage_path TEXT,
    extracted_text TEXT,
    analysis_result JSONB DEFAULT '{}',
    upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('uploading', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_user_id ON project_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_created_at ON project_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_documents_mime_type ON project_documents(mime_type);

-- Create full-text search index for extracted text
CREATE INDEX IF NOT EXISTS idx_project_documents_text_search
ON project_documents USING gin(to_tsvector('english', COALESCE(extracted_text, '') || ' ' || original_name));

-- Enable Row Level Security
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to handle re-runs)
DROP POLICY IF EXISTS "Users can view own documents" ON project_documents;
DROP POLICY IF EXISTS "Users can create own documents" ON project_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON project_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON project_documents;

-- Create RLS policies for project_documents
CREATE POLICY "Users can view own documents" ON project_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" ON project_documents
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_documents.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can update own documents" ON project_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON project_documents
    FOR DELETE USING (auth.uid() = user_id);