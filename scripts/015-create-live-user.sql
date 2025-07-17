-- Create the live user account for owner@pokemonloot.com
-- This script sets up the user in the custom users table and provides instructions for Supabase Auth

-- First, let's clean up any existing test data and create the proper user
DELETE FROM users WHERE email IN ('owner@pokemoncards.com', 'owner@pokemonloot.com');

-- Insert the live user into our custom users table
INSERT INTO users (email, password_hash, is_owner, created_at) 
VALUES ('owner@pokemonloot.com', 'temp_hash_will_be_replaced_by_supabase_auth', TRUE, NOW())
ON CONFLICT (email) DO UPDATE SET 
  is_owner = TRUE,
  updated_at = NOW();

-- Display instructions for creating the Supabase Auth user
DO $$
BEGIN
  RAISE NOTICE '=== IMPORTANT: Manual Step Required ===';
  RAISE NOTICE 'You need to create the actual auth user in Supabase:';
  RAISE NOTICE '1. Go to your Supabase Dashboard';
  RAISE NOTICE '2. Navigate to Authentication > Users';
  RAISE NOTICE '3. Click "Add User"';
  RAISE NOTICE '4. Email: owner@pokemonloot.com';
  RAISE NOTICE '5. Password: pokemon123 (or your preferred password)';
  RAISE NOTICE '6. Click "Create User"';
  RAISE NOTICE '7. The user will be created in auth.users table';
  RAISE NOTICE '8. Our custom users table is already set up above';
  RAISE NOTICE '==========================================';
END $$;

-- Verify the user was created in our custom table
SELECT 
  email, 
  is_owner, 
  created_at,
  'User created in custom table - now create in Supabase Auth dashboard' as status
FROM users 
WHERE email = 'owner@pokemonloot.com';
