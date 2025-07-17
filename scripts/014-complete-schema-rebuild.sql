-- COMPLETE POKEMON CARDS TABLE SCHEMA REBUILD
-- This script will completely recreate the table with the correct structure
-- Run this in your Supabase SQL Editor

-- Step 1: Backup existing data (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pokemon_cards') THEN
        -- Create backup table
        DROP TABLE IF EXISTS pokemon_cards_backup;
        CREATE TABLE pokemon_cards_backup AS SELECT * FROM pokemon_cards;
        RAISE NOTICE 'Backed up existing data to pokemon_cards_backup';
    ELSE
        RAISE NOTICE 'No existing pokemon_cards table found';
    END IF;
END $$;

-- Step 2: Drop existing table and all dependencies
DROP TABLE IF EXISTS pokemon_cards CASCADE;
DROP TRIGGER IF EXISTS update_pokemon_cards_updated_at ON pokemon_cards;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Step 3: Create the table with correct structure
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
    image_1 TEXT,
    image_2 TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX idx_pokemon_cards_title ON pokemon_cards(title);
CREATE INDEX idx_pokemon_cards_category ON pokemon_cards(category, sub_category);
CREATE INDEX idx_pokemon_cards_condition ON pokemon_cards(condition);
CREATE INDEX idx_pokemon_cards_type ON pokemon_cards(type);
CREATE INDEX idx_pokemon_cards_sku ON pokemon_cards(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_pokemon_cards_images ON pokemon_cards(image_1, image_2) WHERE image_1 IS NOT NULL OR image_2 IS NOT NULL;

-- Step 5: Enable Row Level Security
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view their own cards" ON pokemon_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards" ON pokemon_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" ON pokemon_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" ON pokemon_cards
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger
CREATE TRIGGER update_pokemon_cards_updated_at
    BEFORE UPDATE ON pokemon_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Restore data from backup (if it exists)
DO $$
DECLARE
    backup_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pokemon_cards_backup'
    ) INTO backup_exists;
    
    IF backup_exists THEN
        -- Insert data from backup, handling different possible column names
        INSERT INTO pokemon_cards (
            id, category, sub_category, title, description, quantity, type, price,
            shipping_profile, condition, selling_price, sku, image_1, image_2,
            user_id, created_at, updated_at
        )
        SELECT 
            id,
            COALESCE(category, 'Trading Card Games') as category,
            COALESCE(sub_category, 'Pokémon Cards') as sub_category,
            title,
            description,
            COALESCE(quantity, 0) as quantity,
            COALESCE(type, 'Buy it Now') as type,
            COALESCE(price, 0.00) as price,
            COALESCE(shipping_profile, '0-1 oz') as shipping_profile,
            COALESCE(condition, 'Near Mint') as condition,
            COALESCE(
                selling_price,  -- Try selling_price first
                cost_per_item,  -- Then cost_per_item
                price,          -- Then price
                0.00            -- Finally default to 0
            ) as selling_price,
            sku,
            COALESCE(
                image_1,        -- Try image_1 first
                image_url_1     -- Then image_url_1
            ) as image_1,
            COALESCE(
                image_2,        -- Try image_2 first
                image_url_2     -- Then image_url_2
            ) as image_2,
            user_id,
            COALESCE(created_at, NOW()) as created_at,
            COALESCE(updated_at, NOW()) as updated_at
        FROM pokemon_cards_backup;
        
        RAISE NOTICE 'Restored % records from backup', (SELECT COUNT(*) FROM pokemon_cards_backup);
    ELSE
        RAISE NOTICE 'No backup data to restore';
    END IF;
END $$;

-- Step 10: Insert sample data if table is empty
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
) 
SELECT 
    'Trading Card Games',
    'Pokémon Cards',
    'Slaking Ex 227/191 Full Art',
    'Full Art Pokemon card in excellent condition',
    1,
    'Buy it Now',
    2.00,
    '0-1 oz',
    'Near Mint',
    9.59,
    'SLAKING-EX-227',
    NULL,
    NULL,
    u.id
FROM auth.users u 
WHERE u.email = 'owner@pokemoncards.com'
AND NOT EXISTS (SELECT 1 FROM pokemon_cards)
LIMIT 1;

-- Step 11: Verification and cleanup
-- Show final table structure
SELECT 
    'FINAL TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    'INDEXES' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pokemon_cards';

-- Show RLS policies
SELECT 
    'RLS POLICIES' as info,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'pokemon_cards';

-- Show data count
SELECT 
    'DATA COUNT' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(image_1) as records_with_image_1,
    COUNT(image_2) as records_with_image_2,
    AVG(price) as avg_price,
    AVG(selling_price) as avg_selling_price
FROM pokemon_cards;

-- Show sample records
SELECT 
    'SAMPLE DATA' as info,
    id,
    title,
    price,
    selling_price,
    image_1 IS NOT NULL as has_image_1,
    image_2 IS NOT NULL as has_image_2,
    created_at
FROM pokemon_cards 
ORDER BY created_at DESC
LIMIT 5;

-- Test insert to verify everything works
INSERT INTO pokemon_cards (
    title,
    price,
    selling_price,
    image_1,
    image_2,
    user_id
) VALUES (
    'Schema Test Card',
    1.00,
    1.50,
    'https://example.com/test1.jpg',
    'https://example.com/test2.jpg',
    (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ SCHEMA REBUILD COMPLETE!';
    RAISE NOTICE '✅ Table: pokemon_cards created with correct structure';
    RAISE NOTICE '✅ Columns: image_1, image_2, selling_price all present';
    RAISE NOTICE '✅ RLS policies enabled';
    RAISE NOTICE '✅ Indexes created';
    RAISE NOTICE '✅ Triggers active';
    RAISE NOTICE '✅ Data restored (if backup existed)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your app should now work correctly!';
    RAISE NOTICE '📝 Backup table "pokemon_cards_backup" preserved for safety';
END $$;
