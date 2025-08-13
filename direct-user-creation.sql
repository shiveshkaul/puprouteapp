-- Direct User Profile Creation with Auth UUID
-- This creates user profiles directly using the authenticated user's ID

-- Create a function to manually create user profile from auth.users
CREATE OR REPLACE FUNCTION public.create_user_profile_from_auth()
RETURNS JSON AS $$
DECLARE
    auth_user RECORD;
    result JSON;
BEGIN
    -- Get the current authenticated user
    SELECT id, email, raw_user_meta_data 
    INTO auth_user 
    FROM auth.users 
    WHERE id = auth.uid();
    
    IF auth_user.id IS NULL THEN
        RETURN json_build_object('error', 'No authenticated user found');
    END IF;
    
    -- Insert or update user profile
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        created_at,
        updated_at
    ) VALUES (
        auth_user.id,
        auth_user.email,
        COALESCE(
            auth_user.raw_user_meta_data->>'first_name',
            auth_user.raw_user_meta_data->>'full_name',
            split_part(auth_user.email, '@', 1)
        ),
        COALESCE(
            auth_user.raw_user_meta_data->>'last_name',
            ''
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, users.last_name),
        updated_at = NOW()
    RETURNING json_build_object(
        'id', id,
        'email', email,
        'first_name', first_name,
        'last_name', last_name,
        'created_at', created_at,
        'success', true
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile_from_auth() TO authenticated;

-- Test the function (will create/update profile for current auth user)
-- SELECT public.create_user_profile_from_auth();

-- Alternative: Create a simple direct insert policy for users table
DROP POLICY IF EXISTS "Direct auth user insert" ON public.users;
CREATE POLICY "Direct auth user insert" ON public.users
    FOR INSERT 
    WITH CHECK (
        auth.uid() = id AND 
        auth.uid() IS NOT NULL
    );

-- Ensure authenticated users can call this function
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Direct user profile creation function ready! 🎯';
    RAISE NOTICE 'Users can now create profiles directly with their auth UUID.';
END $$;
