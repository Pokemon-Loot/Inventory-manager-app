-- Simple and reliable owner account creation
-- Run this in your Supabase SQL Editor

-- First, let's make sure we can insert into auth tables
-- This creates the user with a simple approach

DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Generate a new user ID
    user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'owner@pokemoncards.com',
        crypt('pokemon123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        updated_at = now();
    
    -- Get the user ID (in case of conflict)
    SELECT id INTO user_id FROM auth.users WHERE email = 'owner@pokemoncards.com';
    
    -- Insert into auth.identities
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
        format('{"sub":"%s","email":"%s"}', user_id, 'owner@pokemoncards.com')::jsonb,
        'email',
        now(),
        now()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
    
    RAISE NOTICE 'User created successfully with ID: %', user_id;
END $$;

-- Verify the user was created
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'owner@pokemoncards.com';
