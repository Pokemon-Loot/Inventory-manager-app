-- Fresh start - Pokemon Card Inventory (No Email Verification Required)
-- Run this in your Supabase SQL Editor

-- Create the pokemon_cards table with all your specified fields
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Trading Card Games',
  sub_category TEXT NOT NULL DEFAULT 'Pokémon Cards', 
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'Buy it Now',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_profile TEXT DEFAULT '1 oz',
  offerable BOOLEAN DEFAULT TRUE,
  hazmat BOOLEAN DEFAULT FALSE,
  condition TEXT NOT NULL DEFAULT 'Near Mint',
  cost_per_item DECIMAL(10,2) DEFAULT 0.00,
  sku TEXT,
  image_url_1 TEXT,
  image_url_2 TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_title ON pokemon_cards(title);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_sku ON pokemon_cards(sku) WHERE sku IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policy so users can only see/manage their own cards
DROP POLICY IF EXISTS "pokemon_cards_policy" ON pokemon_cards;
CREATE POLICY "pokemon_cards_policy" ON pokemon_cards
  FOR ALL USING (auth.uid() = user_id);

-- Create a test user directly (no email verification needed)
-- This creates a user that can login immediately
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
        email_confirmed_at,  -- This makes it confirmed immediately
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
        now(),  -- Email confirmed immediately
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Pokemon Owner"}'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = now(),  -- Ensure it's confirmed
        updated_at = now();
    
    -- Get the actual user ID (in case of conflict)
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
    
    -- Insert your example card
    INSERT INTO pokemon_cards (
        category,
        sub_category, 
        title,
        description,
        quantity,
        type,
        price,
        shipping_profile,
        offerable,
        hazmat,
        condition,
        cost_per_item,
        sku,
        user_id
    ) VALUES (
        'Trading Card Games',
        'Pokémon Cards',
        'Rocket Charmander 50/82',
        'Classic Charmander from Team Rocket set',
        1,
        'Buy it Now', 
        20.00,
        '1 oz',
        TRUE,
        FALSE,
        'Near Mint',
        9.59,
        'ROCKET-CHAR-50-82',
        user_id
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Setup complete! User created: owner@pokemoncards.com / pokemon123';
    RAISE NOTICE 'User ID: %', user_id;
END $$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_pokemon_cards_updated_at ON pokemon_cards;
CREATE TRIGGER update_pokemon_cards_updated_at
    BEFORE UPDATE ON pokemon_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 
    'Setup Verification' as status,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'owner@pokemoncards.com';
