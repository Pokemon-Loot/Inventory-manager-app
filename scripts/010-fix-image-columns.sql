-- Fix image column names to match the code
-- This will rename the existing columns to match what the app expects

-- First, let's see what columns we currently have
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
AND column_name LIKE '%image%'
ORDER BY column_name;

-- Rename the image columns to match the code
ALTER TABLE pokemon_cards 
RENAME COLUMN image_url_1 TO image_1;

ALTER TABLE pokemon_cards 
RENAME COLUMN image_url_2 TO image_2;

-- If the columns don't exist, create them
ALTER TABLE pokemon_cards 
ADD COLUMN IF NOT EXISTS image_1 TEXT;

ALTER TABLE pokemon_cards 
ADD COLUMN IF NOT EXISTS image_2 TEXT;

-- Update any existing data if needed
UPDATE pokemon_cards 
SET image_1 = COALESCE(image_1, '')
WHERE image_1 IS NULL;

UPDATE pokemon_cards 
SET image_2 = COALESCE(image_2, '')
WHERE image_2 IS NULL;

-- Verify the columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
AND column_name IN ('image_1', 'image_2')
ORDER BY column_name;

-- Show a sample of the updated structure
SELECT 
    id,
    title,
    image_1,
    image_2,
    created_at
FROM pokemon_cards 
LIMIT 3;
