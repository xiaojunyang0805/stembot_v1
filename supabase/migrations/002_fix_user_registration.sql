-- Fix user registration by adding automatic user profile creation
-- This migration ensures that when a user signs up via Supabase Auth,
-- a corresponding record is automatically created in the users table

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into the existing users table structure
    INSERT INTO public.users (id, email, profile_data)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data, '{}')
    )
    ON CONFLICT (id) DO NOTHING; -- Handle duplicate key errors gracefully

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '
    ✅ User Registration Fix Applied!

    🔧 Changes Made:
    • Created automatic user profile creation trigger
    • Enhanced error handling for registration process

    📝 How it works:
    1. User signs up via Supabase Auth → auth.users record created
    2. Trigger automatically creates corresponding users table record
    3. Registration completes successfully without database errors

    🚀 Email registration should now work properly!
    ';
END $$;