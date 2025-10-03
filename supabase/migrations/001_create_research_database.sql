-- ================================
-- StemBot Research Mentoring Database
-- Complete schema with RLS policies
-- ================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Custom types and enums
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE academic_level AS ENUM ('undergraduate', 'graduate', 'phd', 'postdoc', 'faculty');
CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE research_phase AS ENUM ('question', 'literature', 'methodology', 'writing');
CREATE TYPE content_type AS ENUM ('conversation', 'document', 'insight', 'note', 'research_context');
CREATE TYPE source_type AS ENUM ('journal', 'book', 'conference', 'thesis', 'report', 'website', 'other');
CREATE TYPE source_status AS ENUM ('pending', 'reviewed', 'cited', 'rejected');

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    university TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    research_interests TEXT[],
    academic_level academic_level,
    stripe_customer_id TEXT,
    profile_data JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{
        "notifications": true,
        "email_updates": true,
        "data_sharing": false,
        "theme": "light"
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- PROJECTS TABLE
-- ================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    research_question TEXT,
    subject TEXT,
    subject_emoji TEXT DEFAULT '📊',
    status project_status DEFAULT 'active',
    current_phase research_phase DEFAULT 'question',
    due_date TIMESTAMPTZ,
    memory_context JSONB DEFAULT '{}',
    progress_data JSONB DEFAULT '{
        "question": {"completed": false, "progress": 0},
        "literature": {"completed": false, "progress": 0, "sources_count": 0},
        "methodology": {"completed": false, "progress": 0},
        "writing": {"completed": false, "progress": 0, "word_count": 0}
    }',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- PROJECT MEMORY TABLE
-- ================================
CREATE TABLE project_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content TEXT NOT NULL,
    embedding_vector VECTOR(1536), -- OpenAI embedding dimension
    relevance_score FLOAT DEFAULT 0.0,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- SOURCES TABLE
-- ================================
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT[],
    url TEXT,
    doi TEXT,
    publication_year INTEGER,
    journal TEXT,
    source_type source_type DEFAULT 'other',
    credibility_score FLOAT DEFAULT 0.0,
    summary TEXT,
    notes TEXT,
    memory_tags TEXT[],
    citation_style JSONB DEFAULT '{}',
    file_path TEXT,
    status source_status DEFAULT 'pending',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- CONVERSATIONS TABLE
-- ================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_recall JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4',
    conversation_metadata JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    feedback JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- USER SESSIONS TABLE
-- ================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    activity_data JSONB DEFAULT '{}',
    total_duration INTEGER, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_current_phase ON projects(current_phase);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Project memory indexes
CREATE INDEX idx_project_memory_project_id ON project_memory(project_id);
CREATE INDEX idx_project_memory_content_type ON project_memory(content_type);
CREATE INDEX idx_project_memory_timestamp ON project_memory(timestamp DESC);
CREATE INDEX idx_project_memory_relevance_score ON project_memory(relevance_score DESC);

-- Vector similarity search index
CREATE INDEX idx_project_memory_embedding ON project_memory
USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

-- Sources indexes
CREATE INDEX idx_sources_project_id ON sources(project_id);
CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_sources_credibility_score ON sources(credibility_score DESC);
CREATE INDEX idx_sources_added_at ON sources(added_at DESC);

-- Conversations indexes
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_project_id ON user_sessions(project_id);
CREATE INDEX idx_user_sessions_session_start ON user_sessions(session_start DESC);

-- ================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project memory policies
CREATE POLICY "Users can view project memory for own projects" ON project_memory
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_memory.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can create project memory for own projects" ON project_memory
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_memory.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can update project memory for own projects" ON project_memory
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_memory.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can delete project memory for own projects" ON project_memory
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_memory.project_id AND projects.user_id = auth.uid())
    );

-- Sources policies
CREATE POLICY "Users can view sources for own projects" ON sources
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = sources.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can create sources for own projects" ON sources
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = sources.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can update sources for own projects" ON sources
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = sources.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can delete sources for own projects" ON sources
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = sources.project_id AND projects.user_id = auth.uid())
    );

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM projects WHERE projects.id = conversations.project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Function to get project with statistics
CREATE OR REPLACE FUNCTION get_project_with_stats(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
    project_data JSON;
    stats JSON;
BEGIN
    -- Get project data
    SELECT row_to_json(p) INTO project_data
    FROM projects p
    WHERE p.id = project_uuid AND p.user_id = auth.uid();

    -- Get statistics
    SELECT json_build_object(
        'source_count', COALESCE((SELECT COUNT(*) FROM sources WHERE project_id = project_uuid), 0),
        'conversation_count', COALESCE((SELECT COUNT(*) FROM conversations WHERE project_id = project_uuid), 0),
        'memory_items_count', COALESCE((SELECT COUNT(*) FROM project_memory WHERE project_id = project_uuid), 0),
        'last_activity', (
            SELECT MAX(timestamp) FROM (
                SELECT MAX(created_at) as timestamp FROM sources WHERE project_id = project_uuid
                UNION ALL
                SELECT MAX(timestamp) as timestamp FROM conversations WHERE project_id = project_uuid
                UNION ALL
                SELECT MAX(created_at) as timestamp FROM project_memory WHERE project_id = project_uuid
            ) activities
        )
    ) INTO stats;

    -- Return combined data
    RETURN json_build_object(
        'project', project_data,
        'stats', stats
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for semantic search in project memory
CREATE OR REPLACE FUNCTION search_project_memory(
    project_uuid UUID,
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    content_type TEXT,
    relevance_score FLOAT,
    similarity FLOAT,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pm.id,
        pm.content,
        pm.content_type::TEXT,
        pm.relevance_score,
        1 - (pm.embedding_vector <=> query_embedding) as similarity,
        pm.timestamp
    FROM project_memory pm
    WHERE pm.project_id = project_uuid
        AND pm.embedding_vector IS NOT NULL
        AND 1 - (pm.embedding_vector <=> query_embedding) > match_threshold
        AND EXISTS (SELECT 1 FROM projects p WHERE p.id = project_uuid AND p.user_id = auth.uid())
    ORDER BY pm.embedding_vector <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '
    ✅ StemBot Research Database Setup Complete!

    📊 Tables Created:
    • users (with profiles and settings)
    • projects (research project management)
    • project_memory (AI context storage with vector search)
    • sources (literature management)
    • conversations (AI chat history)
    • user_sessions (activity tracking)

    🔐 Security Features:
    • Row Level Security (RLS) enabled on all tables
    • User isolation policies implemented
    • JWT-based authentication integration

    ⚡ Performance Features:
    • Optimized indexes for common queries
    • Vector similarity search for semantic memory
    • Automatic timestamp management

    🛠️ Helper Functions:
    • get_project_with_stats() - Project analytics
    • search_project_memory() - Semantic search

    Ready for production use! 🚀
    ';
END $$;