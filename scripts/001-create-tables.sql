-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pokemon_cards table
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Trading Card Games',
  sub_category TEXT NOT NULL DEFAULT 'Pokémon Cards',
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_profile TEXT,
  offerable BOOLEAN DEFAULT TRUE,
  hazmat BOOLEAN DEFAULT FALSE,
  condition TEXT NOT NULL DEFAULT 'Near Mint',
  cost_per_item DECIMAL(10,2) DEFAULT 0.00,
  sku TEXT UNIQUE,
  image_url_1 TEXT,
  image_url_2 TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert owner user with a simple password hash for "pokemon123"
-- In production, you should use a proper password hashing library
INSERT INTO users (email, password_hash, is_owner) 
VALUES ('owner@pokemoncards.com', '$2a$10$rOvHPGkwQGKqvqvyuuNOHOEHXxmZUjdUIVJ8rJdGJjFQrjQqjQqjQ', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_sku ON pokemon_cards(sku);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);

-- Enable Row Level Security (RLS)
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only see their own cards
CREATE POLICY "Users can only see their own cards" ON pokemon_cards
  FOR ALL USING (auth.uid() = user_id);

-- Create policy for authenticated users to insert their own cards
CREATE POLICY "Users can insert their own cards" ON pokemon_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own cards
CREATE POLICY "Users can update their own cards" ON pokemon_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own cards
CREATE POLICY "Users can delete their own cards" ON pokemon_cards
  FOR DELETE USING (auth.uid() = user_id);
