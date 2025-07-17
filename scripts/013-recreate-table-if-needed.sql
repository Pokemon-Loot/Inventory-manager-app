-- BACKUP AND RECREATE TABLE (only run if the above script doesn't work)
-- This will preserve your existing data

-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS pokemon_cards_backup AS 
SELECT * FROM pokemon_cards;

-- Drop the existing table (this will also drop the policies)
DROP TABLE IF EXISTS pokemon_cards CASCADE;

-- Recreate the table with the correct structure
CREATE TABLE pokemon_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'Trading Card Games',
    sub_category TEXT NOT NULL DEFAULT 'Pokémon Cards',
    title TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'Buy it Now',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_profile TEXT DEFAULT '0-1 oz',
    condition TEXT NOT NULL DEFAULT 'Near Mint',
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    sku TEXT,
    image_1 TEXT,  -- Correct column name
    image_2 TEXT,  -- Correct column name
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore data from backup (mapping old column names to new ones)
INSERT INTO pokemon_cards (
    id, category, sub_category, title, description, quantity, type, price,
    shipping_profile, condition, selling_price, sku, image_1, image_2,
    user_id, created_at, updated_at
)
SELECT 
    id, category, sub_category, title, description, quantity, type, price,
    shipping_profile, condition, 
    COALESCE(selling_price, price) as selling_price,  -- Use price if selling_price is null
    sku,
    COALESCE(image_url_1, image_1) as image_1,  -- Handle both old and new column names
    COALESCE(image_url_2, image_2) as image_2,  -- Handle both old and new column names
    user_id, created_at, updated_at
FROM pokemon_cards_backup;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_title ON pokemon_cards(title);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_sku ON pokemon_cards(sku) WHERE sku IS NOT NULL;

-- Enable RLS
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "pokemon_cards_policy" ON pokemon_cards
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pokemon_cards_updated_at
    BEFORE UPDATE ON pokemon_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the new structure
SELECT 
    'New Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Show restored data
SELECT 
    'Restored Data Count' as info,
    COUNT(*) as total_cards
FROM pokemon_cards;

-- Drop the backup table (uncomment if you're confident everything worked)
-- DROP TABLE pokemon_cards_backup;
