-- Fix the SKU unique constraint issue
-- This allows duplicate SKUs or handles them properly

-- Option 1: Remove the unique constraint on SKU (recommended for bulk uploads)
ALTER TABLE pokemon_cards DROP CONSTRAINT IF EXISTS pokemon_cards_sku_key;
ALTER TABLE pokemon_cards DROP CONSTRAINT IF EXISTS pokemon_cards_sku_unique;

-- Option 2: Make SKU unique only when it's not null/empty
-- First drop existing constraint
DO $$
BEGIN
    -- Drop any existing unique constraints on SKU
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'pokemon_cards' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%sku%'
    ) THEN
        ALTER TABLE pokemon_cards DROP CONSTRAINT pokemon_cards_sku_key;
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Constraint doesn't exist, continue
        NULL;
END $$;

-- Create a partial unique index instead (only for non-empty SKUs)
DROP INDEX IF EXISTS idx_pokemon_cards_sku_unique;
CREATE UNIQUE INDEX idx_pokemon_cards_sku_unique 
ON pokemon_cards(sku) 
WHERE sku IS NOT NULL AND sku != '';

-- Update existing records to handle duplicate SKUs
-- Add a suffix to make them unique
WITH duplicate_skus AS (
    SELECT sku, user_id, 
           ROW_NUMBER() OVER (PARTITION BY sku, user_id ORDER BY created_at) as rn
    FROM pokemon_cards 
    WHERE sku IS NOT NULL AND sku != ''
)
UPDATE pokemon_cards 
SET sku = CASE 
    WHEN d.rn > 1 THEN pokemon_cards.sku || '-' || d.rn::text
    ELSE pokemon_cards.sku
END
FROM duplicate_skus d
WHERE pokemon_cards.sku = d.sku 
AND pokemon_cards.user_id = d.user_id
AND d.rn > 1;

-- Show the updated structure
SELECT 
    'SKU Constraint Status' as info,
    COUNT(*) as total_cards,
    COUNT(DISTINCT sku) as unique_skus,
    COUNT(sku) as cards_with_sku
FROM pokemon_cards;

RAISE NOTICE 'SKU constraint fixed! Now allows duplicate/empty SKUs for bulk uploads.';
