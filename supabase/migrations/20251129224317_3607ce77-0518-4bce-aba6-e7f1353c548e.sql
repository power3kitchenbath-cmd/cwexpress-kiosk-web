-- Drop the problematic policies that try to access auth.users
DROP POLICY IF EXISTS "Users can update their own kiosk quotes" ON public.kiosk_quotes;
DROP POLICY IF EXISTS "Users can view their own kiosk quotes" ON public.kiosk_quotes;

-- Recreate them without accessing auth.users table
CREATE POLICY "Users can update their own kiosk quotes"
ON public.kiosk_quotes
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR user_id IS NULL
)
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL
);

CREATE POLICY "Users can view their own kiosk quotes"
ON public.kiosk_quotes
FOR SELECT
USING (
  auth.uid() = user_id 
  OR user_id IS NULL
);