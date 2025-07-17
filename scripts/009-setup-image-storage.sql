-- Create storage bucket for card images
-- Run this in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'card-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all images" ON storage.objects
FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'card-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'card-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'card-images';
