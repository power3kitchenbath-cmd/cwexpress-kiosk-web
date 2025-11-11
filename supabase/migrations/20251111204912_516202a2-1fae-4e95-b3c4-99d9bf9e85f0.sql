-- Make design-files bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'design-files';

-- Remove the public read policy if it exists
DROP POLICY IF EXISTS "Anyone can view design files" ON storage.objects;