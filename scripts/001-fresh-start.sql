-- Fresh start - Simple Pokemon Card Inventory
-- Run this in your existing Supabase project

-- Create the pokemon_cards table
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Trading Card Games',
  sub_category TEXT NOT NULL DEFAULT 'Pokémon Cards',
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'Buy it Now',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_profile TEXT,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_title ON pokemon_cards(title);

-- Enable Row Level Security
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy - users can manage their own cards
CREATE POLICY "pokemon_cards_policy" ON pokemon_cards
  FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data (optional)
-- This will only work after you create a user account
