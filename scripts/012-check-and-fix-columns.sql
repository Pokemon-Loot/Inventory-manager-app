-- First, let's see exactly what columns exist in your pokemon_cards table
SELECT 
    'Current Columns' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Check if the table exists at all
SELECT 
    'Table Exists Check' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'pokemon_cards';

-- Now let's add the missing columns step by step
-- Add image_1 column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pokemon_cards' AND column_name = 'image_1'
    ) THEN
        ALTER TABLE pokemon_cards ADD COLUMN image_1 TEXT;
        RAISE NOTICE 'Added image_1 column';
    ELSE
        RAISE NOTICE 'image_1 column already exists';
    END IF;
END $$;

-- Add image_2 column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pokemon_cards' AND column_name = 'image_2'
    ) THEN
        ALTER TABLE pokemon_cards ADD COLUMN image_2 TEXT;
        RAISE NOTICE 'Added image_2 column';
    ELSE
        RAISE NOTICE 'image_2 column already exists';
    END IF;
END $$;

-- Add selling_price column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pokemon_cards' AND column_name = 'selling_price'
    ) THEN
        ALTER TABLE pokemon_cards ADD COLUMN selling_price DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added selling_price column';
    ELSE
        RAISE NOTICE 'selling_price column already exists';
    END IF;
END $$;

-- If old columns exist, rename them
DO $$
BEGIN
    -- Rename image_url_1 to image_1 if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pokemon_cards' AND column_name = 'image_url_1'
    ) THEN
        ALTER TABLE pokemon_cards RENAME COLUMN image_url_1 TO image_1;
        RAISE NOTICE 'Renamed image_url_1 to image_1';
    END IF;
    
    -- Rename image_url_2 to image_2 if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pokemon_cards' AND column_name = 'image_url_2'
    ) THEN
        ALTER TABLE pokemon_cards RENAME COLUMN image_url_2 TO image_2;
        RAISE NOTICE 'Renamed image_url_2 to image_2';
    END IF;
END $$;

-- Final verification - show all columns
SELECT 
    'Final Column List' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Test insert to make sure everything works
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
) VALUES (
    'Trading Card Games',
    'Pokémon Cards',
    'Test Card - Schema Fix',
    'Testing the schema after column updates',
    1,
    'Buy it Now',
    1.00,
    '0-1 oz',
    'Near Mint',
    1.50,
    'TEST-001',
    'https://example.com/test1.jpg',
    'https://example.com/test2.jpg',
    (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Show the test record
SELECT 
    'Test Record' as info,
    title,
    image_1,
    image_2,
    selling_price
FROM pokemon_cards 
WHERE title = 'Test Card - Schema Fix';
