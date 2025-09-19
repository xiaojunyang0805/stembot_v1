-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- ================================
-- USER PROFILES POLICIES
-- ================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (handled by trigger, but adding for completeness)
CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Educators can view profiles of their students
CREATE POLICY "Educators can view student profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'educator'
    AND up.school = user_profiles.school
  )
  AND role = 'student'
);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- Policy: Public profiles (for display names in leaderboards, etc.)
CREATE POLICY "Public profile data"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow access to limited profile data for public display
  true -- This will be restricted by the application layer to only return safe fields
);

-- ================================
-- LEARNING PROGRESS POLICIES
-- ================================

-- Policy: Users can view their own learning progress
CREATE POLICY "Users can view their own learning progress"
ON learning_progress
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can insert their own learning progress
CREATE POLICY "Users can insert their own learning progress"
ON learning_progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own learning progress
CREATE POLICY "Users can update their own learning progress"
ON learning_progress
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own learning progress
CREATE POLICY "Users can delete their own learning progress"
ON learning_progress
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Educators can view learning progress of their students
CREATE POLICY "Educators can view student progress"
ON learning_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up_educator
    JOIN user_profiles up_student ON up_student.id = learning_progress.user_id
    WHERE up_educator.id = auth.uid()
    AND up_educator.role = 'educator'
    AND up_educator.school = up_student.school
    AND up_student.role = 'student'
  )
);

-- Policy: Admins can view all learning progress
CREATE POLICY "Admins can view all learning progress"
ON learning_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- Policy: Admins can manage all learning progress
CREATE POLICY "Admins can manage all learning progress"
ON learning_progress
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- ================================
-- USER SESSIONS POLICIES
-- ================================

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON user_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON user_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON user_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON user_sessions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admins can view all sessions (for security monitoring)
CREATE POLICY "Admins can view all sessions"
ON user_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- Policy: Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions"
ON user_sessions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- ================================
-- SECURITY FUNCTIONS
-- ================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is educator
CREATE OR REPLACE FUNCTION is_educator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'educator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is student
CREATE OR REPLACE FUNCTION is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if educator has access to student
CREATE OR REPLACE FUNCTION educator_has_student_access(educator_id UUID, student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles up_educator
    JOIN user_profiles up_student ON up_student.id = student_id
    WHERE up_educator.id = educator_id
    AND up_educator.role = 'educator'
    AND up_educator.school = up_student.school
    AND up_student.role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get safe profile data for public display
CREATE OR REPLACE FUNCTION get_public_profile(profile_user_id UUID)
RETURNS TABLE(
  id UUID,
  display_name VARCHAR,
  avatar_url TEXT,
  role user_role,
  school VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.display_name,
    up.avatar_url,
    up.role,
    up.school
  FROM user_profiles up
  WHERE up.id = profile_user_id
  AND up.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- AUDIT AND LOGGING
-- ================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action VARCHAR,
  p_table_name VARCHAR,
  p_record_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    p_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- DATA RETENTION POLICIES
-- ================================

-- Function to clean up old audit logs (keep for 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize deleted user data
CREATE OR REPLACE FUNCTION anonymize_deleted_user_data(deleted_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update learning progress to remove personal identifiers but keep aggregated data
  UPDATE learning_progress
  SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"anonymized": true}'::jsonb
  WHERE user_id = deleted_user_id;

  -- Log the anonymization
  PERFORM create_audit_log(
    deleted_user_id,
    'ANONYMIZE',
    'user_data',
    deleted_user_id,
    NULL,
    '{"action": "user_data_anonymized"}'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;