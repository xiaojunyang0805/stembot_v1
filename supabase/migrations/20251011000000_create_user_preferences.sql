-- Create user_preferences table for storing user settings and preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Notification settings (JSONB for flexibility)
    notification_settings JSONB DEFAULT '{
        "email": {
            "project_deadlines": {"7_days": true, "3_days": true, "1_day": true},
            "weekly_summary": true,
            "announcements": true,
            "tips": true
        },
        "in_app": {
            "ai_suggestions": true,
            "milestones": true,
            "health_checks": true
        }
    }'::jsonb,

    -- Research preferences (JSONB for flexibility)
    research_preferences JSONB DEFAULT '{
        "methodologies": [],
        "statistical_software": "SPSS",
        "citation_style": "APA",
        "ai_assistance_level": "moderate",
        "auto_save": true,
        "default_timeline_weeks": 12
    }'::jsonb,

    -- Privacy settings (JSONB for flexibility)
    privacy_settings JSONB DEFAULT '{
        "analytics": true,
        "research_sharing": false,
        "chat_history": true,
        "chat_history_days": 30
    }'::jsonb,

    -- Storage settings
    storage_limit_mb INTEGER DEFAULT 100, -- Default 100MB for free tier

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one preference record per user
    UNIQUE(user_id)
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
    ON public.user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences for new users
CREATE TRIGGER on_auth_user_created_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_preferences();

-- Grant necessary permissions
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;

-- Comment on table
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences for notifications, research settings, and privacy options';
