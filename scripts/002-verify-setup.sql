-- Verification script to check if everything is set up correctly
-- Run this in your Supabase SQL Editor to verify your setup

-- Check if pokemon_cards table exists and show structure
SELECT 
    'Table Structure Check' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pokemon_cards' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'pokemon_cards';

-- Check existing policies
SELECT 
    'RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'pokemon_cards';

-- Check if there are any existing cards
SELECT 
    'Data Check' as check_type,
    COUNT(*) as total_cards,
    COUNT(DISTINCT user_id) as unique_users
FROM pokemon_cards;

-- Check indexes
SELECT 
    'Index Check' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pokemon_cards';

-- Sample the first few cards if any exist
SELECT 
    'Sample Data' as check_type,
    id,
    title,
    category,
    sub_category,
    price,
    quantity,
    created_at
FROM pokemon_cards 
LIMIT 3;
