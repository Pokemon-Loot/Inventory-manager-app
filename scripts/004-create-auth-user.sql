-- This script creates the owner account directly in Supabase Auth
-- Run this in your Supabase SQL Editor

-- Insert user directly into auth.users table
-- Note: This is a simplified approach for development
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'owner@pokemoncards.com',
  crypt('pokemon123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"is_owner": true}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Also insert into auth.identities table
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com'),
  format('{"sub": "%s", "email": "%s"}', (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com'), 'owner@pokemoncards.com')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, user_id) DO NOTHING;
