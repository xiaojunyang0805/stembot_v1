-- Temporarily disable the trigger to test if basic Supabase auth works

-- Disable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '
    ⚠️ User Registration Trigger Temporarily Disabled!

    🔧 Purpose:
    • Test if basic Supabase auth signup works without custom user table logic
    • Isolate whether the issue is in the trigger or elsewhere

    📝 Expected behavior:
    • Auth user should be created successfully in auth.users
    • No corresponding record will be created in public.users table
    • If this works, we know the issue is in our trigger logic

    🚀 This is a diagnostic step!
    ';
END $$;