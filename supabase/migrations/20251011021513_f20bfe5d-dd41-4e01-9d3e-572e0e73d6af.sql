-- Allow admins to delete any estimate
CREATE POLICY "Admins can delete any estimate"
ON public.estimates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));