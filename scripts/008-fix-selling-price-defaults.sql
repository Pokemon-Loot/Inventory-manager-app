-- Fix existing records that don't have selling_price values
-- This will set selling_price to the same as price for existing records

-- First, make sure the column exists
ALTER TABLE pokemon_cards 
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0.00;

-- Update existing records where selling_price is NULL or 0
-- Set selling_price to match the listing price as a reasonable default
UPDATE pokemon_cards 
SET selling_price = price 
WHERE selling_price IS NULL OR selling_price = 0;

-- Make sure all future records have a default
ALTER TABLE pokemon_cards 
ALTER COLUMN selling_price SET DEFAULT 0.00;

-- Verify the update
SELECT 
    title,
    price,
    selling_price,
    CASE 
        WHEN selling_price IS NULL THEN 'NULL'
        WHEN selling_price = 0 THEN 'ZERO'
        ELSE 'HAS_VALUE'
    END as selling_price_status
FROM pokemon_cards 
ORDER BY created_at DESC
LIMIT 10;
