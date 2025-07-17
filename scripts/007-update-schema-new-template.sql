-- Update pokemon_cards table to match new CSV template structure
-- This will modify the existing table to match your new requirements

-- First, let's add the new columns we need
ALTER TABLE pokemon_cards 
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0.00;

-- Update column names and structure to match template
-- Note: We'll keep the existing structure but map it properly

-- Drop the old columns we don't need anymore
ALTER TABLE pokemon_cards 
DROP COLUMN IF EXISTS offerable,
DROP COLUMN IF EXISTS hazmat,
DROP COLUMN IF EXISTS cost_per_item;

-- Rename image columns to match template
ALTER TABLE pokemon_cards 
RENAME COLUMN image_url_1 TO image_1;
ALTER TABLE pokemon_cards 
RENAME COLUMN image_url_2 TO image_2;

-- Update the price column to be the listing price, and selling_price is the actual selling price
COMMENT ON COLUMN pokemon_cards.price IS 'Listing/asking price';
COMMENT ON COLUMN pokemon_cards.selling_price IS 'Actual selling price achieved';

-- Update indexes
DROP INDEX IF EXISTS idx_pokemon_cards_category;
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_condition ON pokemon_cards(condition);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_type ON pokemon_cards(type);

-- Update the trigger function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger
DROP TRIGGER IF EXISTS update_pokemon_cards_updated_at ON pokemon_cards;
CREATE TRIGGER update_pokemon_cards_updated_at
    BEFORE UPDATE ON pokemon_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data from your template
INSERT INTO pokemon_cards (
    category,
    sub_category,
    title,
    description,
    quantity,
    type,
    price,
    shipping_profile,
    condition,
    selling_price,
    sku,
    image_1,
    image_2,
    user_id
) VALUES 
(
    'Trading Card Games',
    'Pokémon Cards',
    'Slaking Ex 227/191 Full Art',
    'D',
    1,
    'Buy it Now',
    2.00,
    '0-1 oz',
    'Near Mint',
    9.59,
    NULL,
    NULL,
    NULL,
    (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Verify the updated structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;
