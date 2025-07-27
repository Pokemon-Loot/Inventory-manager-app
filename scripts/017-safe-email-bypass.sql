-- Safe way to create users without email confirmation
-- This creates the user with email_confirmed_at already set

DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Generate a new user ID
    user_id := gen_random_uuid();
    
    -- Insert into auth.users with email already confirmed
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,  -- Set to NOW() to bypass confirmation
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'owner@pokemonloot.com',
        crypt('pokemon123', gen_salt('bf')),
        NOW(),  -- Email confirmed immediately
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"email_confirmed":true}'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW(),  -- Ensure it's confirmed
        updated_at = NOW();
    
    -- Get the actual user ID (in case of conflict)
    SELECT id INTO user_id FROM auth.users WHERE email = 'owner@pokemonloot.com';
    
    -- Insert/update identity
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        user_id,
        format('{"sub":"%s","email":"%s","email_verified":true}', user_id, 'owner@pokemonloot.com')::jsonb,
        'email',
        NOW(),
        NOW()
    ) ON CONFLICT (provider, user_id) DO UPDATE SET
        identity_data = EXCLUDED.identity_data,
        updated_at = NOW();
    
    RAISE NOTICE 'User created with confirmed email: %', user_id;
END $$;

-- Verify the user is ready
SELECT 
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    email_confirmed_at,
    'Ready to login' as status
FROM auth.users 
WHERE email = 'owner@pokemonloot.com';
