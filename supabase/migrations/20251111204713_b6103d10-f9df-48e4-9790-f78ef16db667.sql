-- Drop all existing design files policies
DROP POLICY IF EXISTS "Anyone can view design files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own design files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own design files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own design files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own design files" ON storage.objects;

-- Create new authenticated-only policies
-- Users can view their own files
CREATE POLICY "Users can view their own design files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all design files
CREATE POLICY "Admins can view all design files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-files' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own design files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own files
CREATE POLICY "Users can update their own design files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'design-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own design files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'design-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);