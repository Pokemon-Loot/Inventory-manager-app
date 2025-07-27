-- SAFE way to disable email authentication requirements
-- This works with Supabase's system instead of against it

-- Option 1: Update existing users to bypass email confirmation
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Option 2: Create a function to auto-confirm emails on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm email for new users
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm emails
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify all users are now confirmed
SELECT 
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    'Auto-confirmed' as status
FROM auth.users;
