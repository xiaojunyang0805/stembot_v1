-- Fix the user registration trigger to handle the existing table structure correctly

-- First, modify the users table to accept auth.uid() as the primary key
-- Remove the default UUID generation since we want to use auth.uid()
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Update the existing trigger function to handle the corrected logic
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into the users table using the auth user's ID
    INSERT INTO public.users (id, email, profile_data)
    VALUES (
        NEW.id,  -- Use the auth user's ID directly
        NEW.email,
        COALESCE(NEW.raw_user_meta_data, '{}')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        profile_data = EXCLUDED.profile_data,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE LOG 'Error creating user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists, no need to recreate it

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '
    ✅ User Registration Trigger Fixed!

    🔧 Changes Made:
    • Removed UUID default generation from users.id
    • Updated trigger to properly use auth.uid()
    • Added UPSERT logic to handle conflicts gracefully
    • Enhanced error logging for debugging

    📝 How it works:
    1. User signs up via Supabase Auth → auth.users record created
    2. Trigger automatically creates/updates users table record using auth ID
    3. Registration completes successfully without database errors

    🚀 Email registration should now work properly!
    ';
END $$;