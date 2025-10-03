-- Temporarily remove all triggers to test basic Supabase auth
-- This will help us isolate if the issue is in our custom code or Supabase itself

-- Drop the trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '
    ⚠️ All User Registration Triggers Removed!

    🔧 Purpose:
    • Test if basic Supabase auth works without any custom database logic
    • Isolate whether the "Database error saving new user" is from our triggers
    • This should allow pure Supabase auth.signUp() to work

    📝 Expected behavior:
    • User should be created successfully in auth.users table only
    • No custom user profile will be created
    • If this works, we know the issue was in our trigger logic

    🚀 Testing basic Supabase auth functionality!
    ';
END $$;