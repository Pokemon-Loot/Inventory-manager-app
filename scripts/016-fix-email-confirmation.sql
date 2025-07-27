-- Fix email confirmation issue for the owner account
-- This script ensures the user is created with email already confirmed

-- First, clean up any existing unconfirmed users
DELETE FROM auth.users WHERE email = 'owner@pokemonloot.com' AND email_confirmed_at IS NULL;
DELETE FROM auth.identities WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Create the user with email already confirmed
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Generate a new user ID
    user_id := gen_random_uuid();
    
    -- Insert into auth.users with email_confirmed_at set to NOW()
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,  -- This is the key - set to NOW() to bypass confirmation
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        confirmation_token,
        recovery_token
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
        '{"is_owner":true}',
        '',  -- Empty confirmation token since we're confirming immediately
        ''   -- Empty recovery token
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW(),  -- Ensure it's confirmed
        updated_at = NOW(),
        confirmation_token = '',
        recovery_token = '';
    
    -- Get the actual user ID (in case of conflict)
    SELECT id INTO user_id FROM auth.users WHERE email = 'owner@pokemonloot.com';
    
    -- Clean up and recreate identity
    DELETE FROM auth.identities WHERE user_id = user_id;
    
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
    );
    
    RAISE NOTICE 'User created with email confirmed: %', user_id;
END $$;

-- Verify the user is properly set up
SELECT 
    'User Status' as check_type,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Ready to login'
        ELSE '❌ Email not confirmed'
    END as status
FROM auth.users 
WHERE email = 'owner@pokemonloot.com';

-- Also verify identity
SELECT 
    'Identity Status' as check_type,
    i.provider,
    i.identity_data->>'email_verified' as email_verified_in_identity,
    u.email
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email = 'owner@pokemonloot.com';
