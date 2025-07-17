-- Create pokemon_cards table (we'll use Supabase's built-in auth.users instead of custom users table)
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_sku ON pokemon_cards(sku);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);

-- Enable Row Level Security (RLS)
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own cards" ON pokemon_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards" ON pokemon_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" ON pokemon_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" ON pokemon_cards
  FOR DELETE USING (auth.uid() = user_id);
