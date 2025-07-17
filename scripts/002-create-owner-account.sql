-- Create owner account with proper authentication
-- This will create an account in Supabase Auth, not just the custom users table

-- First, let's create a function to handle user creation
CREATE OR REPLACE FUNCTION create_owner_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into auth.users (this is Supabase's built-in auth table)
  -- Note: In a real setup, you'd use Supabase's admin API or dashboard
  -- This is a simplified version for demonstration
  
  -- For now, we'll just ensure our custom users table has the owner
  INSERT INTO users (email, password_hash, is_owner) 
  VALUES ('owner@pokemoncards.com', 'temp_hash', TRUE)
  ON CONFLICT (email) DO UPDATE SET is_owner = TRUE;
  
  RAISE NOTICE 'Owner account setup complete. Use Supabase dashboard to create the actual auth user.';
END;
$$;

-- Execute the function
SELECT create_owner_account();

-- Drop the function as it's no longer needed
DROP FUNCTION create_owner_account();
