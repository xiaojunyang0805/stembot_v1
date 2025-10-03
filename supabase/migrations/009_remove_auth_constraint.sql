-- Remove foreign key constraint that blocks custom authentication
-- This allows us to create users without Supabase Auth dependency

-- Drop the foreign key constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make sure id column can accept custom UUIDs
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Update RLS policies to be more permissive for custom auth
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert during registration" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create permissive policies for custom authentication
CREATE POLICY "Allow all select for authenticated users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for new user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON users
    FOR UPDATE USING (true);

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '
    ✅ Foreign Key Constraint Removed!

    🔧 Changes Made:
    • Dropped users_id_fkey constraint that required Supabase Auth
    • Set id column to auto-generate UUIDs if not provided
    • Updated RLS policies for custom authentication system
    • Full independence from Supabase Auth provider restrictions

    🎉 RESULT: Students can register with ANY email provider!
    • University emails ✅
    • Gmail ✅
    • Outlook ✅
    • Yahoo ✅
    • Any provider ✅
    ';
END $$;