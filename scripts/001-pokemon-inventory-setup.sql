-- Pokemon Card Inventory Database Setup
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
  auth.uid()
) ON CONFLICT DO NOTHING;

-- Create the cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    set_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(50),
    rarity VARCHAR(100),
    condition VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    purchase_price DECIMAL(10,2),
    market_price DECIMAL(10,2),
    image_url TEXT,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_set_name ON cards(set_name);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see all cards (for demo purposes)
CREATE POLICY "Allow all operations on cards" ON cards
    FOR ALL USING (true);

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

-- Create trigger to automatically update updated_at for cards table
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a demo user account
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'demo@example.com',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert some sample cards
INSERT INTO cards (name, set_name, card_number, rarity, condition, quantity, market_price, image_url) VALUES
('Charizard', 'Base Set', '4/102', 'Rare Holo', 'Near Mint', 1, 350.00, 'https://images.pokemontcg.io/base1/4_hires.png'),
('Blastoise', 'Base Set', '2/102', 'Rare Holo', 'Near Mint', 1, 280.00, 'https://images.pokemontcg.io/base1/2_hires.png'),
('Venusaur', 'Base Set', '15/102', 'Rare Holo', 'Near Mint', 1, 220.00, 'https://images.pokemontcg.io/base1/15_hires.png'),
('Pikachu', 'Base Set', '58/102', 'Common', 'Near Mint', 3, 45.00, 'https://images.pokemontcg.io/base1/58_hires.png')
ON CONFLICT DO NOTHING;
