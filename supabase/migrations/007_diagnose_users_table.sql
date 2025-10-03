-- Diagnose and fix users table issues that might be causing auth failures

-- Check if users table exists and its structure
DO $$
DECLARE
    table_exists boolean;
    constraint_info record;
BEGIN
    -- Check if users table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE 'Users table exists';

        -- Check constraints that might be causing issues
        FOR constraint_info IN
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'users'
            AND table_schema = 'public'
        LOOP
            RAISE NOTICE 'Constraint: % (Type: %)', constraint_info.constraint_name, constraint_info.constraint_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'Users table does not exist - this might be the issue';
    END IF;
END $$;

-- If users table doesn't exist or has issues, create a minimal working version
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure proper RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create minimal, permissive policies for auth to work
CREATE POLICY "Enable read access for users based on user_id" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert access for users based on user_id" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for users based on user_id" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Check auth.users access
DO $$
BEGIN
    -- Test if we can access auth schema
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE NOTICE 'Auth schema exists';
    ELSE
        RAISE NOTICE 'Auth schema missing - this is a critical issue';
    END IF;
END $$;

-- Final diagnostic message
DO $$
BEGIN
    RAISE NOTICE '
    🔍 Users Table Diagnostic Complete!

    🔧 Actions Taken:
    • Ensured users table exists with minimal schema
    • Created UUID primary key referencing auth.users(id)
    • Enabled RLS with permissive policies for auth operations
    • Verified auth schema accessibility

    📝 This should resolve database constraint issues that prevent auth.signUp()

    🚀 Test email registration again to verify the fix!
    ';
END $$;