-- Add UPDATE and DELETE policies for estimates table
CREATE POLICY "Users can update their own estimates"
  ON public.estimates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimates"
  ON public.estimates FOR DELETE
  USING (auth.uid() = user_id);

-- Make user_id NOT NULL for better security enforcement
ALTER TABLE public.estimates 
ALTER COLUMN user_id SET NOT NULL;