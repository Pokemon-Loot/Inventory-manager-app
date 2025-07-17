-- Comprehensive schema fix to ensure all columns match the application code
-- This handles various scenarios and ensures consistency

-- First, let's check what we currently have
DO $$
BEGIN
    RAISE NOTICE 'Current pokemon_cards table structure:';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Handle image column naming
DO $$
BEGIN
    -- Check if old column names exist and rename them
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'image_url_1') THEN
        ALTER TABLE pokemon_cards RENAME COLUMN image_url_1 TO image_1;
        RAISE NOTICE 'Renamed image_url_1 to image_1';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'image_url_2') THEN
        ALTER TABLE pokemon_cards RENAME COLUMN image_url_2 TO image_2;
        RAISE NOTICE 'Renamed image_url_2 to image_2';
    END IF;
    
    -- Ensure the columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'image_1') THEN
        ALTER TABLE pokemon_cards ADD COLUMN image_1 TEXT;
        RAISE NOTICE 'Added image_1 column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'image_2') THEN
        ALTER TABLE pokemon_cards ADD COLUMN image_2 TEXT;
        RAISE NOTICE 'Added image_2 column';
    END IF;
END $$;

-- Ensure selling_price column exists and has proper defaults
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'selling_price') THEN
        ALTER TABLE pokemon_cards ADD COLUMN selling_price DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added selling_price column';
    END IF;
    
    -- Update any NULL selling_price values
    UPDATE pokemon_cards 
    SET selling_price = COALESCE(selling_price, 0.00)
    WHERE selling_price IS NULL;
    
    RAISE NOTICE 'Updated selling_price defaults';
END $$;

-- Remove any columns we don't need anymore
DO $$
BEGIN
    -- Remove old columns that might exist from previous versions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'offerable') THEN
        ALTER TABLE pokemon_cards DROP COLUMN offerable;
        RAISE NOTICE 'Dropped offerable column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'hazmat') THEN
        ALTER TABLE pokemon_cards DROP COLUMN hazmat;
        RAISE NOTICE 'Dropped hazmat column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pokemon_cards' AND column_name = 'cost_per_item') THEN
        ALTER TABLE pokemon_cards DROP COLUMN cost_per_item;
        RAISE NOTICE 'Dropped cost_per_item column';
    END IF;
END $$;

-- Ensure all required columns exist with proper types
ALTER TABLE pokemon_cards 
ALTER COLUMN category SET DEFAULT 'Trading Card Games',
ALTER COLUMN sub_category SET DEFAULT 'Pokémon Cards',
ALTER COLUMN quantity SET DEFAULT 0,
ALTER COLUMN type SET DEFAULT 'Buy it Now',
ALTER COLUMN price SET DEFAULT 0.00,
ALTER COLUMN condition SET DEFAULT 'Near Mint',
ALTER COLUMN selling_price SET DEFAULT 0.00;

-- Update indexes to match current column names
DROP INDEX IF EXISTS idx_pokemon_cards_image_url;
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_images ON pokemon_cards(image_1, image_2) WHERE image_1 IS NOT NULL OR image_2 IS NOT NULL;

-- Final verification - show the current structure
RAISE NOTICE 'Final pokemon_cards table structure:';

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Show sample data to verify everything works
SELECT 
    id,
    title,
    price,
    selling_price,
    image_1,
    image_2,
    created_at
FROM pokemon_cards 
LIMIT 3;

RAISE NOTICE 'Schema update completed successfully!';
